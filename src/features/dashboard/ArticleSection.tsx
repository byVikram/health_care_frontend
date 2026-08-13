// src/features/dashboard/ArticleSection.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, Container, Chip, Divider } from '@mui/material'
import AppButton from '../../components/common/Button/AppButton'
import AppModal from '../../components/common/Modal/AppModal'
import AuthorInfoCard from '../../components/common/AuthorInfoCard'
import { BlogAuthor } from '../../services/blogService'

export interface ArticleItem {
	id: number
	category: string
	categoryColor: string
	title: string
	author: string
	image: string
	content: string
	publishDate?: string
	authorData: BlogAuthor
}

const articles: ArticleItem[] = [
	{
		id: 1,
		category: 'VITAMINS AND SUPPLEMENTS',
		categoryColor: '#0c7c7c',
		title: 'Eating Right to Build Immunity Against Cold and Viral Infections',
		author: 'Dr. Diana Borgio',
		image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=450&fit=crop',
		publishDate: 'August 10, 2026',
		authorData: {
			name: 'Dr. Diana Borgio',
			designation: 'Senior Clinical Nutritionist & Immunologist',
			specialty: 'Preventive Nutrition & Immune System Health',
			bio: 'Dr. Diana Borgio is a renowned clinical nutritionist with over 12 years of experience specializing in preventive dietary interventions for immune system resilience and viral infection prevention.',
			credentials: 'MD, M.Sc. Clinical Nutrition',
			experience: '12+ Years Clinical Experience',
			avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
		},
		content: `Building a strong immune system starts with what you put on your plate. With seasonal shifts and viral risks, optimizing your daily intake of key micronutrients plays a crucial role in defending your body against infections.

Focusing on Whole, Nutritious Foods
Incorporating citrus fruits rich in Vitamin C, dark leafy greens packed with antioxidants, and zinc-dense seeds or legumes can significantly bolster white blood cell production. Hydration and gut health through probiotics like natural yogurt are equally foundational.

Evidence-Based Supplementation
While food remains the primary source of nutrients, targeted supplementation under medical guidance can fill critical gaps during high-risk seasons. Always consult with a certified clinical practitioner before starting high-dose vitamin regimens.`,
	},
	{
		id: 2,
		category: 'CORONAVIRUS',
		categoryColor: '#0c7c7c',
		title: '12 Coronavirus Myths and Facts That You Should Be Aware Of',
		author: 'Dr. Sarah Jenkins',
		image: 'https://images.unsplash.com/photo-1584118624012-df056829fbd0?w=800&h=450&fit=crop',
		publishDate: 'July 28, 2026',
		authorData: {
			name: 'Dr. Sarah Jenkins',
			designation: 'Consultant Pulmonologist & Epidemiologist',
			specialty: 'Respiratory Infections & Public Health Safety',
			bio: 'Dr. Sarah Jenkins is a board-certified pulmonologist and public health expert specializing in viral respiratory diseases and evidence-based epidemic management.',
			credentials: 'MD, FCCP (Preventive Medicine)',
			experience: '15+ Years Experience',
			avatar: 'https://images.unsplash.com/photo-1594824813566-78a93272d34e?w=200&h=200&fit=crop',
		},
		content: `Misinformation during public health crises can spread faster than viruses themselves. Distinguishing scientifically verified facts from internet myths is essential for personal and community safety.

Myth vs. Fact: Essential Guidance
1. Myth: Holding your breath for 10 seconds means you are virus-free.
Fact: This is not a reliable test. Only PCR or certified laboratory assays can accurately diagnose viral infection.

2. Myth: Warm weather completely eradicates transmission.
Fact: Respiratory viruses can transmit across various climates. Strict hand hygiene and proper ventilation remain vital protocols worldwide.`,
	},
	{
		id: 3,
		category: 'CARDIOVASCULAR HEALTH',
		categoryColor: '#0c7c7c',
		title: 'Essential Guidelines for Maintaining Optimal Heart Health at Any Age',
		author: 'Dr. Marcus Vance',
		image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=450&fit=crop',
		publishDate: 'June 14, 2026',
		authorData: {
			name: 'Dr. Marcus Vance',
			designation: 'Senior Interventional Cardiologist',
			specialty: 'Preventive Cardiology & Vascular Health',
			bio: 'Dr. Marcus Vance is a leading cardiologist dedicated to heart disease prevention, blood pressure management, and lifestyle medicine.',
			credentials: 'MD, FACC',
			experience: '18+ Years Cardiology Practice',
			avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop',
		},
		content: `Cardiovascular wellness is a lifelong commitment. Simple lifestyle modifications—such as 30 minutes of daily moderate aerobic exercise, maintaining a low-sodium Mediterranean diet, and managing stress levels—dramatically reduce long-term cardiac risks.

Key Indicators to Track Regularly
Monitoring systemic blood pressure, fasting lipid profiles, and blood glucose levels allows for early detection of pre-clinical vascular changes before adverse cardiovascular events occur.`,
	},
]

