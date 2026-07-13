// src/services/chatbotService.ts
import ApiService, { API_BASE_URL } from './apiService'
import { API_ENDPOINTS } from '../constants/apiUrls'
import {
	ChatSessionResponse,
	ChatMessageResponse,
	ChatResponse
} from '../types/chatbot'

interface ApiResponseWrapper<T> {
	success: boolean
	message: string
	data: T
}

/**
 * Create a new chatbot conversation session.
 */
export async function createSession(title?: string): Promise<ChatSessionResponse> {
	const res = await ApiService.post<ApiResponseWrapper<ChatSessionResponse>>(
		API_ENDPOINTS.CHATBOT.SESSIONS,
		{ title }
	)
	return res.data.data
}

/**
 * List all chatbot sessions for the authenticated user.
 */
export async function listSessions(): Promise<ChatSessionResponse[]> {
	const res = await ApiService.get<ApiResponseWrapper<ChatSessionResponse[]>>(
		API_ENDPOINTS.CHATBOT.SESSIONS
	)
	return res.data.data
}

/**
 * Get a single chatbot session's details and message history.
 */
export async function getSession(id: string): Promise<ChatSessionResponse> {
	const res = await ApiService.get<ApiResponseWrapper<ChatSessionResponse>>(
		API_ENDPOINTS.CHATBOT.SESSION_DETAIL(id)
	)
	return res.data.data
}

/**
 * Delete a chatbot session.
 */
export async function deleteSession(id: string): Promise<void> {
	await ApiService.delete(API_ENDPOINTS.CHATBOT.SESSION_DETAIL(id))
}

/**
 * Submit feedback for a chatbot message.
 */
export async function logFeedback(
	messageId: string,
	isHelpful: boolean,
	comments?: string
): Promise<ChatMessageResponse> {
	const res = await ApiService.post<ApiResponseWrapper<ChatMessageResponse>>(
		API_ENDPOINTS.CHATBOT.LOG_FEEDBACK(messageId),
		{ is_helpful: isHelpful, comments }
	)
	return res.data.data
}

/**
 * Send a message and stream the response word-by-word, ending with structured metadata.
 */
export async function sendMessageStream(
	sessionId: string,
	message: string,
	onChunk: (text: string) => void,
	onStructured: (payload: ChatResponse) => void,
	onError: (err: any) => void
): Promise<void> {
	try {
		const token = localStorage.getItem('access_token')
		const baseUrl = API_BASE_URL || 'http://localhost:8000'
		const url = `${baseUrl}${API_ENDPOINTS.CHATBOT.SEND_MESSAGE(sessionId)}`

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : '',
			},
			body: JSON.stringify({ message }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const reader = response.body?.getReader()
		if (!reader) {
			throw new Error('ReadableStream not supported')
		}

		const decoder = new TextDecoder('utf-8')
		let buffer = ''

		while (true) {
			const { done, value } = await reader.read()
			if (done) break

			buffer += decoder.decode(value, { stream: true })
			const lines = buffer.split('\n')
			// Keep the last partial line in the buffer
			buffer = lines.pop() || ''

			for (const line of lines) {
				const trimmed = line.trim()
				if (trimmed.startsWith('data:')) {
					const dataStr = trimmed.slice(5).trim()
					if (!dataStr) continue
					try {
						const parsed = JSON.parse(dataStr)
						if (parsed.type === 'content') {
							onChunk(parsed.delta)
						} else if (parsed.type === 'structured') {
							onStructured(parsed.payload)
						}
					} catch (e) {
						console.error('Error parsing SSE data:', e, dataStr)
					}
				}
			}
		}
	} catch (error) {
		console.error('Error in sendMessageStream:', error)
		onError(error)
	}
}
