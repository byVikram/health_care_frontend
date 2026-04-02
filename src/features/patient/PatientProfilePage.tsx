// src/features/patient/PatientProfilePage.tsx
import { useState, useMemo } from 'react'
import { Box, Container, Grid } from '@mui/material'
import AppProfileSidebar from '../../components/common/ProfileSidebar/AppProfileSidebar'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import PersonalTab from './components/PersonalTab'
import MedicalTab from './components/MedicalTab'
import LifeStyleTab from './components/LifeStyleTab'
import { Patient, PatientPersonal, PatientMedical, PatientLifeStyle } from '../../types/patient'
import { updatePatientProfile } from './patientService'
import { toast } from 'react-toastify'

const MOCK_PATIENT: Patient = {
	id: 'patient-001',
	personal: {
		name: 'Nitin',
		contactNumber: '+91-7892502634',
		contactVerified: true,
		email: '',
		emailVerified: false,
		gender: '',
		dateOfBirth: '',
		bloodGroup: '',
		maritalStatus: '',
		height: '',
		weight: '',
		emergencyContact: { name: '', number: '' },
		location: '',
		avatar: '',
	},
	medical: {
		allergies: '',
		chronicConditions: '',
		currentMedications: '',
		pastSurgeries: '',
		familyHistory: '',
	},
	lifeStyle: {
		smokingStatus: '',
		alcoholConsumption: '',
		activityLevel: '',
		dietType: '',
		sleepHours: '',
	},
}

function calcCompletion(patient: Patient): number {
	const personalFields = Object.entries(patient.personal)
		.filter(([key]) => !['contactVerified', 'emailVerified', 'avatar', 'emergencyContact'].includes(key))
		.map(([, val]) => val as string)
	const ecFields = [patient.personal.emergencyContact.name, patient.personal.emergencyContact.number]
	const allFields = [
		...personalFields,
		...ecFields,
		...Object.values(patient.medical),
		...Object.values(patient.lifeStyle),
	]
	const filled = allFields.filter((v) => v && String(v).trim()).length
	return Math.round((filled / allFields.length) * 100)
}

export default function PatientProfilePage() {
	const [activeTab, setActiveTab] = useState<string>('personal')
	const [patient, setPatient] = useState<Patient>(MOCK_PATIENT)

	const [dirtyPersonal, setDirtyPersonal] = useState<Partial<PatientPersonal>>({})
	const [dirtyMedical, setDirtyMedical] = useState<Partial<PatientMedical>>({})
	const [dirtyLifeStyle, setDirtyLifeStyle] = useState<Partial<PatientLifeStyle>>({})

	const completionPercent = useMemo(() => calcCompletion(patient), [patient])

	const handlePersonalChange = (updated: Partial<PatientPersonal>) => {
		setPatient((prev) => ({ ...prev, personal: { ...prev.personal, ...updated } }))

		setDirtyPersonal((prev) => ({
			...prev,
			...updated,
		}))
	}

	const handleMedicalChange = (updated: Partial<PatientMedical>) =>
		setPatient((prev) => ({ ...prev, medical: { ...prev.medical, ...updated } }))

	const handleLifeStyleChange = (updated: Partial<PatientLifeStyle>) =>
		setPatient((prev) => ({ ...prev, lifeStyle: { ...prev.lifeStyle, ...updated } }))

	const handleMedicalDirtyChange = (updated: Partial<PatientMedical>) =>
		setDirtyMedical((prev) => ({
			...prev,
			...updated,
		}))

	const handleLifeStyleDirtyChange = (updated: Partial<PatientLifeStyle>) =>
		setDirtyLifeStyle((prev) => ({
			...prev,
			...updated,
		}))

	const handleMedicalUpdate = (updated: Partial<PatientMedical>) => {
		handleMedicalChange(updated)
		handleMedicalDirtyChange(updated)
	}

	const handleLifeStyleUpdate = (updated: Partial<PatientLifeStyle>) => {
		handleLifeStyleChange(updated)
		handleLifeStyleDirtyChange(updated)
	}

	const handleAvatarChange = (file: File) => {
		const url = URL.createObjectURL(file)
		setPatient((prev) => ({ ...prev, personal: { ...prev.personal, avatar: url } }))
	}

	const handlePersonalSave = async () => {
		if (!Object.keys(dirtyPersonal).length) return
		const res = await updatePatientProfile(patient.id, dirtyPersonal)
		toast.success(res.message || 'Personal details updated')
		setDirtyPersonal({})
	}

	const handleMedicalSave = async () => {
		if (!Object.keys(dirtyMedical).length) return
		const res = await updatePatientProfile(patient.id, dirtyMedical)
		toast.success(res.message || 'Medical details updated')
		setDirtyMedical({})
	}

	const handleLifeStyleSave = async () => {
		if (!Object.keys(dirtyLifeStyle).length) return
		const res = await updatePatientProfile(patient.id, dirtyLifeStyle)
		toast.success(res.message || 'Life style details updated')
		setDirtyLifeStyle({})
	}

	const renderTab = () => {
		switch (activeTab) {
			case 'personal':
				return (
					<PersonalTab
						data={patient.personal}
						onChange={handlePersonalChange}
						onAvatarChange={handleAvatarChange}
						handleSave={handlePersonalSave}
					/>
				)
			case 'medical':
				return (
					<MedicalTab
						data={patient.medical}
						onChange={handleMedicalUpdate}
						handleSave={handleMedicalSave}
					/>
				)
			case 'lifestyle':
				return (
					<LifeStyleTab
						data={patient.lifeStyle}
						onChange={handleLifeStyleUpdate}
						handleSave={handleLifeStyleSave}
					/>
				)
			default:
				return null
		}
	}

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
			<Container maxWidth="lg">
				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 3 }}>
						<AppProfileSidebar
							avatar={patient.personal.avatar}
							name={patient.personal.name}
							subTitle={patient.personal.contactNumber}
							completionPercent={completionPercent}
							backLabel="Patient Profile"
							navItems={[
								{
									id: 'personal',
									label: 'Personal details',
									icon: <PersonOutlineIcon fontSize="small" />,
								},
								{
									id: 'medical',
									label: 'Medical',
									icon: <MedicalServicesOutlinedIcon fontSize="small" />,
								},
								{ id: 'lifestyle', label: 'Life Style', icon: <SpaOutlinedIcon fontSize="small" /> },
							]}
							activeTab={activeTab}
							onTabChange={setActiveTab}
							onAvatarChange={handleAvatarChange}
						/>
					</Grid>

					<Grid size={{ xs: 12, md: 9 }}>{renderTab()}</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
