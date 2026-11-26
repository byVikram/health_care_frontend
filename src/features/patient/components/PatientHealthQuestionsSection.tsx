// src/features/patient/components/PatientHealthQuestionsSection.tsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
	Box,
	Typography,
	Avatar,
	Chip,
	TextField,
	InputAdornment,
	Divider,
	Grid,
	Card,
	CardContent,
	Button,
	CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import SortIcon from '@mui/icons-material/Sort'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'

import { customScrollbar } from '../../../styles/commonStyles'
import {
	listHealthQuestions,
	likeDoctorAnswer,
	submitAnswerReply,
	submitDoctorAnswer,
	type PatientQuestion,
	type DoctorAnswer,
	type DoctorAnswerReply,
} from '../../../services/qaService'
import { toast } from 'react-toastify'
import { useQuestionAccess } from '../../../hooks/useQuestionAccess'
import VoiceMicButton from '../../../components/common/Voice/VoiceMicButton'

// Same minimum as the mobile app, so a one-liner is not posted as an expert answer.
const MIN_ANSWER_LENGTH = 60

// â”€â”€â”€ Recursive Reply Rendering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ReplyNode({
	reply,
	onReplySubmit,
	canReply,
}: {
	reply: DoctorAnswerReply
	onReplySubmit: (parentId: string, text: string) => void
	canReply: boolean
}) {
	const [showReplyBox, setShowReplyBox] = useState(false)
	const [replyText, setReplyText] = useState('')

	const handleSend = () => {
		if (!replyText.trim()) return
		onReplySubmit(reply.id, replyText)
		setReplyText('')
		setShowReplyBox(false)
	}

	return (
		<Box sx={{ pl: 2, borderLeft: '1px solid #e2e8f0', mt: 1.5 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
				<Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' }}>
					{reply.user_name}
				</Typography>
				<Chip
					label={reply.user_role.toUpperCase()}
					size="small"
					sx={{
						fontSize: '0.55rem',
						height: 14,
						bgcolor: reply.user_role === 'doctor' ? '#ccfbf1' : reply.user_role === 'admin' ? '#fee2e2' : '#f1f5f9',
						color: reply.user_role === 'doctor' ? '#0f766e' : reply.user_role === 'admin' ? '#991b1b' : '#475569',
						fontWeight: 700,
					}}
				/>
				<Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
					â€¢ {new Date(reply.created_at).toLocaleDateString()}
				</Typography>
			</Box>
			<Typography sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
				{reply.content}
			</Typography>
			{canReply && (
				<Box sx={{ mt: 0.5 }}>
					<Typography
						onClick={() => setShowReplyBox(!showReplyBox)}
						sx={{ fontSize: '0.75rem', color: '#0c7c7c', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
					>
						Reply
					</Typography>
				</Box>
			)}

			{canReply && showReplyBox && (
				<Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
					<TextField
						size="small"
						fullWidth
						value={replyText}
						onChange={(e) => setReplyText(e.target.value)}
						placeholder={`Reply to ${reply.user_name}...`}
						sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', borderRadius: '6px' } }}
					/>
					<Button
						variant="contained"
						size="small"
						onClick={handleSend}
						sx={{ bgcolor: '#0c7c7c', textTransform: 'none', borderRadius: '6px', '&:hover': { bgcolor: '#0b6c6c' } }}
					>
						Send
					</Button>
				</Box>
			)}

			{reply.replies &&
				reply.replies.map((child) => (
					<ReplyNode key={child.id} reply={child} onReplySubmit={onReplySubmit} canReply={canReply} />
				))}
		</Box>
	)
}

// â”€â”€â”€ Question List Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function QuestionListCard({
	q,
	isSelected,
	onClick,
}: {
	q: PatientQuestion
	isSelected: boolean
	onClick: () => void
}) {
	return (
		<Box
			onClick={onClick}
			sx={{
				display: 'flex',
				alignItems: 'flex-start',
				gap: 1.2,
				px: 1.5,
				py: 1.4,
				cursor: 'pointer',
				bgcolor: isSelected ? '#EAF4F4' : 'transparent',
				borderLeft: isSelected ? '3px solid #0c7c7c' : '3px solid transparent',
				transition: 'all 0.18s ease',
				'&:hover': { bgcolor: '#f2fafa' },
			}}
		>

			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography
					sx={{
						fontSize: '10px',
						fontWeight: 700,
						color: '#0c7c7c',
						letterSpacing: 0.5,
						mb: 0.3,
					}}
				>
					{new Date(q.created_at).toLocaleDateString()}
				</Typography>
				<Typography
					sx={{
						fontWeight: 600,
						fontSize: '13px',
						color: 'text.primary',
						lineHeight: 1.4,
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}
				>
					{q.question}
				</Typography>
			</Box>
		</Box>
	)
}

// â”€â”€â”€ Right Detail Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function QuestionDetailPanel({
	q,
	onReplySubmitted,
	onAnswerLiked,
	onAnswerSubmitted,
	canReply,
	canAnswer,
	awaitingVerification,
}: {
	q: PatientQuestion
	onReplySubmitted: (answerId: string, reply: DoctorAnswerReply) => void
	onAnswerLiked: (answerId: string, likes: number) => void
	onAnswerSubmitted: (questionId: string, answer: DoctorAnswer) => void
	/** False for a doctor an admin has not verified yet: they can read but not reply. */
	canReply: boolean
	/** A verified doctor: shows the box to post an answer to this question. */
	canAnswer: boolean
	/** A doctor whose verification is pending: shows why there is no answer box. */
	awaitingVerification: boolean
}) {
	const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
	const [replyInputText, setReplyInputText] = useState('')
	const [answerText, setAnswerText] = useState('')
	const [posting, setPosting] = useState(false)
	const answerLength = answerText.trim().length
	const answerReady = answerLength >= MIN_ANSWER_LENGTH

	const handleAnswerSubmit = async () => {
		if (!answerReady || posting) return
		setPosting(true)
		try {
			const res = await submitDoctorAnswer(q.id, answerText.trim())
			onAnswerSubmitted(q.id, res.data)
			setAnswerText('')
			toast.success('Your answer is live. The patient has been notified.')
		} catch (err) {
			// the global error toast already shows the server's reason (e.g. the doctor is not verified)
			console.error('Error posting answer:', err)
		} finally {
			setPosting(false)
		}
	}

	const handleAnswerLike = async (ansId: string) => {
		try {
			const res = await likeDoctorAnswer(ansId)
			onAnswerLiked(ansId, res.likes)
			toast.success('Thank you for upvoting this opinion!')
		} catch (err) {
			console.error('Error liking doctor answer:', err)
		}
	}

	const handleRootReplySubmit = async (ansId: string) => {
		if (!replyInputText.trim()) return
		try {
			const res = await submitAnswerReply(ansId, replyInputText)
			onReplySubmitted(ansId, res.data)
			setReplyInputText('')
			setActiveReplyId(null)
			toast.success('Reply submitted successfully!')
		} catch (err) {
			console.error('Error submitting reply:', err)
			toast.error('Failed to post reply')
		}
	}

	const handleChildReplySubmit = async (ansId: string, parentId: string, text: string) => {
		try {
			const res = await submitAnswerReply(ansId, text, parentId)
			onReplySubmitted(ansId, res.data)
			toast.success('Reply submitted successfully!')
		} catch (err) {
			console.error('Error submitting reply:', err)
			toast.error('Failed to post reply')
		}
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
				<Chip
					label={q.tag}
					size="small"
					sx={{
						bgcolor: '#E8F4F4',
						color: '#0c7c7c',
						fontWeight: 700,
						fontSize: '11px',
						height: 24,
						borderRadius: '6px',
					}}
				/>
				<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
					â€¢ Asked for {q.gender}, {q.age}
				</Typography>
			</Box>

			<Typography
				variant="h5"
				sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5, lineHeight: 1.3, fontSize: '20px' }}
			>
				{q.question}
			</Typography>

			<Typography sx={{ fontSize: '13px', color: 'text.secondary', lineHeight: 1.75, mb: 2 }}>
				{q.full_description}
			</Typography>

			{q.history && (
				<Box sx={{ mb: 3, p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
					<Typography sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}>
						PATIENT MEDICAL HISTORY
					</Typography>
					<Typography sx={{ fontSize: '12px', color: 'text.primary', fontWeight: 600, mt: 0.2 }}>
						{q.history}
					</Typography>
				</Box>
			)}

			{canAnswer && (
				<Box sx={{ mb: 2, p: 1.5, bgcolor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '10px' }}>
					<Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary', mb: 1 }}>
						Your answer
					</Typography>
					<TextField
						multiline
						minRows={3}
						fullWidth
						size="small"
						value={answerText}
						onChange={(e) => setAnswerText(e.target.value)}
						placeholder="General guidance in simple words, and when to see a doctor"
						sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '8px' } }}
					/>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 1 }}>
						<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
							Public answer. Don't diagnose or give doses.{' '}
							{answerReady ? `${answerLength} characters` : `Min ${MIN_ANSWER_LENGTH} characters (${answerLength})`}
						</Typography>
						<Button
							variant="contained"
							size="small"
							disabled={!answerReady || posting}
							onClick={handleAnswerSubmit}
							sx={{ bgcolor: '#0c7c7c', textTransform: 'none', borderRadius: '6px', '&:hover': { bgcolor: '#0b6c6c' } }}
						>
							{posting ? 'Posting...' : 'Post answer'}
						</Button>
					</Box>
				</Box>
			)}

			{awaitingVerification && (
				<Box sx={{ mb: 2, p: 1.5, bgcolor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px' }}>
					<Typography sx={{ fontSize: '12px', color: '#92400e', lineHeight: 1.6 }}>
						<strong>Answering isn't open yet.</strong> Patients read these as expert answers, so you can answer
						questions once an admin has verified your profile.
					</Typography>
				</Box>
			)}

			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
				<Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'text.primary' }}>
					Expert Opinions ({q.answers.length})
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<SortIcon sx={{ fontSize: 16, color: '#0c7c7c' }} />
					<Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#0c7c7c' }}>Sort by Latest</Typography>
				</Box>
			</Box>

			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					overflowY: 'auto',
					flex: 1,
					pr: 0.5,
					...customScrollbar,
				}}
			>
				{q.answers.length === 0 ? (
					<Typography sx={{ fontSize: '12px', color: 'text.secondary', py: 4, textAlign: 'center' }}>
						No expert opinions posted yet.
					</Typography>
				) : (
					q.answers.map((ans, idx) => (
						<Box key={ans.id}>
							<Box sx={{ py: 2 }}>
								<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, mb: 1 }}>
									<Avatar src={ans.doctor_avatar} sx={{ width: 38, height: 38, flexShrink: 0 }} />
									<Box>
										<Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary' }}>
											{ans.doctor_name},{' '}
											<Typography
												component="span"
												sx={{ fontWeight: 400, fontSize: '13px', color: 'text.secondary' }}
											>
												{ans.doctor_specialty}
											</Typography>
										</Typography>
										<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
											{ans.doctor_hospital} â€¢ {new Date(ans.created_at).toLocaleDateString()}
										</Typography>
									</Box>
								</Box>

								<Typography sx={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, pl: 0.5 }}>
									{ans.answer}
								</Typography>

								<Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mt: 1.2, pl: 0.5 }}>
									<Box
										onClick={() => handleAnswerLike(ans.id)}
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 0.5,
											cursor: 'pointer',
											'&:hover svg': { color: '#0c7c7c' },
											'&:hover p': { color: '#0c7c7c' },
										}}
									>
										<ThumbUpOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
										<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
											{ans.likes} Helpful
										</Typography>
									</Box>
									{canReply && (
										<Box
											onClick={() => setActiveReplyId(activeReplyId === ans.id ? null : ans.id)}
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 0.5,
												cursor: 'pointer',
												'&:hover svg': { color: '#0c7c7c' },
												'&:hover p': { color: '#0c7c7c' },
											}}
										>
											<ChatBubbleOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
											<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>Reply</Typography>
										</Box>
									)}
								</Box>

								{canReply && activeReplyId === ans.id && (
									<Box sx={{ display: 'flex', gap: 1, mt: 1.5, pl: 0.5 }}>
										<TextField
											size="small"
											fullWidth
											value={replyInputText}
											onChange={(e) => setReplyInputText(e.target.value)}
											placeholder="Write your follow-up reply..."
											sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', borderRadius: '6px' } }}
										/>
										<Button
											variant="contained"
											size="small"
											onClick={() => handleRootReplySubmit(ans.id)}
											sx={{ bgcolor: '#0c7c7c', textTransform: 'none', borderRadius: '6px', '&:hover': { bgcolor: '#0b6c6c' } }}
										>
											Send
										</Button>
									</Box>
								)}

								{/* Render replies list */}
								{ans.replies && ans.replies.map((reply) => (
									<ReplyNode
										key={reply.id}
										reply={reply}
										onReplySubmit={(parentId, text) => handleChildReplySubmit(ans.id, parentId, text)}
										canReply={canReply}
									/>
								))}
							</Box>

							{idx < q.answers.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
						</Box>
					))
				)}
			</Box>
		</Box>
	)
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface QuestionsSectionProps {
	isPortalPage?: boolean
}

