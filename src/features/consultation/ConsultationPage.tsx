// src/features/consultation/ConsultationPage.tsx
import { useEffect, useState } from 'react'
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
import { getPatientDetails } from '../../services/userService'
import { Patient } from '../../types/patient'
import { getAppointmentById } from '../../services/userService'
import { Appointment } from '../../types/appointment'

interface PatientDetailsResponse {
	success: boolean
	message: string
	data: Patient
}

interface AppointmentDetailsResponse {
	success: boolean
	message: string
	data: Appointment
}

const MOCK_DOCTOR: ConsultationDoctor = {
	name: 'Dr. Ashika Rao',
	degree: 'MBBS MD',
	specialization: 'Dentist Consultation',
	clinicName: 'Arogya Clinic',
	clinicAddress: '1 main, KR Market, Bengaluru - 580036',
}

const splitCsv = (value: string) =>
	value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean)

const formatDisplayValue = (value: string) =>
	value
		.trim()
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase())

const formatMetricValue = (value: string, unit: string) => {
	const trimmedValue = value.trim()
	if (!trimmedValue) return ''

	return /^-?\d+(\.\d+)?$/.test(trimmedValue) ? `${Number(trimmedValue)} ${unit}` : trimmedValue
}

const formatDateOfBirth = (dateOfBirth: string) => {
	if (!dateOfBirth) return ''

	const [year, month, day] = dateOfBirth.split('-').map(Number)
	const parsedDate = new Date(year, (month || 1) - 1, day || 1)

	return Number.isNaN(parsedDate.getTime())
		? dateOfBirth
		: parsedDate.toLocaleDateString('en-GB', {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
			})
}

const getAge = (dateOfBirth: string) => {
	if (!dateOfBirth) return 0

	const [year, month, day] = dateOfBirth.split('-').map(Number)
	if (!year || !month || !day) return 0

	const today = new Date()
	let age = today.getFullYear() - year
	const hasBirthdayPassed =
		today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day)

	if (!hasBirthdayPassed) {
		age -= 1
	}

	return age
}

const mapPatientToConsultationPatient = (patient: Patient): ConsultationPatient => ({
	id: patient.id,
	patientId: patient.id,
	name: patient.personal.name,
	age: getAge(patient.personal.date_of_birth),
	gender: formatDisplayValue(patient.personal.gender),
	phone: patient.personal.contact_number,
	phoneVerified: patient.personal.contact_verified,
	email: patient.personal.email,
	avatar: patient.personal.avatar || '',
	dateOfBirth: formatDateOfBirth(patient.personal.date_of_birth),
	maritalStatus: formatDisplayValue(patient.personal.marital_status),
	weight: formatMetricValue(patient.personal.weight, 'kg'),
	height: formatMetricValue(patient.personal.height, 'cm'),
	bloodGroup: patient.personal.blood_group,
	address: patient.personal.location,
	occupation: '',
	emergencyContact: {
		name: patient.personal.emergency_contact.name,
		relation: '',
		number: patient.personal.emergency_contact.number,
	},
	chronicDiseases: splitCsv(patient.medical.chronic_conditions),
	allergies: splitCsv(patient.medical.allergies),
	smokingStatus: formatDisplayValue(patient.lifestyle.smoking_status),
	alcoholConsumption: formatDisplayValue(patient.lifestyle.alcohol_consumption),
	dietType: formatDisplayValue(patient.lifestyle.diet_type),
})

export default function ConsultationPage() {
	const [activeTab, setActiveTab] = useState(0)
	const navigate = useNavigate()

	const { patientId, appointmentId } = useParams()

	const [patient, setPatient] = useState<Patient | null>(null)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [appointment, setAppointment] = useState<Appointment | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			if (!patientId || !appointmentId) {
				setLoading(false)
				return
			}

			try {
				const [patientRes, appointmentRes] = await Promise.allSettled([
					getPatientDetails(patientId) as Promise<PatientDetailsResponse>,
					getAppointmentById(appointmentId) as Promise<AppointmentDetailsResponse>,
				])

				if (patientRes.status === 'fulfilled') {
					setPatient(patientRes.value.data)
				} else {
					console.error('Error fetching patient details', patientRes.reason)
				}

				if (appointmentRes.status === 'fulfilled') {
					setAppointment(appointmentRes.value.data)
				} else {
					console.error('Error fetching appointment details', appointmentRes.reason)
				}
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [patientId, appointmentId])

	if (loading) return <div>Loading...</div>
	if (!patient) return <div>Unable to load patient details.</div>

	const consultationPatient = mapPatientToConsultationPatient(patient)
	
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
						src={patient.personal.avatar || undefined}
						alt={patient.personal.name}
						sx={{ width: 40, height: 40, border: '2px solid', borderColor: 'primary.main' }}
					/>

					<Box>
						<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '14px' }}>
							{patient.personal.name}
						</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
								{consultationPatient.gender}
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>
								|
							</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
								<PhoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
								<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
									{patient.personal.contact_number}
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
							<PatientInfoCard patient={consultationPatient} />
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
