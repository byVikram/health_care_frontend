// src/features/patient/PatientProfilePage.tsx
import { useState, useMemo, useEffect } from 'react'
import { Box, Container, Grid, Divider } from '@mui/material'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import AppProfileSidebar from '../../components/common/ProfileSidebar/AppProfileSidebar'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import PersonalTab from './components/PersonalTab'
import MedicalTab from './components/MedicalTab'
import LifeStyleTab from './components/LifeStyleTab'
import { Patient, PatientPersonal, PatientMedical, PatientLifeStyle } from '../../types/patient'
import { updatePatientProfile, getPatientDetails } from './patientService'
import { toast } from 'react-toastify'
import { useAvatarChange } from '../../hooks/useAvatarChange'
import { useAuth, setAuth } from '../../hooks/useAuth'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PatientSettingTab from './components/SettingsTab'
import SessionsTab from '../../components/common/SessionsTab/SessionsTab'
import PatientAddressesTab from './components/PatientAddressesTab'

const EMPTY_PATIENT: Patient = {
	id: '',
	personal: {
		name: '',
		contact_number: '',
		contact_verified: false,
		email: '',
		email_verified: false,
		gender: '',
		date_of_birth: '',
		blood_group: '',
		marital_status: '',
		height: '',
		weight: '',
		emergency_contact: { name: '', number: '' },
		location: '',
		avatar: '',
	},
	medical: {
		allergies: [],
		chronic_conditions: [],
		current_medications: [],
		past_surgeries: [],
		family_history: [],
	},
	lifestyle: {
		smoking_status: '',
		alcohol_consumption: '',
		activity_level: '',
		diet_type: '',
		sleep_hours: '',
	},
}

function calcCompletion(patient: Patient): number {
	const personalFields = Object.entries(patient.personal)
		.filter(([key]) => !['contact_verified', 'email_verified', 'avatar', 'emergency_contact'].includes(key))
		.map(([, val]) => val as string)
	const ecFields = [patient.personal.emergency_contact.name, patient.personal.emergency_contact.number]

	// For medical fields (string[]), count as filled if the array has at least one entry
	const medicalValues = Object.values(patient.medical).map((arr) =>
		Array.isArray(arr) ? (arr.length > 0 ? 'filled' : '') : arr
	)

	const allFields = [
		...personalFields,
		...ecFields,
		...medicalValues,
		...Object.values(patient.lifestyle),
	]
	const filled = allFields.filter((v) => v && String(v).trim()).length
	return Math.round((filled / allFields.length) * 100)
}

