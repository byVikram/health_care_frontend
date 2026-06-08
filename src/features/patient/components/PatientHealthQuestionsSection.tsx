// src/features/patient/components/PatientHealthQuestionsSection.tsx
import { useState } from 'react'
import { Box, Typography, Avatar, Chip, TextField, InputAdornment, Divider } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import SortIcon from '@mui/icons-material/Sort'
import { customScrollbar } from '../../../styles/commonStyles'
import { MOCK_PATIENT_QUESTIONS, type PatientQuestion } from '../../../constants/mockData'

// ─── Left List Card ───────────────────────────────────────────────────────────

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
			{/* Real patient photo avatar — same style as original cards */}
			<Avatar
				src={q.patientAvatar}
				sx={{
					width: 38,
					height: 38,
					flexShrink: 0,
					mt: 0.2,
					border: '2px solid',
					borderColor: isSelected ? '#0c7c7c' : '#e0e0e0',
					transition: 'border-color 0.18s ease',
				}}
			/>

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
					{q.timeAgo}
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

// ─── Right Detail Panel ───────────────────────────────────────────────────────

function QuestionDetailPanel({ q }: { q: PatientQuestion }) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
			{/* Tag + posted time */}
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
					• Posted {q.timeAgo.toLowerCase()} ago
				</Typography>
			</Box>

			{/* Question heading */}
			<Typography
				variant="h5"
				sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5, lineHeight: 1.3, fontSize: '20px' }}
			>
				{q.question}
			</Typography>

			{/* Full description */}
			<Typography sx={{ fontSize: '13px', color: 'text.secondary', lineHeight: 1.75, mb: 2 }}>
				{q.fullDescription}
			</Typography>

			{/* Patient meta strip */}
			{/* <Box
				sx={{
					display: 'flex',
					gap: 4,
					p: 1.5,
					bgcolor: '#f7fafa',
					borderRadius: '8px',
					border: '1px solid #e4eeee',
					mb: 2.5,
				}}
			>
				{[
					{ label: 'PATIENT', value: q.patientLabel },
					{ label: 'LOCATION', value: q.patientLocation },
					{ label: 'HISTORY', value: q.history },
				].map((meta) => (
					<Box key={meta.label}>
						<Typography
							sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}
						>
							{meta.label}
						</Typography>
						<Typography sx={{ fontSize: '12px', color: 'text.primary', fontWeight: 600, mt: 0.2 }}>
							{meta.value}
						</Typography>
					</Box>
				))}
			</Box> */}

			{/* Expert opinions header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
				<Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'text.primary' }}>
					Expert Opinions ({q.answers.length})
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
					<SortIcon sx={{ fontSize: 16, color: '#0c7c7c' }} />
					<Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#0c7c7c' }}>Sort by Latest</Typography>
				</Box>
			</Box>

			{/* Doctor answer cards — scrollable with customScrollbar */}
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
				{q.answers.map((ans, idx) => (
					<Box key={ans.id}>
						<Box sx={{ py: 1.5 }}>
							{/* Doctor header row */}
							<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, mb: 1 }}>
								<Avatar src={ans.avatar} sx={{ width: 38, height: 38, flexShrink: 0 }} />
								<Box>
									<Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary' }}>
										{ans.doctorName},{' '}
										<Typography
											component="span"
											sx={{ fontWeight: 400, fontSize: '13px', color: 'text.secondary' }}
										>
											{ans.specialty}
										</Typography>
									</Typography>
									<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
										{ans.hospital} • {ans.timeAgo}
									</Typography>
								</Box>
							</Box>

							{/* Answer body */}
							<Typography sx={{ fontSize: '13px', color: 'text.secondary', lineHeight: 1.7, pl: 0.5 }}>
								{ans.answer}
							</Typography>

							{/* Like / Reply row */}
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.2 }}>
								<Box
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
										{ans.likes}
									</Typography>
								</Box>
								<Box
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
							</Box>
						</Box>

						{idx < q.answers.length - 1 && <Divider sx={{ borderColor: '#f0f0f0' }} />}
					</Box>
				))}
			</Box>
		</Box>
	)
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function PatientHealthQuestionsSection() {
	const [selectedId, setSelectedId] = useState<number>(MOCK_PATIENT_QUESTIONS[0].id)
	const [search, setSearch] = useState('')

	const filtered = MOCK_PATIENT_QUESTIONS.filter(
		(q) =>
			q.question.toLowerCase().includes(search.toLowerCase()) ||
			q.shortDescription.toLowerCase().includes(search.toLowerCase())
	)

	const selected = MOCK_PATIENT_QUESTIONS.find((q) => q.id === selectedId) ?? MOCK_PATIENT_QUESTIONS[0]

	return (
		<Box sx={{ py: 5 }}>
			{/* Section heading */}
			<Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 3, lineHeight: 1.3, fontSize: '26px' }}>
				Health expert answers to your health questions
			</Typography>

			{/* Master-detail shell — fixed height so both panels scroll internally */}
			<Box
				sx={{
					display: 'flex',
					bgcolor: '#fff',
					borderRadius: '14px',
					border: '1px solid #e0e0e0',
					overflow: 'clip',
					height: 520,
					boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
				}}
			>
				{/* ── LEFT PANEL: sticky header + scrollable list ─────── */}
				<Box
					sx={{
						width: 290,
						flexShrink: 0,
						borderRight: '1px solid #ebebeb',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					{/* Header + search — pinned, never scrolls */}
					<Box sx={{ p: 1.5, borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
						<Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'text.primary', mb: 1 }}>
							Patient Inquiries
						</Typography>
						<TextField
							placeholder="Search questions..."
							size="small"
							fullWidth
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
									</InputAdornment>
								),
							}}
							sx={{
								'& .MuiOutlinedInput-root': {
									fontSize: '12px',
									borderRadius: '8px',
									bgcolor: '#f7f7f7',
								},
							}}
						/>
					</Box>

					{/* Scrollable list — uses project customScrollbar */}
					<Box
						sx={{
							overflowY: 'auto',
							flex: 1,
							minHeight: 0,
							...customScrollbar,
						}}
					>
						{filtered.length === 0 ? (
							<Typography
								sx={{ p: 2, fontSize: '12px', color: 'text.secondary', textAlign: 'center', mt: 2 }}
							>
								No questions found
							</Typography>
						) : (
							filtered.map((q, idx) => (
								<Box key={q.id}>
									<QuestionListCard
										q={q}
										isSelected={q.id === selectedId}
										onClick={() => setSelectedId(q.id)}
									/>
									{idx < filtered.length - 1 && <Divider sx={{ mx: 1.5, borderColor: '#f3f3f3' }} />}
								</Box>
							))
						)}
					</Box>
				</Box>

				{/* ── RIGHT PANEL: scrollable detail view ─────────────── */}
				<Box
					sx={{
						flex: 1,
						p: 2.5,
						overflowY: 'auto',
						display: 'flex',
						flexDirection: 'column',
						...customScrollbar,
					}}
				>
					<QuestionDetailPanel q={selected} />
				</Box>
			</Box>

			{/* Bottom CTA */}
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mt: 3.5 }}>
				<Box
					sx={{
						border: '1px solid #ccc',
						borderRadius: '8px',
						px: { xs: 3, sm: 6 },
						py: 1.5,
						cursor: 'pointer',
						width: '100%',
						maxWidth: '400px',
						textAlign: 'center',
						transition: 'box-shadow 0.2s ease',
						'&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
					}}
				>
					<Typography sx={{ fontSize: '15px', fontWeight: 500, color: 'text.primary' }}>
						Ask a free question
					</Typography>
				</Box>
				<Typography
					sx={{
						fontSize: '14px',
						color: '#0c7c7c',
						fontWeight: 600,
						cursor: 'pointer',
						textDecoration: 'underline',
						'&:hover': { opacity: 0.8 },
					}}
				>
					Read more trending questions
				</Typography>
			</Box>
		</Box>
	)
}
