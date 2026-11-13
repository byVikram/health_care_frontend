// features/auth/WelcomePage.tsx
import { Box, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppButton from '../../components/common/Button/AppButton'
import logoImg from '../../assets/logo/logo.png'
import welcomeDoctorImg from '../../assets/Banner/welcome-doctor.png'
import { ROUTES } from '../../constants/routes'
import homeCareImg from '../../assets/ancillary/home-care.png'
import nursingCareImg from '../../assets/ancillary/nursing-care.png'
import appointmentsIcon from '../../assets/icons/appointments.svg'
import carePlanIcon from '../../assets/icons/care-plan.svg'
import confirmIcon from '../../assets/icons/confirm.svg'
import pharmacyIcon from '../../assets/icons/pharmacy.svg'
import referIcon from '../../assets/icons/refer.svg'
import remindersIcon from '../../assets/icons/reminders.svg'
import treatmentIcon from '../../assets/icons/treatment.svg'

// ── Per-role config ────────────────────────────────────────────────────────

type RoleKey = 'doctor' | 'patient' | 'ancillary' | 'pharmacy' | 'radiology'

interface WelcomeConfig {
	greeting: string
	subtitle: string
	buttonLabel: string
	image: string
	nextRoute: string
	features: { icon: string; title: string; description: string }[]
}

const WELCOME_CONFIG: Record<RoleKey, WelcomeConfig> = {
	doctor: {
		greeting: 'Welcome Doctor! 👋',
		subtitle: "Let's help you get started on Whisper ai by making your Doctor Profile.",
		buttonLabel: 'Create a Free Profile',
		image: welcomeDoctorImg,
		nextRoute: ROUTES.DOCTOR_ACCOUNT_DETAILS,
		features: [
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/9439/9439123.png',
				title: 'Profile',
				description: 'Makes you visible to the hundreds of patients searching on Whisper ai.com',
			},
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/15869/15869487.png',
				title: 'Feedback',
				description: "You can view and reply to patients' feedback here",
			},
			{
				icon: appointmentsIcon,
				title: 'Appointments',
				description: 'Set your hours, confirm requests and check patients in',
			},
			{
				icon: treatmentIcon,
				title: 'Notes & Prescriptions',
				description: 'Write notes with history and vitals beside you',
			},
			{
				icon: remindersIcon,
				title: 'Follow-ups',
				description: 'Recommend one and we remind the patient to book it',
			},
		],
	},

	patient: {
		greeting: 'Welcome! 👋',
		subtitle: "Let's get your health journey started on Whisper ai.",
		buttonLabel: 'Set Up My Profile',
		image: welcomeDoctorImg,
		nextRoute: ROUTES.PORTAL.PROFILE,
		features: [
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/9439/9439123.png',
				title: 'Profile',
				description: 'Complete your health profile so doctors can give you the best care',
			},
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/3063/3063176.png',
				title: 'Book Appointments',
				description: 'Find and book appointments with top doctors near you instantly',
			},
			{
				icon: homeCareImg,
				title: 'Home Care',
				description: 'Nurses and physiotherapists at your door, on demand',
			},
			{
				icon: pharmacyIcon,
				title: 'Pharmacy',
				description: 'Order your prescribed medicines from pharmacies near you',
			},
		],
	},


	ancillary: {
		greeting: 'Welcome! 👋',
		subtitle: "Let's set up your home-care profile so patients can book you.",
		buttonLabel: 'Set Up My Profile',
		image: welcomeDoctorImg,
		nextRoute: ROUTES.PORTAL.PROFILE,
		features: [
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/9439/9439123.png',
				title: 'Profile',
				description: 'Add your qualifications, licence and services',
			},
			{
				icon: homeCareImg,
				title: 'Home Visits',
				description: 'Receive home-care requests, now or scheduled for later',
			},
			{
				icon: nursingCareImg,
				title: 'Services',
				description: 'Nursing, physiotherapy, rehab and elder day care',
			},
			{
				icon: confirmIcon,
				title: 'Verification',
				description: 'We check your documents before requests arrive',
			},
			{
				icon: carePlanIcon,
				title: 'Visit Records',
				description: 'Note the tasks and observations of every visit',
			},
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/15869/15869487.png',
				title: 'Reviews',
				description: 'Build your reputation with ratings from patients',
			},
		],
	},

	pharmacy: {
		greeting: 'Welcome PHARMACY👋',
		subtitle: "Let's get your pharmacy listed and ready to serve patients.",
		buttonLabel: 'Set Up Pharmacy Profile',
		image: welcomeDoctorImg,
		nextRoute: ROUTES.PORTAL.PROFILE,
		features: [
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/9439/9439123.png',
				title: 'Profile',
				description: 'Get discovered by patients looking for pharmacies on Whisper ai',
			},
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/2907/2907846.png',
				title: 'Inventory',
				description: 'Manage your medicine inventory and keep availability up to date',
			},
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/3063/3063176.png',
				title: 'Orders',
				description: 'Receive and fulfil prescription orders from patients directly',
			},
		],
	},

	radiology: {
		greeting: 'Welcome Radiologist👋 ',
		subtitle: "Let's set up your radiology centre and connect with patients.",
		buttonLabel: 'Set Up Radiology Profile',
		image: welcomeDoctorImg,
		nextRoute: ROUTES.PORTAL.PROFILE,
		features: [
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/9439/9439123.png',
				title: 'Profile',
				description: 'Showcase your imaging services to patients and referring doctors',
			},
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/2913/2913584.png',
				title: 'Scans & Imaging',
				description: 'List your MRI, CT, X-ray and other imaging services with details',
			},
			{
				icon: 'https://cdn-icons-png.flaticon.com/128/15869/15869487.png',
				title: 'Reports',
				description: 'Share digital radiology reports with patients and doctors instantly',
			},
			{
				icon: appointmentsIcon,
				title: 'Bookings',
				description: 'Manage every scan booking in one place',
			},
			{
				icon: referIcon,
				title: 'Referrals',
				description: 'Receive patients referred to you by doctors',
			},
		],
	},
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
	role?: RoleKey
	onContinue?: () => void
}

