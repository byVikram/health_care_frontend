import { Box, Typography, Divider, Container } from '@mui/material'
import BannerImage from '../../assets/Banner/banner.png'
import SpecialitySection from './SpecialitySection'
import ConsultSection from './ConsultSection'
import QuickServicesSection from './QuickServicesSection'
import ArticleSection from './ArticleSection'
import UpcomingEventsSection from './UpcomingEventsSection'
import CommunityBlogsSection from './CommunityBlogsSection'
import PodcastsSection from './PodcastsSection'
import HealthQuestionsSection from './HealthQuestionsSection'

import ServicesSection from './ServiceSection'

export default function DashboardPage() {
	return (
		<Box>
			{/* Banner Section */}
			<Box
				sx={{
					position: 'relative',
					minHeight: { xs: 'auto', md: '580px' },
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					alignItems: 'center',
					justifyContent: 'space-evenly',
					gap: { xs: 4, md: 6 },
					px: { xs: 3, sm: 4, md: 6 },
					py: { xs: 6, md: 0 },
					textAlign: { xs: 'center', md: 'left' },
					background: 'linear-gradient(135deg,#0f4c4c,#0c7c7c)',
				}}
			>
				<Box
					sx={{
						maxWidth: '480px',
						color: '#fff',
						position: 'relative',
						top: { xs: 0, md: '-60px' },
					}}
				>
					<Typography
						variant="h1"
						sx={{
							fontSize: { xs: '32px', sm: '40px', md: '48px' },
							lineHeight: 1.2,
							mb: 2,
						}}
					>
						Your One-Stop <br /> Healthcare Portal
					</Typography>

					<Typography
						variant="body1"
						sx={{
							maxWidth: '520px',
							mx: { xs: 'auto', md: 0 },
							fontSize: { xs: '14px', sm: '16px' },
						}}
					>
						Access comprehensive medical services, connect with specialists, and manage your health journey
						with ease and confidence.
					</Typography>
				</Box>

				<Box
					component="img"
					src={BannerImage}
					alt="Doctors"
					sx={{
						width: { xs: '220px', sm: '300px', md: '500px' },
						height: 'auto',
						objectFit: 'contain',
						position: 'relative',
						bottom: '-40px',
					}}
				/>

				<Box
					sx={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						width: '100%',
						height: '120px',
						background: 'linear-gradient(to bottom, #1E505900 0%, #1E5059 100%)',
						pointerEvents: 'none',
					}}
				/>
			</Box>

			{/* Main Content Container */}
			<Container maxWidth="lg" sx={{ py: 5, display: 'flex', flexDirection: 'column', gap: 6 }}>
				{/* Quick Services Icon Grid */}
				<QuickServicesSection />

				<Divider />
				<ServicesSection />

				<Divider />

				{/* Speciality Section */}
				<SpecialitySection />

				<Divider />

				{/* Consult Section */}
				<ConsultSection />
			</Container>

			{/* Article Section — full width background */}
			<ArticleSection />

			{/* Upcoming Events Section */}
			<Container maxWidth="lg" sx={{ py: 5, display: 'flex', flexDirection: 'column', gap: 6 }}>
				<UpcomingEventsSection />
			</Container>

			<Container maxWidth="lg" sx={{ py: 5, display: 'flex', flexDirection: 'column', gap: 6 }}>
				{/* Community & Blogs Section */}
				<CommunityBlogsSection />
				<PodcastsSection />
			</Container>

			{/* Podcasts & Videocasts Section */}

			{/* Health Questions Section */}
			<HealthQuestionsSection />
		</Box>
	)
}
