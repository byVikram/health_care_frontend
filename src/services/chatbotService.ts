// src/services/chatbotService.ts
import ApiService from './apiService'
import { API_ENDPOINTS } from '../constants/apiUrls'
import {
	ChatSessionResponse,
	ChatMessageResponse,
	ChatTurnResponse
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
 * Send a message and get the assistant's full reply (answer + structured details).
 * The chat UI shows its own inline error, so the global error toast is suppressed.
 */
export async function sendMessage(sessionId: string, message: string): Promise<ChatTurnResponse> {
	const res = await ApiService.post<ApiResponseWrapper<ChatTurnResponse>>(
		API_ENDPOINTS.CHATBOT.SEND_MESSAGE(sessionId),
		{ message },
		{ suppressErrorToast: true }
	)
	return res.data.data
}