export default function WelcomePage({ role: roleProp, onContinue }: Props) {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const roleKey = (roleProp ?? searchParams.get('role') ?? 'doctor') as RoleKey
	const config = WELCOME_CONFIG[roleKey] ?? WELCOME_CONFIG.doctor

	const handleContinue = () => {
		if (onContinue) {
			onContinue()
		} else {
			navigate(config.nextRoute)
		}
	}

	return (
		<Box
			sx={{
				width: '100vw',
				minHeight: '100vh',
				backgroundColor: '#fff',
				display: 'flex',
				flexDirection: 'column',
				padding: '24px 48px',
			}}
		>
			{/* Logo */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
				<Box component="img" src={logoImg} alt="Whisper AI" sx={{ width: 56, height: 56, objectFit: 'contain' }} />
				<Box>
					<Typography sx={{ color: '#0d9488', fontWeight: '500', fontSize: '28px', lineHeight: 1.2 }}>
						Whisper ai.
					</Typography>
					<Typography sx={{ color: '#0d9488', fontSize: '13px' }}>Smart Care. Simple Access</Typography>
				</Box>
			</Box>

			{/* Main Content */}
			<Box sx={{ display: 'flex', flex: 1, gap: '40px', alignItems: 'center' }}>
				{/* Left */}
				<Box sx={{ flex: 1 }}>
					<Typography variant="h4" sx={{ fontWeight: '700', mb: 1.5, fontSize: '40px' }}>
						{config.greeting}
					</Typography>
					<Typography sx={{ fontSize: '17px', color: '#555', mb: 4 }}>
						{config.subtitle}
					</Typography>

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mb: 3 }}>
						{config.features.map((feature, i) => (
							<Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
								<Box
									sx={{
										width: 48, height: 48, borderRadius: '50%',
										backgroundColor: '#e6f7f6',
										display: 'flex', alignItems: 'center', justifyContent: 'center',
										flexShrink: 0,
									}}
								>
									<img src={feature.icon} alt={feature.title} style={{ width: 28, height: 28 }} />
								</Box>
								<Typography sx={{ fontSize: '15px', color: '#333', lineHeight: 1.6 }}>
									<span style={{ fontWeight: 'bold' }}>{feature.title}</span> - {feature.description}
								</Typography>
							</Box>
						))}
					</Box>

					<AppButton
						onClick={handleContinue}
						label={config.buttonLabel}
						sx={{ py: 2, px: 5, fontSize: '17px', fontWeight: 600, borderRadius: '10px' }}
					/>
				</Box>

				{/* Right */}
				<Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Box
						component="img"
						src={config.image}
						alt={`Welcome ${roleKey}`}
						sx={{ width: '100%', maxWidth: '560px', objectFit: 'contain' }}
					/>
				</Box>
			</Box>

			<Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#aaa', pt: 3 }}>
				© {new Date().getFullYear()} Whisper ai. All rights reserved.
			</Typography>
		</Box>
	)
}
