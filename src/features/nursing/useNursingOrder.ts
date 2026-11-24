// src/features/nursing/useNursingOrder.ts
//
// One request, kept live: the status call (GET /patient/requests/{id}/status) now and then, and the websocket pushes in between. The native app
// polls every 2 s (10 s while the socket is up); the pages that only show an order (Booked, Order) poll every 15 s and stop after a few failures.
// A websocket order push carries the visits without the codes / tasks the status call adds, so what was already known is kept (mergeVisits).
import { useCallback, useEffect, useRef, useState } from 'react'
import { openNursingSocket, type NursingSocket } from './nursingSocket'
import { fetchOrder, nursingErrorMessage, normaliseOrder, type NursingOrder, type OrderVisit } from './nursingService'

const mergeVisits = (prev: OrderVisit[] | undefined, next: OrderVisit[] | undefined): OrderVisit[] => {
	if (!next) return prev ?? []
	if (!prev) return next
	return next.map((v) => ({ ...(prev.find((o) => o.visit_public_id === v.visit_public_id) ?? {}), ...v }))
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
const MAX_FAILURES = 3

export function useNursingOrder(requestId: string | undefined, { pollMs = 15000, pollWithSocketMs = 15000, live = false, stopWhenDone = true }: Options = {}) {
	const [order, setOrder] = useState<NursingOrder | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
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
		const tick = async () => {
			if (!alive) return
			if (stopWhenDone && orderRef.current && DONE.test(String(orderRef.current.status).toUpperCase())) return
			const wait = socketRef.current?.isConnected() ? pollWithSocketMs : pollMs
			if (Date.now() - last < wait - 100) return
			last = Date.now()
			try {
				await reload()
				failures = 0
			} catch {
				failures += 1
			}
		}
		void tick()
		const id = setInterval(() => {
			if (failures >= MAX_FAILURES) return
			void tick()
		}, Math.min(pollMs, 2000))
		return () => {
			alive = false
			clearInterval(id)
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

	return { order, loading, error, reload, heardAt, setOrder: apply }
}
