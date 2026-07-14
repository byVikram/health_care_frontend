// src/components/ChatBot/ChatMessage.tsx
import React, { useState } from 'react'
import { Box, Typography, IconButton, TextField, Button, Chip, Avatar } from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined'
import { ChatResponse, SourceReference } from '../../types/chatbot'
import { marked } from 'marked'
import { useNavigate } from 'react-router-dom'
import { buildS3Url } from '../../utils/s3'

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
	const navigate = useNavigate()
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
					{isBot ? (
						<Box
							sx={{
								fontSize: '13.5px',
								lineHeight: 1.5,
								fontWeight: 500,
								wordBreak: 'break-word',
								'& p': { mt: 0, mb: 1.5 },
								'& p:last-child': { mb: 0 },
								'& ul, & ol': { pl: 2.5, mt: 0.5, mb: 1.5 },
								'& li': { mb: 0.5 },
								'& h1, & h2, & h3, & h4, & h5, & h6': {
									fontWeight: 700,
									mt: 1.75,
									mb: 0.75,
									color: 'text.primary',
									lineHeight: 1.3,
								},
								'& h3': { fontSize: '1.1rem' },
								'& code': {
									fontFamily: 'monospace',
									bgcolor: 'rgba(0, 0, 0, 0.05)',
									color: '#c7254e',
									px: 0.5,
									py: 0.2,
									borderRadius: '4px',
									fontSize: '0.9em',
								}
							}}
							dangerouslySetInnerHTML={{ __html: marked.parse(message.text) }}
						/>
					) : (
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
							{message.structured_payload.recommended_speciality && (
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
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
						{message.structured_payload.nearby_doctors.map((doc, idx) => {
							const avatarUrl = buildS3Url(doc.avatar_s3_key);
							return (
								<Box
									key={idx}
									onClick={() => {
										if (doc.id) {
											navigate(`/doctors/${doc.id}`);
										}
									}}
									sx={{
										bgcolor: 'background.paper',
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: '12px',
										p: 1.75,
										display: 'flex',
										gap: 1.5,
										cursor: doc.id ? 'pointer' : 'default',
										boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
										transition: 'all 0.2s ease-in-out',
										'&:hover': doc.id ? {
											borderColor: 'primary.main',
											boxShadow: '0 4px 12px rgba(43, 111, 113, 0.08)',
											transform: 'translateY(-1px)',
										} : {},
									}}
								>
									<Avatar
										src={avatarUrl || undefined}
										alt={doc.name}
										sx={{
											width: 52,
											height: 52,
											bgcolor: 'primary.light',
											fontWeight: 700,
											fontSize: '15px'
										}}
									>
										{doc.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
									</Avatar>

									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
											<Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary' }}>
												{doc.name}
											</Typography>
											{doc.rating !== undefined && (
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
													<Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'warning.main' }}>★</Typography>
													<Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.secondary' }}>
														{doc.rating}
													</Typography>
												</Box>
											)}
										</Box>

										<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px', mt: 0.25, fontWeight: 500 }}>
											{doc.speciality.join(', ')} • {doc.experience_years} Years Exp
										</Typography>

										{doc.hospitals && doc.hospitals.length > 0 ? (
											<Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1, borderTop: '1px dashed', borderColor: 'divider', pt: 1 }}>
												{doc.hospitals.map((hosp, hIdx) => (
													<Box key={hIdx} sx={{ pl: 0.5 }}>
														<Typography variant="body2" sx={{ color: 'text.primary', fontSize: '11.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
															🏥 {hosp.name} {hosp.distance ? `(${hosp.distance})` : ''}
														</Typography>
														<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px', pl: 2 }}>
															📍 {hosp.address}
														</Typography>
														{hosp.earliest_slot && (
															<Typography variant="body2" sx={{ color: 'success.main', fontSize: '10.5px', fontWeight: 600, pl: 2, mt: 0.25 }}>
																📅 Next slot: {hosp.earliest_slot}
															</Typography>
														)}
														<Typography variant="body2" sx={{ color: 'primary.main', fontSize: '10.5px', fontWeight: 600, pl: 2, mt: 0.25 }}>
															Fees: ₹{hosp.fees} ({hosp.consultation_mode})
														</Typography>
													</Box>
												))}
											</Box>
										) : (
											<>
												{doc.hospital_name && (
													<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
														🏥 {doc.hospital_name}
													</Typography>
												)}

												<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
													📍 {doc.location} {doc.distance ? `(${doc.distance})` : ''}
												</Typography>

												{doc.earliest_slot && (
													<Typography variant="body2" sx={{ color: 'success.main', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
														📅 Next available slot: {doc.earliest_slot}
													</Typography>
												)}
											</>
										)}

										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.25 }}>
											{!doc.hospitals || doc.hospitals.length === 0 ? (
												<Typography variant="subtitle2" sx={{ color: 'primary.main', fontSize: '11.5px', fontWeight: 700 }}>
													Fees: ₹{doc.fees}
												</Typography>
											) : (
												<Box />
											)}
											<Box sx={{ display: 'flex', gap: 0.75 }}>
												{(!doc.hospitals || doc.hospitals.length === 0) && (
													<Chip
														label={doc.consultation_mode}
														size="small"
														sx={{ fontSize: '10px', height: '18px', textTransform: 'capitalize' }}
													/>
												)}
												{doc.id && (
													<Button
														size="small"
														variant="contained"
														sx={{
															fontSize: '10px',
															height: '18px',
															py: 0,
															px: 1,
															minWidth: 'auto',
															textTransform: 'none',
															fontWeight: 600
														}}
													>
														Book Appointment
													</Button>
												)}
											</Box>
										</Box>
									</Box>
								</Box>
							);
						})}
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


