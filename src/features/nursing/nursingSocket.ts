// src/features/nursing/nursingSocket.ts
//
// The live channel of one request: ws(s)://<api>/api/ancillary/ws/patient/requests/{id}. The server wants the first message to be
// {"type":"auth","token":<access token>} (the token never goes in the URL), answers {"type":"AUTH_OK"} and then pushes
// {"type":"CARE_REQUEST_STATUS_CHANGE","data":<the status payload>}. It reconnects with a growing wait when the connection drops, rereading the
// token each time, and stops for good on the close codes the server uses for "this will never work" (4401 not signed in, 4403 not yours,
// 4404 no such request). Same behaviour as the native app's utils/authedSocket.ts.
import { API_BASE_URL } from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'

const FATAL_CLOSE_CODES = new Set([4401, 4403, 4404])
const MAX_BACKOFF_MS = 30_000

export type NursingSocket = {
	close: () => void
	/** True once the server accepted the handshake and until the connection drops: pushes are arriving. */
	isConnected: () => boolean
}

const wsUrlOf = (requestId: string): string => {
	const base = API_BASE_URL || window.location.origin
	return `${base.replace(/^http/, 'ws')}${API_ENDPOINTS.ANCILLARY.WS_PATIENT_REQUEST(requestId)}`
}

/** Opens the channel of a request; `onEvent` gets every parsed push. Call `close()` when the page goes away. */
export function openNursingSocket(requestId: string, onEvent: (event: { type?: string; data?: unknown }) => void): NursingSocket {
	let socket: WebSocket | null = null
	let closedByCaller = false
	let retryTimer: ReturnType<typeof setTimeout> | null = null
	let attempt = 0
	let authenticated = false

	const scheduleReconnect = () => {
		if (closedByCaller) return
		const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt)
		attempt += 1
		retryTimer = setTimeout(connect, delay)
	}

	function connect() {
		if (closedByCaller) return
		const token = localStorage.getItem('access_token')
		if (!token) return
		let ws: WebSocket
		try {
			ws = new WebSocket(wsUrlOf(requestId))
		} catch {
			scheduleReconnect()
			return
		}
		socket = ws
		ws.onopen = () => {
			attempt = 0
			ws.send(JSON.stringify({ type: 'auth', token }))
		}
		ws.onmessage = (message) => {
			try {
				const event = JSON.parse(String(message.data)) as { type?: string; data?: unknown }
				if (event?.type === 'AUTH_OK') {
					authenticated = true
					return
				}
				onEvent(event)
			} catch {
				// a frame that is not JSON is ignored
			}
		}
		ws.onerror = () => {
			// onclose follows and drives the retry
		}
		ws.onclose = (closeEvent) => {
			if (socket === ws) {
				socket = null
				authenticated = false
			}
			if (closedByCaller || FATAL_CLOSE_CODES.has(closeEvent.code)) return
			scheduleReconnect()
		}
	}

	connect()

	return {
		isConnected: () => authenticated && socket?.readyState === WebSocket.OPEN,
		close: () => {
			closedByCaller = true
			if (retryTimer) clearTimeout(retryTimer)
			socket?.close()
		},
	}
}
