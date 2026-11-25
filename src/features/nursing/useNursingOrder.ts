// src/features/nursing/useNursingOrder.ts
//
// One request, kept live: the status call (GET /patient/requests/{id}/status) now and then, and the websocket pushes in between. The native app
// polls every 2 s (10 s while the socket is up); the pages that only show an order (Booked, Order) poll every 15 s. A failing poll is never given up: it waits longer each time (up to 30 s) and retries at once when the browser comes back online or the tab is shown again.
// A websocket order push carries the visits without the codes / tasks the status call adds, so what was already known is kept (mergeVisits).
import { useCallback, useEffect, useRef, useState } from 'react'
import { openNursingSocket, type NursingSocket } from './nursingSocket'
import { fetchOrder, nursingErrorMessage, normaliseOrder, type NursingOrder, type OrderVisit } from './nursingService'

const mergeVisits = (prev: OrderVisit[] | undefined, next: OrderVisit[] | undefined): OrderVisit[] => {
	if (!next) return prev ?? []
	if (!prev) return next
	// A push carries the visits without what the status call adds (codes, tasks, timeline): those are kept. Everything else (can_cancel,
	// status ...) is taken from the newest answer as it is, so a flag that changes in a push is never left old.
	const KEPT = ['start_code', 'completion_code', 'tasks', 'timeline'] as const
	return next.map((v) => {
		const old = prev.find((o) => o.visit_public_id === v.visit_public_id)
		if (!old) return v
		const kept: Partial<OrderVisit> = {}
		for (const key of KEPT) if (v[key] === undefined && old[key] !== undefined) Object.assign(kept, { [key]: old[key] })
		return { ...v, ...kept }
	})
}

interface Options {
	/** Poll period in ms while there is no socket (the matching and tracking pages: 2000; the order pages: 15000). */
	pollMs?: number
	/** Poll period in ms while the socket is connected. */
	pollWithSocketMs?: number
	/** Open the websocket (the matching and tracking pages do; the order pages just poll). */
	live?: boolean
	/** Stop polling once the order is over (cancelled, completed ...): it will not change again. */
	stopWhenDone?: boolean
}

const DONE = /^(COMPLETED|CANCELLED|CANCELLED_BY_PATIENT|CANCELLED_BY_PROVIDER|EXPIRED|FAILED)$/
const MAX_BACKOFF_MS = 30000

export function useNursingOrder(requestId: string | undefined, { pollMs = 15000, pollWithSocketMs = 15000, live = false, stopWhenDone = true }: Options = {}) {
	const [order, setOrder] = useState<NursingOrder | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	/** The status call is failing right now (the page shows "Reconnecting" and keeps trying). */
	const [reconnecting, setReconnecting] = useState(false)
	const orderRef = useRef<NursingOrder | null>(null)
	const socketRef = useRef<NursingSocket | null>(null)
	/** The clock at the last answer, so a page can count on from the server's `searching_seconds` between polls. */
	const [heardAt, setHeardAt] = useState(0)

	const apply = useCallback((incoming: NursingOrder) => {
		const prev = orderRef.current
		const next = { ...normaliseOrder(incoming), visits: mergeVisits(prev?.visits, incoming.visits) }
		orderRef.current = next
		setOrder(next)
		setHeardAt(Date.now())
	}, [])

	const reload = useCallback(async () => {
		if (!requestId) return
		try {
			apply(await fetchOrder(requestId))
			setError(null)
		} catch (e) {
			setError(nursingErrorMessage(e, 'We could not load this booking.'))
			throw e
		} finally {
			setLoading(false)
		}
	}, [requestId, apply])

	// A new request id starts from scratch.
	useEffect(() => {
		orderRef.current = null
		setOrder(null)
		setLoading(!!requestId)
		setError(null)
	}, [requestId])

	// Status polling.
	useEffect(() => {
		if (!requestId) return
		let alive = true
		let failures = 0
		let last = 0
		const tick = async (now = false) => {
			if (!alive) return
			if (stopWhenDone && orderRef.current && DONE.test(String(orderRef.current.status).toUpperCase())) return
			// after a failure the wait grows (x2, x4, x8 ... up to 30 s); it never stops
			const base = socketRef.current?.isConnected() ? pollWithSocketMs : pollMs
			const wait = failures > 0 ? Math.min(base * 2 ** Math.min(failures, 4), MAX_BACKOFF_MS) : base
			if (!now && Date.now() - last < wait - 100) return
			last = Date.now()
			try {
				await reload()
				failures = 0
				if (alive) setReconnecting(false)
			} catch {
				failures += 1
				if (alive) setReconnecting(true)
			}
		}
		void tick()
		const id = setInterval(() => void tick(), Math.min(pollMs, 2000))
		// the network came back, or the tab is shown again: try now instead of waiting out the backoff
		const retryNow = () => {
			if (document.visibilityState === 'hidden') return
			failures = 0
			void tick(true)
		}
		window.addEventListener('online', retryNow)
		document.addEventListener('visibilitychange', retryNow)
		return () => {
			alive = false
			clearInterval(id)
			window.removeEventListener('online', retryNow)
			document.removeEventListener('visibilitychange', retryNow)
		}
	}, [requestId, reload, pollMs, pollWithSocketMs, stopWhenDone])

	// The websocket.
	useEffect(() => {
		if (!requestId || !live) return
		const socket = openNursingSocket(requestId, (event) => {
			if (event.type === 'CARE_REQUEST_STATUS_CHANGE' && event.data) apply(event.data as NursingOrder)
		})
		socketRef.current = socket
		return () => {
			socketRef.current = null
			socket.close()
		}
	}, [requestId, live, apply])

	return { order, loading, error, reconnecting, reload, heardAt, setOrder: apply }
}
