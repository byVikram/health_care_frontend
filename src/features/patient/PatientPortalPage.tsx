// src/features/patient/PatientPortalPage.tsx
import { Box, Container } from '@mui/material'
import QuickServicesSection from '../dashboard/QuickServicesSection'
import ServicesSection from '../dashboard/ServiceSection'
import EmergencyBannerSection from '../dashboard/EmergencySection'
import SpecialitySection from '../dashboard/SpecialitySection'
import ConsultSection from '../dashboard/ConsultSection'
import ArticleSection from '../dashboard/ArticleSection'
import UpcomingEventsSection from '../dashboard/UpcomingEventsSection'
import CommunityBlogsSection from '../dashboard/CommunityBlogsSection'
import PatientHealthQuestionsSection from './components/PatientHealthQuestionsSection'
import BannerImage from '../../assets/Banner/banner.png'
import { Typography, Divider } from '@mui/material'

export default function PatientPortalPage() {
	return (
		<Box>
			{/* Banner Section */}
			<Box
				id="home"
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
					scrollMarginTop: { xs: 80, md: 96 },
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

			{/* Quick Services + Services */}
			<Container
				id="services"
				maxWidth="lg"
				sx={{ py: 5, display: 'flex', flexDirection: 'column', gap: 6, scrollMarginTop: { xs: 80, md: 96 } }}
			>
				<QuickServicesSection />
				<Divider />
				<ServicesSection />
			</Container>

			{/* Emergency Banner */}
			<EmergencyBannerSection />

			{/* Specialities + Consult */}
			<Container
				id="about"
				maxWidth="lg"
				sx={{ py: 5, display: 'flex', flexDirection: 'column', gap: 6, scrollMarginTop: { xs: 80, md: 96 } }}
			>
				<Divider />
				<SpecialitySection />
				<ConsultSection />
			</Container>

			{/* Articles / Blogs */}
			<Box id="blog-media" sx={{ scrollMarginTop: { xs: 80, md: 96 } }}>
				<ArticleSection />
			</Box>

			{/* Upcoming Events */}
			<Container
				id="events"
				maxWidth="lg"
				sx={{ py: 5, display: 'flex', flexDirection: 'column', gap: 6, scrollMarginTop: { xs: 80, md: 96 } }}
			>
				<UpcomingEventsSection />
			</Container>

			{/* Community & Blogs */}
			<Container
				id="community"
				maxWidth="lg"
				sx={{ py: 5, display: 'flex', flexDirection: 'column', gap: 6, scrollMarginTop: { xs: 80, md: 96 } }}
			>
				<CommunityBlogsSection />
			</Container>

			{/* Patient-specific Health Questions — unchanged */}
			<Container id="contact" maxWidth="lg" sx={{ py: 2, scrollMarginTop: { xs: 80, md: 96 } }}>
				<PatientHealthQuestionsSection />
			</Container>
		</Box>
	)
}
