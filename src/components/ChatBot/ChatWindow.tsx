// src/components/ChatBot/ChatWindow.tsx
import React, { useRef, useEffect, useState } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import HistoryIcon from '@mui/icons-material/History'
import ChatHeader from './ChatHeader'
import ChatMessage, { Message } from './ChatMessage'
import SuggestedActions from './SuggestedActions'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'
import { ChatSessionResponse } from '../../types/chatbot'

interface ChatWindowProps {
	onNewChat: () => void
	onClose: () => void
	messages: Message[]
	onSend: (text: string) => void
	open: boolean
	isLoading?: boolean
	onFeedbackSubmit?: (messageId: string, isHelpful: boolean, comments?: string) => void
	sessions?: ChatSessionResponse[]
	activeSessionId?: string | null
	onSelectSession?: (sessionId: string) => void
	onLoadSessions?: () => void
}

export default function ChatWindow({
	onNewChat,
	onClose,
	messages,
	onSend,
	open,
	isLoading,
	onFeedbackSubmit,
	sessions = [],
	activeSessionId,
	onSelectSession,
	onLoadSessions,
}: ChatWindowProps) {
	const messageEndRef = useRef<HTMLDivElement>(null)
	const [showHistory, setShowHistory] = useState(false)

	useEffect(() => {
		if (open) {
			messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}, [messages, open])

	if (!open) return null

	const handleToggleHistory = () => {
		setShowHistory((prev) => {
			const nextVal = !prev
			if (nextVal && onLoadSessions) {
				onLoadSessions()
			}
			return nextVal
		})
	}

	const formatDate = (dateStr: string) => {
		try {
			const date = new Date(dateStr)
			return date.toLocaleDateString(undefined, {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		} catch (e) {
			return dateStr
		}
	}

	return (
		<Box
			sx={{
				position: 'fixed',
				bottom: 24,
				right: 24,
				width: 430,
				height: 640,
				maxHeight: 'calc(100vh - 112px)', // 64px header + 24px top gap + 24px bottom gap
				bgcolor: 'background.paper',
				borderRadius: '24px',
				boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
				display: 'flex',
				flexDirection: 'column',
				zIndex: 9999,
				overflow: 'hidden',
				border: '1px solid',
				borderColor: 'divider',
				// Responsive styling for smaller screens
				'@media (max-width: 480px)': {
					right: 16,
					bottom: 16,
					width: 'calc(100% - 32px)',
					height: 'calc(100vh - 104px)', // 64px header + 24px top gap + 16px bottom gap
					maxHeight: 'calc(100vh - 104px)',
				},
				// Open transition animation
				animation: 'chat-window-open 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
				'@keyframes chat-window-open': {
					from: {
						transform: 'translateY(24px) scale(0.95)',
						opacity: 0,
					},
					to: {
						transform: 'translateY(0) scale(1)',
						opacity: 1,
					},
				},
			}}
		>
			{/* Chat Window Header */}
			<ChatHeader
				onNewChat={onNewChat}
				onClose={onClose}
				onToggleHistory={handleToggleHistory}
				showHistoryButton={true}
			/>

			{/* Scrollable Chat Area Container */}
			<Box
				sx={{
					flex: 1,
					position: 'relative', // for absolute history overlay positioning
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: '#f4f6f9',
				}}
			>
				{/* Main Messages list */}
				<Box
					sx={{
						flex: 1,
						overflowY: 'auto',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					{messages.length === 0 ? (
						/* Welcome Illustration & Suggested Actions when conversation is empty */
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								pt: 5,
								pb: 3,
							}}
						>
							{/* Logo illustration without notification dot */}
							<Box sx={{ mb: 2 }}>
								<Box
									sx={{
										width: 96,
										height: 96,
										borderRadius: '24px',
										background: 'linear-gradient(135deg, #eef5f6 0%, #fbeff5 100%)',
										boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<SmartToyIcon sx={{ color: 'primary.main', fontSize: 52 }} />
								</Box>
							</Box>

							{/* Welcome Title */}
							<Typography
								variant="h5"
								sx={{
									fontWeight: 800,
									color: 'text.primary',
									fontSize: '1.6rem',
									textAlign: 'center',
									mb: 1.5,
								}}
							>
								Hi, I'm CareAI
							</Typography>

							{/* Welcome Subtitle */}
							<Typography
								variant="body2"
								sx={{
									textAlign: 'center',
									px: 4.5,
									mb: 4.5,
									color: 'text.secondary',
									fontSize: '13.5px',
									lineHeight: 1.5,
									fontWeight: 500,
								}}
							>
								Your virtual assistant for Whisper AI. Find doctors, book appointments, and manage your health journey in real time.
							</Typography>

							{/* Suggested Healthcare Cards Stack */}
							<SuggestedActions onActionClick={onSend} />
						</Box>
					) : (
						/* Render Active Message History */
						<Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2.5 }}>
							{messages.map((msg) => (
								<ChatMessage key={msg.id} message={msg} onFeedbackSubmit={onFeedbackSubmit} />
							))}
							{isLoading && <TypingIndicator />}
							<div ref={messageEndRef} />
						</Box>
					)}
				</Box>

				{/* ChatGPT-like History View Overlay */}
				{showHistory && (
					<Box
						sx={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							bgcolor: 'background.paper',
							zIndex: 10,
							display: 'flex',
							flexDirection: 'column',
							animation: 'history-slide-in 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
							'@keyframes history-slide-in': {
								from: { transform: 'translateX(-100%)' },
								to: { transform: 'translateX(0)' },
							},
						}}
					>
						{/* History Sub-Header */}
						<Box
							sx={{
								p: 2,
								display: 'flex',
								alignItems: 'center',
								gap: 1,
								borderBottom: '1px solid',
								borderColor: 'divider',
							}}
						>
							<IconButton size="small" onClick={() => setShowHistory(false)}>
								<ArrowBackIcon fontSize="small" />
							</IconButton>
							<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '14px', color: 'text.primary' }}>
								Chat History
							</Typography>
						</Box>

						{/* History Sessions List */}
						<Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
							{sessions.length === 0 ? (
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										flex: 1,
										py: 4,
										textAlign: 'center',
									}}
								>
									<HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
									<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '13px' }}>
										No previous chats found
									</Typography>
									<Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5 }}>
										Start typing to begin a new journey.
									</Typography>
								</Box>
							) : (
								sessions.map((session) => {
									const isActive = session.id === activeSessionId
									return (
										<Box
											key={session.id}
											onClick={() => {
												if (onSelectSession) onSelectSession(session.id)
												setShowHistory(false)
											}}
											sx={{
												p: 1.5,
												borderRadius: '10px',
												border: '1px solid',
												borderColor: isActive ? 'primary.main' : 'divider',
												bgcolor: isActive ? 'rgba(43, 111, 113, 0.05)' : 'background.paper',
												cursor: 'pointer',
												transition: 'all 0.2s ease',
												position: 'relative',
												'&:hover': {
													bgcolor: isActive ? 'rgba(43, 111, 113, 0.08)' : 'action.hover',
													borderColor: isActive ? 'primary.main' : 'text.disabled',
												},
												borderLeft: isActive ? '4px solid #2b6f71' : undefined,
											}}
										>
											<Typography
												variant="subtitle2"
												noWrap
												sx={{
													fontWeight: 700,
													fontSize: '13px',
													color: isActive ? 'primary.main' : 'text.primary',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
											>
												{session.title || 'New Conversation'}
											</Typography>
											<Typography
												variant="caption"
												sx={{ color: 'text.secondary', fontSize: '11px', display: 'block', mt: 0.5 }}
											>
												{formatDate(session.created_at)}
											</Typography>
										</Box>
									)
								})
							)}
						</Box>
					</Box>
				)}
			</Box>

			{/* Chat Window Input Panel */}
			<ChatInput onSend={onSend} disabled={isLoading} />
		</Box>
	)
}
