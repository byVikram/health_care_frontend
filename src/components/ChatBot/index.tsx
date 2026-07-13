// src/components/ChatBot/index.tsx
import React, { useState } from 'react'
import FloatingChatButton from './FloatingChatButton'
import ChatWindow from './ChatWindow'
import { Message } from './ChatMessage'
import {
	createSession,
	listSessions,
	getSession,
	sendMessageStream,
	logFeedback
} from '../../services/chatbotService'
import { ChatSessionResponse } from '../../types/chatbot'

export default function ChatBot() {
	const [isOpen, setIsOpen] = useState(false)
	const [sessionId, setSessionId] = useState<string | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [sessions, setSessions] = useState<ChatSessionResponse[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const isInitializing = React.useRef(false)

	// Fetch existing session or create a new one on opening the chatbot
	const initChatbotSession = async () => {
		if (isInitializing.current) return
		isInitializing.current = true
		try {
			// Check if we already have a session ID locally cached
			let activeSessionId = sessionId || localStorage.getItem('careai_session_id')
			let sessionDetails = null
			let isNewSession = false

			if (activeSessionId) {
				try {
					sessionDetails = await getSession(activeSessionId)
				} catch (err) {
					// Session invalid (e.g. 403 Forbidden because of user change, or 404 deleted)
					console.warn('Session invalid, clearing and fetching/creating a fresh session:', err)
					localStorage.removeItem('careai_session_id')
					activeSessionId = null
				}
			}

			// Pre-fetch all user sessions to populate history list
			const list = await listSessions()
			setSessions(list)

			if (!activeSessionId) {
				if (list && list.length > 0) {
					activeSessionId = list[0].id
				} else {
					// No sessions exist at all, create a new one
					const newSession = await createSession('New Conversation')
					activeSessionId = newSession.id
					isNewSession = true
					
					// Re-fetch list to include the newly created session
					const updatedList = await listSessions()
					setSessions(updatedList)
				}
			}

			if (activeSessionId) {
				setSessionId(activeSessionId)
				localStorage.setItem('careai_session_id', activeSessionId)

				if (!sessionDetails && !isNewSession) {
					sessionDetails = await getSession(activeSessionId)
				}

				if (sessionDetails && sessionDetails.messages) {
					const mappedMessages: Message[] = sessionDetails.messages.map((msg) => ({
						id: msg.id,
						sender: msg.role === 'user' ? 'user' : 'bot',
						text: msg.content,
						timestamp: new Date(msg.created_at),
						sources: msg.sources,
						structured_payload: msg.structured_payload,
						is_helpful: msg.is_helpful,
						feedback_comments: msg.feedback_comments,
					}))
					setMessages(mappedMessages)
				} else {
					setMessages([])
				}
			}
		} catch (err) {
			console.error('Failed to initialize chatbot session:', err)
		} finally {
			isInitializing.current = false
		}
	}

	// Initialize session once when layout mounts
	React.useEffect(() => {
		initChatbotSession()
	}, [])

	const handleOpen = () => {
		setIsOpen(true)
		// Safe fallback: trigger refresh if somehow not set
		if (!sessionId) {
			initChatbotSession()
		} else {
			// Trigger fresh load of history list when chat is opened
			handleLoadSessions()
		}
	}

	const handleClose = () => {
		setIsOpen(false)
	}

	const handleNewChat = async () => {
		if (isInitializing.current) return
		try {
			setIsLoading(true)
			const newSession = await createSession('New Conversation')
			setSessionId(newSession.id)
			localStorage.setItem('careai_session_id', newSession.id)
			setMessages([])
			
			// Refresh history list
			const list = await listSessions()
			setSessions(list)
		} catch (err) {
			console.error('Failed to create new chat session:', err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSelectSession = async (id: string) => {
		try {
			setIsLoading(true)
			setSessionId(id)
			localStorage.setItem('careai_session_id', id)
			const sessionDetails = await getSession(id)
			if (sessionDetails && sessionDetails.messages) {
				const mappedMessages: Message[] = sessionDetails.messages.map((msg) => ({
					id: msg.id,
					sender: msg.role === 'user' ? 'user' : 'bot',
					text: msg.content,
					timestamp: new Date(msg.created_at),
					sources: msg.sources,
					structured_payload: msg.structured_payload,
					is_helpful: msg.is_helpful,
					feedback_comments: msg.feedback_comments,
				}))
				setMessages(mappedMessages)
			} else {
				setMessages([])
			}
		} catch (err) {
			console.error('Failed to load selected session:', err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleLoadSessions = async () => {
		try {
			const list = await listSessions()
			setSessions(list)
		} catch (err) {
			console.error('Failed to load sessions:', err)
		}
	}

	const handleSend = async (text: string) => {
		if (!text.trim()) return

		// 1. Immediately render user message bubble and bot placeholder to prevent freeze
		const userMsg: Message = {
			id: `${Date.now()}-user`,
			sender: 'user',
			text,
			timestamp: new Date(),
		}
		const botMessageId = `${Date.now()}-bot`
		const initialBotMsg: Message = {
			id: botMessageId,
			sender: 'bot',
			text: '',
			timestamp: new Date(),
		}
		setMessages((prev) => [...prev, userMsg, initialBotMsg])
		setIsLoading(true)

		let currentSessionId = sessionId
		try {
			// If for some reason we don't have a session ID, create one first
			if (!currentSessionId) {
				const newSession = await createSession('New Conversation')
				currentSessionId = newSession.id
				setSessionId(newSession.id)
				localStorage.setItem('careai_session_id', newSession.id)
			}

			// Stream message response
			await sendMessageStream(
				currentSessionId,
				text,
				(chunkText) => {
					setMessages((prev) =>
						prev.map((msg) =>
							msg.id === botMessageId
								? { ...msg, text: msg.text + chunkText }
								: msg
						)
					)
				},
				(payload) => {
					setMessages((prev) =>
						prev.map((msg) =>
							msg.id === botMessageId
								? {
										...msg,
										text: payload.answer || msg.text,
										sources: payload.sources,
										structured_payload: payload,
								  }
								: msg
						)
					)
					setIsLoading(false)
					// Refresh titles list as the backend may auto-name the conversation on first prompt
					void handleLoadSessions()
				},
				(err) => {
					setMessages((prev) =>
						prev.map((msg) =>
							msg.id === botMessageId
								? {
										...msg,
										text: 'Sorry, I encountered an issue connecting to the server. Please try again.',
								  }
								: msg
						)
					)
					setIsLoading(false)
				}
			)
		} catch (err) {
			console.error('Failed to send message:', err)
			setIsLoading(false)
		}
	}

	const handleFeedbackSubmit = async (messageId: string, isHelpful: boolean, comments?: string) => {
		try {
			await logFeedback(messageId, isHelpful, comments)
			// Update local state to reflect log success
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === messageId
						? { ...msg, is_helpful: isHelpful, feedback_comments: comments }
						: msg
				)
			)
		} catch (err) {
			console.error('Failed to submit feedback:', err)
		}
	}

	return (
		<>
			{/* Floating button visible when the chat window is closed */}
			<FloatingChatButton onClick={handleOpen} visible={!isOpen} />

			{/* Chat window panel visible when open */}
			<ChatWindow
				open={isOpen}
				onNewChat={handleNewChat}
				onClose={handleClose}
				messages={messages}
				onSend={handleSend}
				isLoading={isLoading}
				onFeedbackSubmit={handleFeedbackSubmit}
				sessions={sessions}
				activeSessionId={sessionId}
				onSelectSession={handleSelectSession}
				onLoadSessions={handleLoadSessions}
			/>
		</>
	)
}
export type { Message }
