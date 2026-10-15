// src/features/dashboard/PodcastsSection.tsx
import { Box, Typography, Grid } from '@mui/material'

const podcasts = [
	{
		id: 1,
		type: 'Podcast',
		title: 'Healthy Habits for a Busy Life',
		image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop&crop=center',
	},
	{
		id: 2,
		type: 'Videocast',
		title: 'Expert Panel on Chronic Disease Management',
		image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop&crop=center',
	},
	{
		id: 3,
		type: 'Podcast',
		title: 'Mindfulness for Stress Reduction',
		image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=300&fit=crop&crop=center',
	},
]

export default function PodcastsSection() {
	return (
		<Box maxWidth={'960px'} m={'auto'}>
			{/* Heading */}
			<Typography variant={'h3'} fontWeight={500} align="center" sx={{ mb: 3 }}>
				Podcasts & Videocasts
			</Typography>

			{/* <Typography
				variant={'h3'}
				align={variant === 'column' ? 'left' : 'center'}
				mb={variant === 'column' ? 2 : 3}
				// fontWeight={variant === 'column' ? 400 : 500}
				fontWeight={500}
				fontSize={variant === 'column' ? '16px' : '1.5rem'}
			>
				Community & Blogs
			</Typography> */}

			{/* Cards ??? centered together */}
			<Grid container spacing={3} justifyContent="center">
				{podcasts.map((podcast) => (
					<Grid key={podcast.id} size={{ xs: 12, sm: 6, md: 4 }}>
						<Box
							sx={{
								height: '100%',
								bgcolor: '#fff',
								border: '1px solid #e0e0e0',
								borderRadius: '10px',
								overflow: 'hidden',
								display: 'flex',
								flexDirection: 'column',
								transition: 'box-shadow 0.2s ease',
								cursor: 'pointer',
								'&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
								'&:hover .podcast-img': { transform: 'scale(1.03)' },
							}}
						>
							{/* Image ??? no tag inside */}
							<Box sx={{ height: { xs: 180, sm: 170 }, overflow: 'hidden', flexShrink: 0 }}>
								<Box
									component="img"
									src={podcast.image}
									alt={podcast.title}
									className="podcast-img"
									sx={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										objectPosition: 'center',
										display: 'block',
										transition: 'transform 0.3s ease',
									}}
								/>
							</Box>

							{/* Content ??? tag moved below image */}
							<Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
								{/* Type tag below image */}
								<Box
									sx={{
										display: 'inline-flex',
										alignSelf: 'flex-start',
										border: '1px solid #ccc',
										borderRadius: '20px',
										px: 1.2,
									}}
								>
									<Typography variant="body1">{podcast.type}</Typography>
								</Box>

								{/* Title */}
								<Typography variant="body1">{podcast.title}</Typography>

								{/* Watch/Listen */}
								<Typography
									color="neutral.main"
									variant="body1"
									sx={{ mt: 'auto' }} // 🔥 pushes it to bottom
								>
									Watch/Listen
								</Typography>
							</Box>
						</Box>
					</Grid>
				))}
			</Grid>
		</Box>
	)
}