export default function ArticleSection() {
	const navigate = useNavigate()
	const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null)

	return (
		<Box sx={{ width: '100%', bgcolor: '#e5e9e9', py: 6 }}>
			<Container maxWidth="lg">
				<Grid container spacing={4} alignItems="center" sx={{ alignItems: { xs: 'stretch', md: 'center' } }}>
					{/* Left: Articles */}
					<Grid size={{ xs: 12, md: 8 }}>
						<Grid container spacing={3}>
							{articles.map((article) => (
								<Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
									<Box
										onClick={() => setSelectedArticle(article)}
										sx={{
											cursor: 'pointer',
											height: '100%',
											display: 'flex',
											flexDirection: 'column',
											'&:hover .article-img': { transform: 'scale(1.03)' },
										}}
									>
										{/* Image with rounded corners */}
										<Box
											sx={{
												borderRadius: '8px',
												overflow: 'hidden',
												height: { xs: 180, sm: 200 },
												mb: 1.5,
												boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
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
											variant="body2"
											sx={{
												color: '#0c7c7c',
												fontWeight: 700,
												fontSize: '11px',
												letterSpacing: '0.5px',
												mb: 0.5,
												textTransform: 'uppercase',
											}}
										>
											{article.category}
										</Typography>

										{/* Title */}
										<Typography variant="body1" fontWeight={600} sx={{ color: '#0f172a', lineHeight: 1.35 }}>
											{article.title}
										</Typography>

										{/* Author */}
										<Typography variant="body2" fontSize={'11px'} fontWeight={500} color="text.secondary" mt="auto" pt={1.5}>
											By {article.author}
										</Typography>
									</Box>
								</Grid>
							))}
						</Grid>
					</Grid>

					{/* Right: Text + Button */}
					<Grid size={{ xs: 12, md: 4 }}>
						<Box sx={{ pl: { md: 2 }, textAlign: { xs: 'center', md: 'left' } }}>
							<Typography variant="h3" sx={{ fontWeight: 600, color: '#0f172a' }}>
								Read top articles from health experts
							</Typography>
							<Typography variant="body2" sx={{ fontWeight: 400, color: 'text.secondary' }} my={3}>
								Health articles that keep you informed about good health practices and achieve your goals.
							</Typography>
							<AppButton
								label="See all articles"
								borderRadius="4px"
								onClick={() => navigate('/blogs')}
							/>
						</Box>
					</Grid>
				</Grid>
			</Container>

			{/* Article Reader Modal */}
			<AppModal
				open={Boolean(selectedArticle)}
				onClose={() => setSelectedArticle(null)}
				title={selectedArticle?.category ?? 'Health Article'}
				maxWidth="md"
				fullWidth
			>
				{selectedArticle && (
					<Box sx={{ pt: 1, pb: 2 }}>
						{/* Category Chip & Date */}
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
							<Chip
								label={selectedArticle.category}
								size="small"
								sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700, fontSize: '11px' }}
							/>
							{selectedArticle.publishDate && (
								<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
									{selectedArticle.publishDate}
								</Typography>
							)}
						</Box>

						{/* Title */}
						<Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ mb: 2.5, lineHeight: 1.3 }}>
							{selectedArticle.title}
						</Typography>

						{/* Cover Image */}
						<Box
							component="img"
							src={selectedArticle.image}
							alt={selectedArticle.title}
							sx={{
								width: '100%',
								maxHeight: 340,
								objectFit: 'cover',
								borderRadius: '10px',
								mb: 3,
							}}
						/>

						{/* Article Body Content */}
						<Box sx={{ color: '#334155', lineHeight: 1.8, fontSize: '0.975rem', mb: 3 }}>
							{selectedArticle.content.split('\n\n').map((para, idx) => (
								<Typography key={idx} variant="body1" sx={{ mb: 2, lineHeight: 1.7, color: '#334155' }}>
									{para}
								</Typography>
							))}
						</Box>

						{/* Author Information Section at the Bottom */}
						<AuthorInfoCard author={selectedArticle.authorData} />
					</Box>
				)}
			</AppModal>
		</Box>
	)
}
