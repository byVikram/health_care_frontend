// src/features/dashboard/CommunityBlogsSection.tsx
import { Box, Typography, Grid, Container } from '@mui/material'
import AppButton from '../../components/common/Button/AppButton'
// import blogImage from '../../assets/blog-and-community/blog-1.png'
import blogImage from '../../assets/blog-and-community/blog-1.svg'
import groupImage from '../../assets/blog-and-community/community-1.svg'

const communities = [
	{
		id: 1,
		name: 'Diabatics Associations',
		location: 'Rajajinagar, Bengaluru',
		avatar: groupImage,
	},
	{
		id: 2,
		name: 'Lions Health Club',
		location: 'Koramangala, Bengaluru',
		avatar: groupImage,
	},
	{
		id: 3,
		name: 'Yoga Wellness Team',
		location: 'Basavanagudi, Bengaluru.',
		avatar: groupImage,
	},
	{
		id: 4,
		name: 'Yoga Wellness Team',
		location: 'Basavanagudi, Bengaluru.',
		avatar: groupImage,
	},
]

const blogs = [
	{
		id: 1,
		title: 'The Future of Digital Health: What to Expect!',
		description:
			'Explore how technology is transforming healthcare, from AI diagnostics to personalized treatment plans.',
		author: 'By Dr. Emily White',
		date: '15 May 2024',
		image: blogImage,
	},
	{
		id: 2,
		title: 'Understanding Telemedicine: Your Guide to Virtual Care',
		description:
			'A comprehensive guide to telemedicine services, benefits, and how to get started with virtual consultations.',
		author: 'By Dr. Emily White',
		date: '15 May 2024',
		image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=220&fit=crop',
	},
]

export default function CommunityBlogsSection() {
	return (
		<Box sx={{ py: 6, bgcolor: 'background.default' }}>
			<Container maxWidth="lg">
				{/* Heading */}
				<Typography variant="h3" align="center" sx={{ mb: 4, fontWeight: 700 }}>
					Community & Blogs
				</Typography>

				<Grid container spacing={3} alignItems="stretch">
					{/* Left: Community List */}
					<Grid size={{ xs: 12, md: 5 }}>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
							{communities.map((community) => (
								<Box
									key={community.id}
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 2,
										bgcolor: '#fff',
										border: '1px solid #e0e0e0',
										borderRadius: '12px',
										px: 2,
										py: 1.5,
										flex: 1,
										transition: 'box-shadow 0.2s ease',
										'&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
									}}
								>
									{/* Avatar */}
									<Box
										component="img"
										src={community.avatar}
										alt={community.name}
										sx={{
											width: 52,
											height: 52,
											borderRadius: '50%',
											objectFit: 'cover',
											flexShrink: 0,
										}}
									/>

									{/* Info */}
									<Box sx={{ flex: 1 }}>
										<Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'text.primary' }}>
											{community.name}
										</Typography>
										<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
											{community.location}
										</Typography>
									</Box>

									{/* Button */}
									<AppButton
										variant="outlined"
										label="View Community"
										sx={{
											borderRadius: '8px',
											fontSize: '11px',
											px: 1.5,
											py: 0.5,
											whiteSpace: 'nowrap',
											borderColor: '#0c7c7c',
											color: '#0c7c7c',
											'&:hover': { bgcolor: '#f0f9f9' },
										}}
									/>
								</Box>
							))}
						</Box>
					</Grid>

					{/* Right: Blog Cards */}
					<Grid size={{ xs: 12, md: 7 }}>
						<Grid container spacing={2} sx={{ height: '100%' }}>
							{blogs.map((blog) => (
								<Grid size={{ xs: 12, sm: 6 }} key={blog.id}>
									<Box
										sx={{
											bgcolor: '#fff',
											border: '1px solid #e0e0e0',
											borderRadius: '14px',
											overflow: 'hidden',
											display: 'flex',
											flexDirection: 'column',
											height: '100%',
											transition: 'box-shadow 0.2s ease',
											'&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.10)' },
											'&:hover .blog-img': { transform: 'scale(1.03)' },
										}}
									>
										{/* Image */}
										<Box sx={{ overflow: 'hidden', height: 180 }}>
											<Box
												component="img"
												src={blog.image}
												alt={blog.title}
												className="blog-img"
												sx={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													display: 'block',
													transition: 'transform 0.3s ease',
												}}
											/>
										</Box>

										{/* Content */}
										<Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
											<Typography
												sx={{
													fontWeight: 700,
													fontSize: '15px',
													color: 'text.primary',
													lineHeight: 1.4,
												}}
											>
												{blog.title}
											</Typography>
											<Typography
												sx={{ fontSize: '13px', color: 'text.secondary', lineHeight: 1.5 }}
											>
												{blog.description}
											</Typography>
											<Typography
												sx={{
													fontSize: '13px',
													color: '#0c7c7c',
													fontWeight: 600,
													cursor: 'pointer',
													'&:hover': { textDecoration: 'underline' },
												}}
											>
												Read More
											</Typography>
											<Box
												sx={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
													mt: 'auto',
												}}
											>
												<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
													{blog.author}
												</Typography>
												<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
													{blog.date}
												</Typography>
											</Box>
										</Box>
									</Box>
								</Grid>
							))}
						</Grid>
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
