// src/features/consultation/ConsultationPage.tsx
import { useState } from 'react'
// import { customCardStyle } from '../../styles/commonStyles'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Container, Typography, Avatar, Tab, Tabs, IconButton } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import PhoneIcon from '@mui/icons-material/Phone'
import Grid from '@mui/material/Grid'
import AppButton from '../../components/common/Button/AppButton'
import PatientInfoCard from './components/PatientInfoCard'
import PastMedicalHistory from './components/PastMedicalHistory'
import ShareWith from './components/ShareWith'
import VitalsTab from './components/VitalsTab'
import ConsultationNotes from './components/ConsultationNotes'
import { ConsultationPatient, ConsultationDoctor } from '../../types/consultation'

const MOCK_PATIENT: ConsultationPatient = {
	id: 'p001',
	patientId: 'PID1120',
	name: 'Nitin S H',
	age: 31,
	gender: 'Male',
	phone: '919871236540',
	phoneVerified: true,
	email: 'nitin@gmail.com',
	avatar: 'https://i.pravatar.cc/150?img=11',
	dateOfBirth: '06 April 1994',
	maritalStatus: 'Single',
	weight: '78kg',
	height: '5 feet 5 inch',
	bloodGroup: 'A+',
	address: '#201 1st floor beside colive pg near jeevika hospital bengaluru karnataka-560056',
	occupation: 'IT Profession',
	emergencyContact: {
		name: 'Sachin S H',
		relation: 'Brother',
		number: '9876543210',
	},
	chronicDiseases: ['Diabetes', 'Hypertension', 'Asthma'],
	allergies: ['Pet allergy', 'Egg', 'Milk'],
	smokingStatus: 'Non-smoker',
	alcoholConsumption: 'Non-drinker',
	dietType: 'Vegetarian',
}

const MOCK_DOCTOR: ConsultationDoctor = {
	name: 'Dr. Ashika Rao',
	degree: 'MBBS MD',
	specialization: 'Dentist Consultation',
	clinicName: 'Arogya Clinic',
	clinicAddress: '1 main, KR Market, Bengaluru - 580036',
}

export default function ConsultationPage() {
	const [activeTab, setActiveTab] = useState(0)
	const navigate = useNavigate()

	const { patientId, appointmentId } = useParams()

	console.log(patientId, appointmentId)

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			{/* Header */}
			<Box
				sx={{
					bgcolor: 'background.paper',
					borderBottom: '1px solid',
					borderColor: 'divider',
					px: 3,
					py: 1.5,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					position: 'sticky',
					top: 0,
					zIndex: 100,
				}}
			>
				{/* Left: back + patient info */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<IconButton
						size="small"
						onClick={() => navigate(-1)}
						sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
					>
						<ArrowBackIosNewIcon sx={{ fontSize: 15 }} />
					</IconButton>

					<Avatar
						src={MOCK_PATIENT.avatar}
						alt={MOCK_PATIENT.name}
						sx={{ width: 40, height: 40, border: '2px solid', borderColor: 'primary.main' }}
					/>

					<Box>
						<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '14px' }}>
							{MOCK_PATIENT.name}
						</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
								{MOCK_PATIENT.age} years / {MOCK_PATIENT.gender}
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>
								|
							</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
								<PhoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
								<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
									{MOCK_PATIENT.phone}
								</Typography>
							</Box>
						</Box>
					</Box>
				</Box>

				{/* Right: Follow up button */}
				<AppButton variant="contained" label="+ Follow up" borderRadius="20px" sx={{ px: 4 }} />
			</Box>

			{/* Tabs */}
			<Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
				<Tabs
					value={activeTab}
					onChange={(_, v) => setActiveTab(v)}
					sx={{
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 500,
							fontSize: '14px',
							color: 'text.secondary',
						},
						'& .Mui-selected': { color: 'primary.main', fontWeight: 700 },
						'& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3, borderRadius: '2px' },
					}}
				>
					<Tab label="Info & Timeline" />
					<Tab label="Vitals" />
				</Tabs>
			</Box>

			{/* Tab content */}
			<Container maxWidth="lg" sx={{ py: 3 }}>
				{activeTab === 0 && (
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<PatientInfoCard patient={MOCK_PATIENT} />
							<PastMedicalHistory />
						</Grid>
						<Grid size={{ xs: 12, md: 6 }} display={'flex'} flexDirection={'column'}>
							<ConsultationNotes doctor={MOCK_DOCTOR} />
							<ShareWith />
						</Grid>
					</Grid>
				)}
				{activeTab === 1 && <VitalsTab />}
			</Container>
		</Box>
	)
}
