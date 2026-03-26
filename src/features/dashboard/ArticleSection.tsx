// src/features/dashboard/ArticleSection.tsx
import { Box, Typography, Grid, Container } from '@mui/material'
import AppButton from '../../components/common/Button/AppButton'

const articles = [
	{
		id: 1,
		category: 'VITAMINS AND SUPPLEMENTS',
		categoryColor: '#0c7c7c',
		title: 'Eating Right to Build Immunity Against Cold and Viral Infections',
		author: 'Dr. Diana Borgio',
		image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop',
	},
	{
		id: 2,
		category: 'CORONAVIRUS',
		categoryColor: '#0c7c7c',
		title: '12 Coronavirus Myths and Facts That You Should Be Aware Of',
		author: 'Dr. Diana Borgio',
		image: 'https://images.unsplash.com/photo-1584118624012-df056829fbd0?w=400&h=250&fit=crop',
	},
]

export default function ArticleSection() {
	return (
		<Box sx={{ width: '100%', bgcolor: '#c8d8e4', py: 6 }}>
			<Container maxWidth="lg">
				<Grid
					container
					spacing={4}
					alignItems="center"
					sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
				>
					{/* Left: Articles — no card, open layout */}
					<Grid size={{ xs: 12, md: 8 }}>
						<Grid container spacing={3}>
							{articles.map((article) => (
								<Grid size={{ xs: 12, sm: 6 }} key={article.id}>
									<Box
										sx={{
											cursor: 'pointer',
											'&:hover .article-img': { transform: 'scale(1.03)' },
										}}
									>
										{/* Image with rounded corners */}
											<Box
												sx={{
													borderRadius: '12px',
													overflow: 'hidden',
													height: { xs: 180, sm: 200 },
													mb: 1.5,
												}}
											>
											<Box
												component="img"
												src={article.image}
												alt={article.title}
												className="article-img"
												sx={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													display: 'block',
													transition: 'transform 0.3s ease',
												}}
											/>
										</Box>

										{/* Category */}
										<Typography
											sx={{
												color: article.categoryColor,
												fontWeight: 700,
												fontSize: '12px',
												letterSpacing: '0.5px',
												mb: 0.5,
											}}
										>
											{article.category}
										</Typography>

										{/* Title */}
										<Typography
											sx={{
												fontWeight: 700,
												fontSize: '15px',
												lineHeight: 1.4,
												color: 'text.primary',
												mb: 0.8,
											}}
										>
											{article.title}
										</Typography>

										{/* Author */}
										<Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>
											{article.author}
										</Typography>
									</Box>
								</Grid>
							))}
						</Grid>
					</Grid>

					{/* Right: Text + Button */}
						<Grid size={{ xs: 12, md: 4 }}>
							<Box sx={{ pl: { md: 2 }, textAlign: { xs: 'center', md: 'left' } }}>
							<Typography
								variant="h4"
								sx={{ fontWeight: 700, lineHeight: 1.3, mb: 1.5, color: 'text.primary' }}
							>
								Read top articles from health experts
							</Typography>
							<Typography
								variant="body2"
								sx={{ color: 'text.secondary', fontSize: '14px', mb: 3, lineHeight: 1.6 }}
							>
								Health articles that keep you informed about good health practices and achieve your
								goals.
							</Typography>
								<AppButton
									label="See all articles"
									sx={{
										bgcolor: '#0c7c7c',
										color: '#fff',
										borderRadius: '8px',
										px: 3,
										width: { xs: '100%', sm: 'auto' },
										'&:hover': { bgcolor: '#0f4c4c' },
									}}
								/>
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
