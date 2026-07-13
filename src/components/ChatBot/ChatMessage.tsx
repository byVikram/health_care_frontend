// src/components/ChatBot/ChatMessage.tsx
import React, { useState } from 'react'
import { Box, Typography, IconButton, TextField, Button, Chip } from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined'
import { ChatResponse, SourceReference } from '../../types/chatbot'

export interface Message {
	id: string
	sender: 'user' | 'bot'
	text: string
	timestamp: Date
	sources?: SourceReference[]
	structured_payload?: ChatResponse
	is_helpful?: boolean
	feedback_comments?: string
}

interface ChatMessageProps {
	message: Message
	onFeedbackSubmit?: (messageId: string, isHelpful: boolean, comments?: string) => void
}

export default function ChatMessage({ message, onFeedbackSubmit }: ChatMessageProps) {
	const isBot = message.sender === 'bot'
	const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(message.is_helpful ?? null)
	const [showCommentInput, setShowCommentInput] = useState(false)
	const [comments, setComments] = useState('')

	const handleFeedback = (isHelpful: boolean) => {
		setFeedbackGiven(isHelpful)
		if (!isHelpful) {
			setShowCommentInput(true)
		} else {
			if (onFeedbackSubmit) {
				onFeedbackSubmit(message.id, true)
			}
		}
	}

	const handleCommentSubmit = () => {
		if (onFeedbackSubmit) {
			onFeedbackSubmit(message.id, false, comments)
		}
		setShowCommentInput(false)
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: isBot ? 'flex-start' : 'flex-end',
				mb: 2.5,
				width: '100%',
			}}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: isBot ? 'row' : 'row-reverse',
					alignItems: 'flex-end',
					gap: 1,
					width: '100%',
				}}
			>
				{/* Bubble */}
				<Box
					sx={{
						maxWidth: '85%',
						bgcolor: isBot ? '#f0f4f6' : 'primary.main',
						color: isBot ? 'text.primary' : 'primary.contrastText',
						borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
						py: 1.5,
						px: 2.25,
						boxShadow: isBot ? 'none' : '0 4px 12px rgba(43, 111, 113, 0.15)',
					}}
				>
					{isBot ? renderMarkdown(message.text) : (
						<Typography
							variant="body1"
							sx={{
								fontSize: '13.5px',
								lineHeight: 1.5,
								fontWeight: 500,
								whiteSpace: 'pre-line',
								wordBreak: 'break-word',
							}}
						>
							{message.text}
						</Typography>
					)}

					{/* Structured Medical Payload Section */}
					{isBot && message.structured_payload && (
						<Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
							
							{/* 🚨 Emergency Warning Alert Box */}
							{(message.structured_payload.severity === 'emergency' || message.structured_payload.severity === 'high') && (
								<Box
									sx={{
										p: 1.5,
										borderRadius: '8px',
										bgcolor: '#ffebee', // Soft red alert background
										borderLeft: '4px solid #ef5350', // Solid red warning accent bar
										color: '#c62828',
									}}
								>
									<Typography
										variant="subtitle2"
										sx={{
											fontWeight: 800,
											fontSize: '12.5px',
											display: 'flex',
											alignItems: 'center',
											gap: 0.5,
										}}
									>
										🚨 Emergency Warning
									</Typography>
									<Typography variant="body2" sx={{ fontSize: '11px', mt: 0.5, lineHeight: 1.4, color: '#d32f2f', fontWeight: 600 }}>
										Please consult a healthcare professional immediately. Your symptoms require prompt clinical attention.
									</Typography>
								</Box>
							)}

							{/* Possible Conditions Bullets Section */}
							{message.structured_payload.possible_conditions && message.structured_payload.possible_conditions.length > 0 && (
								<Box sx={{ mt: 0.5 }}>
									<Typography
										variant="subtitle2"
										sx={{
											fontWeight: 700,
											fontSize: '12px',
											color: 'text.primary',
											display: 'flex',
											alignItems: 'center',
											mb: 0.75,
										}}
									>
										Possible Conditions:
									</Typography>
									<Box component="ul" sx={{ pl: 2.5, m: 0 }}>
										{message.structured_payload.possible_conditions.map((cond, i) => (
											<Box key={i} component="li" sx={{ fontSize: '11.5px', lineHeight: 1.4, color: 'text.secondary', mb: 0.5 }}>
												{cond}
											</Box>
										))}
									</Box>
								</Box>
							)}

							{/* Home Remedies Section */}
							{message.structured_payload.home_remedies && message.structured_payload.home_remedies.length > 0 && (
								<Box>
									<Typography
										variant="subtitle2"
										sx={{
											fontWeight: 700,
											fontSize: '12px',
											color: 'text.primary',
											mb: 0.75,
										}}
									>
										Home Remedies:
									</Typography>
									<Box component="ul" sx={{ pl: 2.5, m: 0 }}>
										{message.structured_payload.home_remedies.map((remedy, i) => (
											<Box key={i} component="li" sx={{ fontSize: '11.5px', lineHeight: 1.4, color: 'text.secondary', mb: 0.5 }}>
												{remedy}
											</Box>
										))}
									</Box>
								</Box>
							)}

							{/* Recommended Specialty Badge / Info */}
							{(message.structured_payload.recommended_speciality || message.structured_payload.severity) && (
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
									{message.structured_payload.severity && (
										<Chip
											label={`Triage Level: ${message.structured_payload.severity.toUpperCase()}`}
											size="small"
											color={
												message.structured_payload.severity === 'emergency' || message.structured_payload.severity === 'high'
													? 'error'
													: message.structured_payload.severity === 'medium'
													? 'warning'
													: 'success'
											}
											sx={{ fontSize: '10px', height: '20px', fontWeight: 800, textTransform: 'uppercase' }}
										/>
									)}
									{message.structured_payload.recommended_speciality && (
										<Chip
											label={`Recommended Specialty: ${message.structured_payload.recommended_speciality}`}
											size="small"
											variant="filled"
											sx={{
												fontSize: '10px',
												height: '20px',
												fontWeight: 700,
												bgcolor: 'primary.light',
												color: 'primary.contrastText',
											}}
										/>
									)}
								</Box>
							)}

							{/* Disclaimer Section */}
							{message.structured_payload.disclaimer && (
								<Box
									sx={{
										p: 1.25,
										bgcolor: 'action.hover',
										borderRadius: '6px',
										borderLeft: '3px solid',
										borderColor: 'text.disabled',
										mt: 1,
									}}
								>
									<Typography
										variant="caption"
										sx={{
											display: 'block',
											fontSize: '10.5px',
											color: 'text.secondary',
											fontStyle: 'italic',
											lineHeight: 1.4,
										}}
									>
										⚠️ {message.structured_payload.disclaimer}
									</Typography>
								</Box>
							)}
						</Box>
					)}
				</Box>
			</Box>

			{/* Recommended Doctors */}
			{isBot && message.structured_payload?.nearby_doctors && message.structured_payload.nearby_doctors.length > 0 && (
				<Box sx={{ mt: 1.5, pl: 0, pr: 2, width: '100%', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
					<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '11.5px', color: 'text.secondary' }}>
						Recommended Doctors:
					</Typography>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
						{message.structured_payload.nearby_doctors.map((doc, idx) => (
							<Box
								key={idx}
								sx={{
									bgcolor: 'background.paper',
									border: '1px solid',
									borderColor: 'divider',
									borderRadius: '10px',
									p: 1.5,
									boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
								}}
							>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px' }}>
									{doc.name}
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '10.5px', mt: 0.25 }}>
									{doc.speciality.join(', ')} • {doc.experience_years} Years Exp
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '10.5px' }}>
									📍 {doc.location} {doc.distance ? `(${doc.distance})` : ''}
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
									<Typography variant="subtitle2" sx={{ color: 'primary.main', fontSize: '11.5px', fontWeight: 700 }}>
										Fees: ₹{doc.fees}
									</Typography>
									<Chip label={doc.consultation_mode} size="small" sx={{ fontSize: '10px', height: '18px' }} />
								</Box>
							</Box>
						))}
					</Box>
				</Box>
			)}

			{/* Source References */}
			{isBot && message.sources && message.sources.length > 0 && (
				<Box sx={{ mt: 1.5, pl: 0, pr: 2, width: '100%' }}>
					<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '11.5px', color: 'text.secondary' }}>
						Sources:
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
						{message.sources.map((src, idx) => (
							<Chip
								key={idx}
								label={src.title}
								size="small"
								component="a"
								href={src.url || '#'}
								target="_blank"
								clickable
								sx={{ fontSize: '10px', height: '20px' }}
							/>
						))}
					</Box>
				</Box>
			)}

			{/* Helpful / Feedback Section */}
			{isBot && (
				<Box sx={{ display: 'flex', flexDirection: 'column', pl: 0, pr: 2, mt: 1.5, width: '100%' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
							Was this helpful?
						</Typography>
						<IconButton size="small" onClick={() => handleFeedback(true)} disabled={feedbackGiven !== null} sx={{ p: 0.25 }}>
							{feedbackGiven === true ? (
								<ThumbUpIcon sx={{ fontSize: 14, color: 'primary.main' }} />
							) : (
								<ThumbUpOutlinedIcon sx={{ fontSize: 14 }} />
							)}
						</IconButton>
						<IconButton size="small" onClick={() => handleFeedback(false)} disabled={feedbackGiven !== null} sx={{ p: 0.25 }}>
							{feedbackGiven === false ? (
								<ThumbDownIcon sx={{ fontSize: 14, color: 'error.main' }} />
							) : (
								<ThumbDownOutlinedIcon sx={{ fontSize: 14 }} />
							)}
						</IconButton>
					</Box>

					{showCommentInput && (
						<Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center', width: '100%' }}>
							<TextField
								size="small"
								placeholder="Add comments..."
								value={comments}
								onChange={(e) => setComments(e.target.value)}
								sx={{
									flex: 1,
									'& .MuiInputBase-input': { fontSize: '11.5px', p: 0.85 },
								}}
							/>
							<Button size="small" variant="contained" onClick={handleCommentSubmit} sx={{ fontSize: '11px', py: 0.6, minWidth: '40px' }}>
								Send
							</Button>
						</Box>
					)}
				</Box>
			)}
		</Box>
	)
}