export default function PatientProfilePage() {
	const [activeTab, setActiveTab] = useState<string>('personal')
	const [patient, setPatient] = useState<Patient>(EMPTY_PATIENT)
	const [loading, setLoading] = useState(false)
	const { role, user, accessToken, refreshToken, lookupData } = useAuth()

	// Whose profile this is: the account chosen in the header's switcher, which is the signed-in patient or one of
	// their family members. A photo change must go to that person (`memberId` is set only for a family member).
	const selfId = lookupData?.patient_profiles?.find((p) => p.is_self)?.id ?? user?.id
	const activePatientId = localStorage.getItem('patient_id') || selfId
	const memberId = activePatientId && selfId && activePatientId !== selfId ? activePatientId : undefined

	useEffect(() => {
		const fetchPatient = async () => {
			try {
				setLoading(true)
				const patientId = localStorage.getItem('patient_id') || selfId
				if (!patientId) {
					toast.error('We could not find your patient profile. Please log in again.')
					return
				}
				const data = await getPatientDetails(patientId)
				setPatient(data.data)
			} catch (err) {
				console.error('Failed to load patient:', err)
			} finally {
				setLoading(false)
			}
		}
		fetchPatient()
	}, [selfId])

	const [dirtyPersonal, setDirtyPersonal] = useState<Partial<PatientPersonal>>({})
	const [dirtyMedical, setDirtyMedical] = useState<Partial<PatientMedical>>({})
	const [dirtyLifeStyle, setDirtyLifeStyle] = useState<Partial<PatientLifeStyle>>({})

	const completionPercent = useMemo(() => calcCompletion(patient), [patient])

	const handlePersonalChange = (updated: Partial<PatientPersonal>) => {
		setPatient((prev) => ({ ...prev, personal: { ...prev.personal, ...updated } }))
		setDirtyPersonal((prev) => ({ ...prev, ...updated }))
	}

	const handleMedicalChange = (updated: Partial<PatientMedical>) =>
		setPatient((prev) => ({ ...prev, medical: { ...prev.medical, ...updated } }))

	const handleLifeStyleChange = (updated: Partial<PatientLifeStyle>) =>
		setPatient((prev) => ({ ...prev, lifestyle: { ...prev.lifestyle, ...updated } }))

	const handleMedicalDirtyChange = (updated: Partial<PatientMedical>) =>
		setDirtyMedical((prev) => ({ ...prev, ...updated }))

	const handleLifeStyleDirtyChange = (updated: Partial<PatientLifeStyle>) =>
		setDirtyLifeStyle((prev) => ({ ...prev, ...updated }))

	const handleMedicalUpdate = (updated: Partial<PatientMedical>) => {
		handleMedicalChange(updated)
		handleMedicalDirtyChange(updated)
	}

	const handleLifeStyleUpdate = (updated: Partial<PatientLifeStyle>) => {
		handleLifeStyleChange(updated)
		handleLifeStyleDirtyChange(updated)
	}

	const { change: handleAvatarChange, remove: handleAvatarRemove, busy: avatarBusy } = useAvatarChange({
		current: patient.personal.avatar ?? '',
		patientId: memberId,
		onChanged: (avatar) => setPatient((prev) => ({ ...prev, personal: { ...prev.personal, avatar } })),
		// keep the header's copies in step: the account list entry of the person whose photo changed and, only when it
		// is the signed-in patient's own photo, the signed-in user's avatar
		onSaved: (avatar) =>
			setAuth(
				role!,
				memberId ? user! : { ...user!, avatar },
				accessToken!,
				refreshToken!,
				lookupData && {
					...lookupData,
					patient_profiles: lookupData.patient_profiles.map((p) =>
						p.id === (memberId ?? selfId) ? { ...p, avatar_s3_key: avatar } : p
					),
				}
			),
	})

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
					<MedicalTab data={patient.medical} onChange={handleMedicalUpdate} handleSave={handleMedicalSave} />
				)
			case 'lifestyle':
				return (
					<LifeStyleTab
						data={patient.lifestyle}
						onChange={handleLifeStyleUpdate}
						handleSave={handleLifeStyleSave}
					/>
				)

			case 'settings':
				return (
					<PatientSettingTab />
				)

			case 'sessions':
				return <SessionsTab />

			case 'addresses':
				return <PatientAddressesTab />

			default:
				return null
		}
	}
	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
			<Container maxWidth="lg">
				<Grid container spacing={3}>
					{loading ? (
						<>
							{/* Skeleton: left sidebar */}
							<Grid size={{ xs: 12, md: 3 }}>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
									<Box
										sx={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: 1.5,
											p: 3,
										}}
									>
										<AppSkeleton width={90} height={90} sx={{ borderRadius: '50%' }} />
										<AppSkeleton variant="text" width={140} height={24} />
										<AppSkeleton variant="text" width={110} height={20} />
										<AppSkeleton width={160} height={10} />
									</Box>
									<Divider />
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											flexDirection: 'column',
											gap: 1,
											px: 2,
										}}
									>
										<AppSkeleton variant="text" width={180} height={36} />
										<AppSkeleton variant="text" width={180} height={36} />
										<AppSkeleton variant="text" width={180} height={36} />
									</Box>
								</Box>
							</Grid>
							{/* Skeleton: right content area */}
							<Grid size={{ xs: 12, md: 9 }}>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
									<AppSkeleton variant="text" width={200} height={32} />
									<AppSkeleton height={56} />
									<AppSkeleton height={56} />
									<AppSkeleton height={56} />
									<AppSkeleton height={56} />
									<Divider sx={{ my: 1 }} />
									<AppSkeleton variant="text" width={200} height={32} />
									<AppSkeleton height={56} />
									<AppSkeleton height={56} />
									<AppSkeleton height={56} />
								</Box>
							</Grid>
						</>
					) : (
						<>
							<Grid size={{ xs: 12, md: 3 }}>
								<AppProfileSidebar
									avatar={patient.personal.avatar}
									name={patient.personal.name}
									subTitle={patient.personal.contact_number}
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
										{
											id: 'lifestyle',
											label: 'Life Style',
											icon: <SpaOutlinedIcon fontSize="small" />,
										},
										{
											id: 'addresses',
											label: 'My Addresses',
											icon: <LocationOnOutlinedIcon fontSize="small" />,
										},
										{
											id: 'sessions',
											label: 'Active Sessions',
											icon: <DesktopWindowsOutlinedIcon fontSize="small" />,
										},
										{
											id: 'settings',
											label: 'Settings',
											icon: <SettingsOutlinedIcon fontSize="small" />,
										},
									]}
									activeTab={activeTab}
									onTabChange={setActiveTab}
									onAvatarChange={handleAvatarChange}
									onAvatarRemove={handleAvatarRemove}
									avatarBusy={avatarBusy}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 9 }}>{renderTab()}</Grid>
						</>
					)}
				</Grid>
			</Container>
		</Box>
	)
}
