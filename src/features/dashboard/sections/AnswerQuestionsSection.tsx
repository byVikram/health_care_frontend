// src/features/dashboard/AnswerQuestionsSection.tsx
import { Box, Typography, Avatar, TextField } from '@mui/material'
import AppButton from '../../../components/common/Button/AppButton'

const questions = [
	{
		id: 1,
		gender: 'Female',
		age: '30 Years',
		location: 'Bengaluru',
		time: '1d ago',
		question: 'Chance of esophageal cancer?',
		description:
			'2 months ago i vomited with 1.5 cup blood, some days ago i had severe heart burn and difficulty swallowing. The swallowing diffi...',
		answers: 10,
		avatar: 'https://i.pravatar.cc/40?img=47',
	},
	{
		id: 2,
		gender: 'Female',
		age: '30 Years',
		location: 'Bengaluru',
		time: '1d ago',
		question: 'Chance of esophageal cancer?',
		description:
			'2 months ago i vomited with 1.5 cup blood, some days ago i had severe heart burn and difficulty swallowing. The swallowing diffi...',
		answers: 10,
		avatar: 'https://i.pravatar.cc/40?img=48',
	},
	{
		id: 3,
		gender: 'Female',
		age: '30 Years',
		location: 'Bengaluru',
		time: '1d ago',
		question: 'Chance of esophageal cancer?',
		description:
			'2 months ago i vomited with 1.5 cup blood, some days ago i had severe heart burn and difficulty swallowing. The swallowing diffi...',
		answers: 10,
		avatar: 'https://i.pravatar.cc/40?img=49',
	},
	{
		id: 4,
		gender: 'Female',
		age: '30 Years',
		location: 'Bengaluru',
		time: '1d ago',
		question: 'Chance of esophageal cancer?',
		description:
			'2 months ago i vomited with 1.5 cup blood, some days ago i had severe heart burn and difficulty swallowing. The swallowing diffi...',
		answers: 10,
		avatar: 'https://i.pravatar.cc/40?img=50',
	},
]

export default function AnswerQuestionsSection() {
	return (
		<Box sx={{ py: 6, bgcolor: 'background.default' }}>
			{/* Heading */}
			<Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 4, lineHeight: 1.3 }}>
				Take a time to answer the Patients questions
			</Typography>

			{/* 4 Question Cards */}
			<Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center' }}>
				{questions.map((q) => (
					<Box key={q.id} display={'flex'} flexDirection={'column'}>
						<Box
							sx={{
								flex: '1 1 0',
								bgcolor: '#fff',
								border: '1px solid #e0e0e0',
								borderRadius: '12px',
								overflow: 'clip',
								display: 'flex',
								flexDirection: 'column',
								gap: 1.5,
								transition: 'box-shadow 0.2s ease',
								'&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
							}}
						>
							<Box sx={{ p: 2 }}>
								{/* Top: Avatar + Info + Time */}
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
									<Avatar src={q.avatar} sx={{ width: 40, height: 40 }} />
									<Box sx={{ flex: 1 }}>
										<Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.primary' }}>
											Asked for {q.gender},
										</Typography>
										<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
											{q.age}, {q.location}
										</Typography>
									</Box>
									<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{q.time}</Typography>
								</Box>

								{/* Question */}

								<Typography mt={2} variant="body1" fontWeight={600} fontSize={14}>
									{q.question}
								</Typography>

								{/* Description */}
								<Typography mt={2} variant="body2">
									{q.description}
								</Typography>
							</Box>

							{/* Bottom: Answers + Doctor Avatars */}
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									borderTop: '1px solid #f0f0f0',
									py: 1.5,
									px: 3,
									background: '#DDE1E2',
								}}
							>
								<Box>
									<Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.primary' }}>
										{q.answers} answers
									</Typography>
									<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
										from other doctors
									</Typography>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center' }}>
									<Avatar
										src="https://i.pravatar.cc/30?img=12"
										sx={{ width: 28, height: 28, border: '2px solid #fff' }}
									/>
									<Avatar
										src="https://i.pravatar.cc/30?img=13"
										sx={{ width: 28, height: 28, border: '2px solid #fff', ml: -1 }}
									/>
									<Box
										sx={{
											width: 28,
											height: 28,
											borderRadius: '50%',
											bgcolor: '#0c7c7c',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											ml: -1,
											border: '2px solid #fff',
										}}
									>
										<Typography sx={{ fontSize: '10px', color: '#fff', fontWeight: 700 }}>
											6+
										</Typography>
									</Box>
								</Box>
							</Box>
						</Box>

						<Box>
							<TextField
								placeholder="Answer now..."
								multiline
								rows={3}
								fullWidth
								sx={{
									mt: 2,
									'& .MuiOutlinedInput-root': {
										background: '#fff',
										borderRadius: '8px',
										fontSize: '13px',
									},
								}}
							/>

							{/* Submit Button */}
							<AppButton
								label="Submit"
								fullWidth
								sx={{
									mt: 2,
									// color: '#fff',
									borderRadius: '20px',
								}}
							/>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	)
}
