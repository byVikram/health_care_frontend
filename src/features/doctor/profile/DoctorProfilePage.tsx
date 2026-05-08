// src/features/doctor/profile/DoctorProfilePage.tsx
import { useState, useMemo, useEffect } from 'react'
import { Box, Container, Grid, CircularProgress, Typography } from '@mui/material'
import AppProfileSidebar from '../../../components/common/ProfileSidebar/AppProfileSidebar'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import DoctorPersonalTab from './components/DoctorPersonalTab'
import DoctorProfessionalTab from './components/DoctorProfessionalTab'
import DoctorHospitalsTab from './components/DoctorHospitalsTab'
import DoctorAvailabilityTab from './components/DoctorAvailabilityTab'
import DoctorSettingTab from './components/DoctorSettingTab'
import DoctorFavouritesTab from './components/DoctorFavouritesTab'
import { DoctorProfile, DoctorProfilePersonal, DoctorProfileProfessional } from '../../../types/doctor-profile'
import { customCardStyle } from '../../../styles/commonStyles'
import { getDoctorProfile, mapDoctorProfileApi } from '../doctorService'
import { useAuth, setAuth, LookupData } from '../../../hooks/useAuth'
import ApiService from '../../../services/apiService'

const DOCTOR_NAV_ITEMS = [
	{ id: 'personal', label: 'Personal details', icon: <PersonOutlineIcon fontSize="small" /> },
	{ id: 'professional', label: 'Professional details', icon: <WorkOutlineIcon fontSize="small" /> },
	{ id: 'hospitals', label: 'My hospitals', icon: <LocalHospitalOutlinedIcon fontSize="small" /> },
	{ id: 'availability', label: 'Availability', icon: <EventAvailableOutlinedIcon fontSize="small" /> },
	{ id: 'favourites', label: 'Favourite doctors', icon: <FavoriteBorderIcon fontSize="small" /> },
	{ id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
]

function calcCompletion(doctor: DoctorProfile): number {
	const personalFields = Object.entries(doctor.personal)
		.filter(([key]) => !['contactVerified', 'emailVerified', 'avatar', 'languages', 'instagram', 'facebook'].includes(key))
		.map(([, val]) => val as string)
	const langFilled = doctor.personal.languages?.length > 0 ? 1 : 0
	const professionalFields = Object.values(doctor.professional) as string[]
	const allFields = [...personalFields, ...professionalFields]
	const filled = allFields.filter((v) => v && String(v).trim()).length + langFilled
	return Math.round((filled / (allFields.length + 1)) * 100)
}

export default function DoctorProfilePage() {
	const [activeTab, setActiveTab] = useState<string>('personal')
	const [doctor, setDoctor] = useState<DoctorProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const { role, user, accessToken, refreshToken, lookupData } = useAuth()

	// ── Fetch on mount ──────────────────────────────────────────────────────────
	useEffect(() => {
		getDoctorProfile()
			.then((res) => {
				if (res.success) {
					setDoctor(mapDoctorProfileApi(res.data))
				} else {
					setError(res.message)
				}
			})
			.catch(() => setError('Failed to load profile'))
			.finally(() => setLoading(false))
	}, [])

	const completionPercent = useMemo(() => (doctor ? calcCompletion(doctor) : 0), [doctor])

	const handlePersonalChange = (updated: Partial<DoctorProfilePersonal>) =>
		setDoctor((prev) => (prev ? { ...prev, personal: { ...prev.personal, ...updated } } : prev))

	const handleProfessionalChange = (updated: Partial<DoctorProfileProfessional>) =>
		setDoctor((prev) => (prev ? { ...prev, professional: { ...prev.professional, ...updated } } : prev))

	const handleAvatarChange = async (file: File) => {
		const localPreviewUrl = URL.createObjectURL(file)
		setDoctor((prev) => (prev ? { ...prev, personal: { ...prev.personal, avatar: localPreviewUrl } } : prev))

		try {
			const formData = new FormData()
			formData.append('file', file)
			const res = await ApiService.post<{ avatar_url: string }>('/api/doctors/upload-avatar', formData)
			const newAvatarUrl = res.data.avatar_url

			setDoctor((prev) => (prev ? { ...prev, personal: { ...prev.personal, avatar: newAvatarUrl } } : prev))

			setAuth(
				role!,
				{ ...user!, avatar: newAvatarUrl },
				accessToken!,
				refreshToken!,
				lookupData
			)
		} catch (err) {
			console.error('Avatar upload failed', err)
		}
	}

	const handleHospitalsChange = (hospitals: DoctorProfile['hospitals']) =>
		setDoctor((prev) => (prev ? { ...prev, hospitals } : prev))

	const handleAvailabilityChange = (availability: DoctorProfile['availability']) =>
		setDoctor((prev) => (prev ? { ...prev, availability } : prev))

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<CircularProgress sx={{ color: 'primary.main' }} />
			</Box>
		)
	}

	if (error || !doctor) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<Typography variant="body1" sx={{ color: 'error.main' }}>
					{error ?? 'Failed to load profile'}
				</Typography>
			</Box>
		)
	}

	const renderTab = () => {
		switch (activeTab) {
			case 'personal':
				return <DoctorPersonalTab data={doctor.personal} onChange={handlePersonalChange} />
			case 'professional':
				return <DoctorProfessionalTab data={doctor.professional} onChange={handleProfessionalChange} />
			case 'hospitals':
				return <DoctorHospitalsTab hospitals={doctor.hospitals} onChange={handleHospitalsChange} />
			case 'availability':
				return (
					<DoctorAvailabilityTab
						hospitals={doctor.hospitals}
						availability={doctor.availability}
						onChange={handleAvailabilityChange}
					/>
				)
			case 'favourites':
				return <DoctorFavouritesTab />
			case 'settings':
				return <DoctorSettingTab />
			default:
				return (
					<Box sx={{ ...customCardStyle, p: 4, color: 'text.secondary', textAlign: 'center' }}>
						Coming soon...
					</Box>
				)
		}
	}

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
			<Container maxWidth="lg">
				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 3 }}>
						<AppProfileSidebar
							avatar={doctor.personal.avatar}
							name={doctor.personal.name}
							subTitle={doctor.specialization}
							completionPercent={completionPercent}
							backLabel="Doctor Profile"
							navItems={DOCTOR_NAV_ITEMS}
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
