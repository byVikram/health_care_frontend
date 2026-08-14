// src/components/common/AuthorInfoCard.tsx
import { Box, Typography, Avatar, Paper, Stack, Chip, Divider } from '@mui/material'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { BlogAuthor } from '../../services/blogService'

export interface AuthorInfoCardProps {
	author?: BlogAuthor | null
	title?: string
}

export default function AuthorInfoCard({ author, title = 'About the Author' }: AuthorInfoCardProps) {
	if (!author || !author.name) return null

	const avatarSrc = author.avatar_url || author.avatar

	return (
		<Box sx={{ mt: 4, pt: 1 }}>
			<Divider sx={{ mb: 3.5, borderColor: '#e2e8f0' }} />

			<Typography
				variant="h6"
				fontWeight={700}
				sx={{
					color: '#0f172a',
					fontSize: '1.05rem',
					mb: 2,
				}}
			>
				{title}
			</Typography>

			<Paper
				elevation={0}
				sx={{
					p: { xs: 2.5, sm: 3 },
					borderRadius: '12px',
					bgcolor: '#f8fafc',
					border: '1px solid #e2e8f0',
					transition: 'all 0.2s ease',
					'&:hover': {
						borderColor: 'rgba(13, 148, 136, 0.35)',
						boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
					},
				}}
			>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={{ xs: 2, sm: 2.5 }}
					alignItems={{ xs: 'center', sm: 'flex-start' }}
				>
					<Avatar
						src={avatarSrc}
						alt={author.name}
						sx={{
							width: { xs: 64, sm: 72 },
							height: { xs: 64, sm: 72 },
							bgcolor: '#0d9488',
							fontSize: '1.5rem',
							fontWeight: 700,
							color: '#ffffff',
							boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
							border: '2px solid #ffffff',
							flexShrink: 0,
						}}
					>
						{author.name.charAt(0).toUpperCase()}
					</Avatar>

					<Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, minWidth: 0 }}>
						<Stack
							direction="row"
							alignItems="center"
							justifyContent={{ xs: 'center', sm: 'flex-start' }}
							spacing={1}
							flexWrap="wrap"
							sx={{ mb: 0.5 }}
						>
							<Typography
								variant="subtitle1"
								fontWeight={700}
								sx={{ color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.3 }}
							>
								{author.name}
							</Typography>
							{author.credentials && (
								<Chip
									label={author.credentials}
									size="small"
									sx={{
										height: 20,
										fontSize: '0.7rem',
										fontWeight: 600,
										bgcolor: '#ccfbf1',
										color: '#0f766e',
										'& .MuiChip-label': { px: 0.75 },
									}}
								/>
							)}
						</Stack>

						{/* Designation & Specialty */}
						{(author.designation || author.specialty) && (
							<Box sx={{ mb: 1 }}>
								{author.designation && (
									<Typography
										variant="body2"
										fontWeight={600}
										sx={{ color: '#0d9488', fontSize: '0.875rem', lineHeight: 1.3 }}
									>
										{author.designation}
									</Typography>
								)}
								{author.specialty && (
									<Typography
										variant="caption"
										sx={{ color: '#64748b', fontSize: '0.8rem', display: 'block', mt: 0.2 }}
									>
										{author.specialty}
									</Typography>
								)}
							</Box>
						)}

						{/* Bio */}
						{author.bio && (
							<Typography
								variant="body2"
								sx={{
									color: '#334155',
									fontSize: '0.875rem',
									lineHeight: 1.6,
									mt: (author.designation || author.specialty) ? 0.5 : 1,
								}}
							>
								{author.bio}
							</Typography>
						)}

						{/* Experience / Extra Credentials */}
						{author.experience && (
							<Typography
								variant="caption"
								sx={{
									color: '#475569',
									fontSize: '0.75rem',
									fontWeight: 500,
									display: 'inline-flex',
									alignItems: 'center',
									gap: 0.5,
									mt: 1.25,
									bgcolor: '#ffffff',
									px: 1.25,
									py: 0.4,
									borderRadius: '6px',
									border: '1px solid #e2e8f0',
								}}
							>
								<WorkspacePremiumIcon sx={{ fontSize: 14, color: '#0d9488' }} />
								{author.experience}
							</Typography>
						)}
					</Box>
				</Stack>
			</Paper>
		</Box>
	)
}
