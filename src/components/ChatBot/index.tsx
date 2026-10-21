// src/components/ChatBot/index.tsx
import React, { useState } from 'react'
import FloatingChatButton from './FloatingChatButton'
import ChatWindow from './ChatWindow'
import { Message } from './ChatMessage'
import {
	createSession,
	listSessions,
	getSession,
	sendMessage,
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
	// Tracks whether `sessions` currently reflects the backend, so repeated
	// "open history" clicks don't re-issue listSessions() for data we already have.
	const sessionsLoadedRef = React.useRef(false)

	// Fetch existing session or create a new one. Called lazily on first open
	// (see handleOpen) rather than on mount, since most page loads never open
	// the widget at all.
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
			sessionsLoadedRef.current = true

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

	// Session init is intentionally lazy: ChatBot is mounted in NavbarLayout on
	// every authenticated page, so running this on mount would hit the
	// sessions/create/get APIs on every page load even if the user never
	// opens the widget. Run it on first open instead.
	const handleOpen = () => {
		setIsOpen(true)
		if (!sessionId) {
			initChatbotSession()
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

			// Refresh history list — a new session was just added, so this one
			// genuinely needs fresh data (unlike the History toggle, which reuses
			// whatever's already loaded).
			const list = await listSessions()
			setSessions(list)
			sessionsLoadedRef.current = true
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

	// Used by the History panel toggle. Sessions are patched locally as titles
	// change (see handleSend's onSessionTitle), so once loaded there's nothing
	// left to go stale — skip the refetch on repeat opens.
	const handleLoadSessions = async () => {
		if (sessionsLoadedRef.current) return
		try {
			const list = await listSessions()
			setSessions(list)
			sessionsLoadedRef.current = true
		} catch (err) {
			console.error('Failed to load sessions:', err)
		}
	}

	const handleSend = async (text: string) => {
		if (!text.trim()) return

		// Render the user's bubble immediately; the typing indicator covers the wait for the reply.
		const userMsg: Message = {
			id: `${Date.now()}-user`,
			sender: 'user',
			text,
			timestamp: new Date(),
		}
		setMessages((prev) => [...prev, userMsg])
		setIsLoading(true)

		let currentSessionId = sessionId
		try {
			// If for some reason we don't have a session ID, create one first
			if (!currentSessionId) {
				const newSession = await createSession('New Conversation')
				currentSessionId = newSession.id
				setSessionId(newSession.id)
				localStorage.setItem('careai_session_id', newSession.id)
				// Keep the cached sessions list in sync — sessionsLoadedRef being true
				// would otherwise skip a real refetch later and this session would
				// never show up in History.
				setSessions((prev) => [newSession, ...prev])
			}

			const turn = await sendMessage(currentSessionId, text)
			// Use the server's message id so feedback on this reply hits the real record.
			const botMsg: Message = {
				id: turn.message_id,
				sender: 'bot',
				text: turn.answer,
				timestamp: new Date(),
				sources: turn.payload.sources,
				structured_payload: turn.payload,
			}
			setMessages((prev) => [...prev, botMsg])

			// Backend auto-names new conversations on the first prompt — patch the title in
			// place instead of refetching the whole session list.
			setSessions((prev) =>
				prev.map((session) =>
					session.id === currentSessionId ? { ...session, title: turn.session_title } : session
				)
			)
		} catch (err) {
			console.error('Failed to send message:', err)
			setMessages((prev) => [
				...prev,
				{
					id: `${Date.now()}-error`,
					sender: 'bot',
					text: 'Sorry, I encountered an issue connecting to the server. Please try again.',
					timestamp: new Date(),
				},
			])
		} finally {
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