// ── CUSTOM LIGHTWEIGHT MARKDOWN ENGINE ──────────────────────────────────────────
function renderMarkdown(text: string) {
	if (!text) return null

	// Split by double newlines to separate paragraphs/sections
	const blocks = text.split(/\n\n+/)

	return blocks.map((block, blockIdx) => {
		const trimmed = block.trim()
		if (!trimmed) return null

		// 1. Headings (e.g. ### Title)
		const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
		if (headingMatch) {
			const level = headingMatch[1].length
			const content = headingMatch[2]
			const fontSizes = ['1.5rem', '1.3rem', '1.1rem', '0.95rem', '0.9rem', '0.85rem']
			return (
				<Typography
					key={blockIdx}
					variant="h6"
					sx={{
						fontWeight: 700,
						fontSize: fontSizes[level - 1] || '0.95rem',
						mt: blockIdx > 0 ? 1.75 : 0,
						mb: 0.75,
						color: 'text.primary',
						lineHeight: 1.3,
					}}
				>
					{parseInlineElements(content)}
				</Typography>
			)
		}

		// 2. Numbered Lists
		if (trimmed.match(/^\d+\.\s+/m)) {
			const lines = trimmed.split('\n')
			const listItems: React.ReactNode[] = []
			
			lines.forEach((line, lineIdx) => {
				const match = line.match(/^\d+\.\s+(.*)$/)
				if (match) {
					listItems.push(
						<Box key={lineIdx} component="li" sx={{ mb: 0.5, pl: 0.5, fontSize: '13.5px', lineHeight: 1.5 }}>
							{parseInlineElements(match[1])}
						</Box>
					)
				}
			});

			if (listItems.length > 0) {
				return (
					<Box
						key={blockIdx}
						component="ol"
						sx={{
							pl: 2.5,
							mt: blockIdx > 0 ? 1 : 0,
							mb: 1.5,
							listStyleType: 'decimal',
						}}
					>
						{listItems}
					</Box>
				)
			}
		}

		// 3. Bullet Lists
		if (trimmed.match(/^([*\-•])\s+/m)) {
			const lines = trimmed.split('\n')
			const listItems: React.ReactNode[] = []
			
			lines.forEach((line, lineIdx) => {
				const match = line.match(/^([*\-•])\s+(.*)$/)
				if (match) {
					listItems.push(
						<Box key={lineIdx} component="li" sx={{ mb: 0.5, pl: 0.5, fontSize: '13.5px', lineHeight: 1.5 }}>
							{parseInlineElements(match[2])}
						</Box>
					)
				}
			});

			if (listItems.length > 0) {
				return (
					<Box
						key={blockIdx}
						component="ul"
						sx={{
							pl: 2.5,
							mt: blockIdx > 0 ? 1 : 0,
							mb: 1.5,
							listStyleType: 'disc',
						}}
					>
						{listItems}
					</Box>
				)
			}
		}

		// 4. Default Paragraph
		return (
			<Typography
				key={blockIdx}
				variant="body1"
				sx={{
					fontSize: '13.5px',
					lineHeight: 1.5,
					fontWeight: 500,
					mb: blockIdx < blocks.length - 1 ? 1.5 : 0,
					wordBreak: 'break-word',
				}}
			>
				{parseInlineElements(trimmed)}
			</Typography>
		)
	})
}

function parseInlineElements(text: string): React.ReactNode[] {
	if (!text) return []

	// Split by bold patterns (**) or inline code patterns (`)
	const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)

	return parts.map((part, idx) => {
		// Bold text formatting
		if (part.startsWith('**') && part.endsWith('**')) {
			return (
				<Box key={idx} component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
					{part.slice(2, -2)}
				</Box>
			)
		}
		// Inline code formatting
		if (part.startsWith('`') && part.endsWith('`')) {
			return (
				<Box
					key={idx}
					component="code"
					sx={{
						fontFamily: 'monospace',
						bgcolor: 'rgba(0, 0, 0, 0.05)',
						color: '#c7254e',
						px: 0.5,
						py: 0.2,
						borderRadius: '4px',
						fontSize: '0.9em',
					}}
				>
					{part.slice(1, -1)}
				</Box>
			)
		}
		// Plain text chunk
		return part
	})
}