export default function PatientHealthQuestionsSection({ isPortalPage = false }: QuestionsSectionProps) {
	// What this persona may do here: patients ask, verified doctors answer, an unverified doctor only reads.
	const { canAsk, canAnswer, canReply, awaitingVerification } = useQuestionAccess()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [questions, setQuestions] = useState<PatientQuestion[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [selectedId, setSelectedId] = useState<string | null>(null)

	const loadQuestions = useCallback(async (query = '') => {
		setLoading(true)
		try {
			// Limit to 6 on homepage, otherwise load 30
			const limitCount = isPortalPage ? 30 : 6
			const res = await listHealthQuestions(query, 1, limitCount)
			setQuestions(res.data)

			if (res.data.length > 0) {
				// Resolve pre-selection
				const paramId = searchParams.get('selectedId')
				if (paramId && res.data.some((q) => q.id === paramId)) {
					setSelectedId(paramId)
				} else {
					setSelectedId(res.data[0].id)
				}
			}
		} catch (err) {
			console.error('Error loading health questions:', err)
		} finally {
			setLoading(false)
		}
	}, [isPortalPage, searchParams])

	useEffect(() => {
		loadQuestions(search)
	}, [loadQuestions, search])

	const handleSearchChange = (val: string) => {
		setSearch(val)
	}

	const handleReplyAdded = (answerId: string, reply: DoctorAnswerReply) => {
		setQuestions((prev) =>
			prev.map((q) => {
				const updatedAnswers = q.answers.map((ans) => {
					if (ans.id === answerId) {
						// Deep helper to append reply
						const appendReplyHelper = (nodes: DoctorAnswerReply[]): DoctorAnswerReply[] => {
							if (!reply.parent_id) {
								return [...nodes, reply]
							}
							return nodes.map((node) => {
								if (node.id === reply.parent_id) {
									return { ...node, replies: [...(node.replies || []), reply] }
								}
								if (node.replies) {
									return { ...node, replies: appendReplyHelper(node.replies) }
								}
								return node
							})
						}
						return { ...ans, replies: appendReplyHelper(ans.replies || []) }
					}
					return ans
				})
				return { ...q, answers: updatedAnswers }
			})
		)
	}

	const handleAnswerAdded = (questionId: string, answer: DoctorAnswer) => {
		setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, answers: [...q.answers, answer] } : q)))
	}

	const handleAnswerLiked = (answerId: string, likes: number) => {
		setQuestions((prev) =>
			prev.map((q) => {
				const updatedAnswers = q.answers.map((ans) => {
					if (ans.id === answerId) {
						return { ...ans, likes }
					}
					return ans
				})
				return { ...q, answers: updatedAnswers }
			})
		)
	}

	const selectedQuestion = questions.find((q) => q.id === selectedId) || questions[0]

	// â”€â”€â”€ Rendering Portal Page (Master-Detail) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	if (isPortalPage) {
		return (
			<Box sx={{ py: 1 }}>
				{/* Disclaimer Banner */}
				<Box
					sx={{
						mb: 4,
						p: 2,
						bgcolor: '#fffbeb',
						border: '1px solid #fef3c7',
						borderRadius: '12px',
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
					}}
				>
					<HealthAndSafetyIcon sx={{ color: '#d97706' }} />
					<Typography variant="body2" color="#92400e" fontWeight={500}>
						<strong>Disclaimer:</strong> Answers provided by medical experts are for educational and informational purposes only. They do not constitute professional advice, treatment, or clinical diagnosis.
					</Typography>
				</Box>

				<Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ mb: 4 }}>
					Health expert answers to your health questions
				</Typography>

				{loading && questions.length === 0 ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
						<CircularProgress sx={{ color: '#0c7c7c' }} />
					</Box>
				) : (
					<Box
						sx={{
							display: 'flex',
							bgcolor: '#fff',
							borderRadius: '14px',
							border: '1px solid #e2e8f0',
							overflow: 'clip',
							height: 600,
							boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
						}}
					>
						{/* LEFT PANEL */}
						<Box
							sx={{
								width: 320,
								flexShrink: 0,
								borderRight: '1px solid #e2e8f0',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
								<Typography sx={{ fontWeight: 800, fontSize: '14px', color: '#1e293b', mb: 1 }}>
									Trending Questions
								</Typography>
								<TextField
									placeholder="Search symptoms or topics..."
									size="small"
									fullWidth
									value={search}
									onChange={(e) => handleSearchChange(e.target.value)}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
											</InputAdornment>
										),
										endAdornment: (
											<InputAdornment position="end">
												<VoiceMicButton onResult={(text) => handleSearchChange(text)} iconSize={16} />
											</InputAdornment>
										),
									}}
									sx={{
										'& .MuiOutlinedInput-root': {
											fontSize: '12px',
											borderRadius: '8px',
											bgcolor: '#f8fafc',
										},
									}}
								/>
							</Box>

							<Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, ...customScrollbar }}>
								{questions.map((q, idx) => (
									<Box key={q.id}>
										<QuestionListCard
											q={q}
											isSelected={q.id === selectedId}
											onClick={() => setSelectedId(q.id)}
										/>
										{idx < questions.length - 1 && <Divider sx={{ mx: 1.5, borderColor: '#f1f5f9' }} />}
									</Box>
								))}
							</Box>
						</Box>

						{/* RIGHT DETAIL PANEL */}
						<Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', ...customScrollbar }}>
							{selectedQuestion ? (
								<QuestionDetailPanel
									key={selectedQuestion.id}
									q={selectedQuestion}
									onReplySubmitted={handleReplyAdded}
									onAnswerLiked={handleAnswerLiked}
									onAnswerSubmitted={handleAnswerAdded}
									canReply={canReply}
									canAnswer={canAnswer}
									awaitingVerification={awaitingVerification}
								/>
							) : (
								<Box sx={{ m: 'auto', textAlign: 'center', py: 8 }}>
									<Typography color="text.secondary">No question selected.</Typography>
								</Box>
							)}
						</Box>
					</Box>
				)}
			</Box>
		)
	}

	// â”€â”€â”€ Rendering Landing Page (Top 6 Cards Grid) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	return (
		<Box sx={{ py: 6 }}>
			<Grid
				container
				sx={{
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 4,
				}}
			>
				<Grid size={{ xs: 12, md: 8 }}>
					<Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.3, fontSize: '1.5rem', color: '#0f172a' }}>
						Health expert answers to your health questions
					</Typography>
				</Grid>
				<Grid size={{ xs: 12, md: 2 }}>
					<Button
						fullWidth
						variant="outlined"
						onClick={() => navigate('/health-questions')}
						sx={{ mt: { xs: 2, md: 0 }, textTransform: 'none', borderRadius: '30px', py: 1.2, color: '#0c7c7c', borderColor: '#0c7c7c', '&:hover': { borderColor: '#0f766e', bgcolor: 'rgba(12, 124, 124, 0.04)' } }}
					>
						View All
					</Button>
				</Grid>
			</Grid>

			{loading && questions.length === 0 ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress sx={{ color: '#0c7c7c' }} />
				</Box>
			) : (
				<>
					<Grid container spacing={3}>
						{questions.slice(0, 6).map((q) => (
							<Grid size={{ xs: 12, sm: 6, md: 4 }} key={q.id}>
								<Card
									onClick={() => navigate(`/health-questions?selectedId=${q.id}`)}
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										borderRadius: 2,
										boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
										border: '1px solid #e2e8f0',
										cursor: 'pointer',
										transition: 'transform 0.2s, box-shadow 0.2s',
										'&:hover': {
											transform: 'translateY(-4px)',
											boxShadow: '0 12px 25px rgba(0, 0, 0, 0.06)',
										},
									}}
								>
									<CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
										<Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
											<Chip
												label={q.tag}
												size="small"
												sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700 }}
											/>
											<Typography variant="caption" color="text.secondary">
												Asked for {q.gender}, {q.age}
											</Typography>
										</Box>

										<Typography variant="body1" fontWeight={700} color="#0f172a" sx={{ mb: 1.5, fontSize: '0.95rem' }}>
											{q.question}
										</Typography>

										<Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, flexGrow: 1 }}>
											{q.short_description}
										</Typography>

										<Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

										<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
											<Typography variant="caption" fontWeight={600} color="#0c7c7c">
												{q.answers.length} Doctors Answered
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{new Date(q.created_at).toLocaleDateString()}
											</Typography>
										</Box>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>

					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5, gap: 1.5 }}>
						{canAsk && (
							<Button
								variant="contained"
								onClick={() => navigate('/health-questions')}
								sx={{ bgcolor: '#0c7c7c', textTransform: 'none', px: 4, py: 1.2, borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }}
							>
								Ask a Free Question
							</Button>
						)}
						<Typography variant="caption" color="text.secondary" align="center" sx={{ maxWidth: '600px', px: 2 }}>
							Medical advice disclaimer: Information on this site is not a substitute for professional medical care. Consult a physician for specific health problems.
						</Typography>
					</Box>
				</>
			)}
		</Box>
	)
}
