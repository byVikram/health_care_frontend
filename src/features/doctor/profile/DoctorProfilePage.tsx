// src/features/doctor/profile/DoctorProfilePage.tsx
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Container, Grid, CircularProgress, Typography } from '@mui/material'
import AppProfileSidebar from '../../../components/common/ProfileSidebar/AppProfileSidebar'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import DoctorPersonalTab from './components/DoctorPersonalTab'
import DoctorProfessionalTab from './components/DoctorProfessionalTab'
import DoctorHospitalsTab from './components/DoctorHospitalsTab'
import DoctorAvailabilityTab from './components/DoctorAvailabilityTab'
import DoctorBankDetailsTab from './components/DoctorBankDetailsTab'
import DoctorSettingTab from './components/DoctorSettingTab'
import DoctorFavouritesTab from './components/DoctorFavouritesTab'
import DoctorAdditionalDetailTab from './components/DoctorAdditionalDetailTab'
import DoctorAchievementsTab from './components/DoctorAchievementsTab'
import SessionsTab from '../../../components/common/SessionsTab/SessionsTab'
import {
	DoctorProfile,
	DoctorProfilePersonal,
	DoctorProfileProfessional,
	DoctorAdditionalDetail,
} from '../../../types/doctor-profile'
import { customCardStyle } from '../../../styles/commonStyles'
import { getDoctorProfile, mapDoctorProfileApi, updateAdditionalDetails } from '../doctorService'
import { useAuth, setAuth } from '../../../hooks/useAuth'
import { useAvatarChange } from '../../../hooks/useAvatarChange'

const DOCTOR_NAV_ITEMS = [
	{ id: 'personal', label: 'Personal details', icon: <PersonOutlineIcon fontSize="small" /> },
	{ id: 'professional', label: 'Professional details', icon: <WorkOutlineIcon fontSize="small" /> },
	{ id: 'hospitals', label: 'My hospitals', icon: <LocalHospitalOutlinedIcon fontSize="small" /> },
	{ id: 'availability', label: 'Availability', icon: <EventAvailableOutlinedIcon fontSize="small" /> },
	{ id: 'bank-details', label: 'Bank Details', icon: <AccountBalanceOutlinedIcon fontSize="small" /> },
	{ id: 'additional', label: 'Additional Details', icon: <MedicalServicesOutlinedIcon fontSize="small" /> },
	{ id: 'achievements', label: 'Achievements', icon: <EmojiEventsOutlinedIcon fontSize="small" /> },
	{ id: 'favourites', label: 'Favourite doctors', icon: <FavoriteBorderIcon fontSize="small" /> },
	{ id: 'sessions', label: 'Active Sessions', icon: <DesktopWindowsOutlinedIcon fontSize="small" /> },
	{ id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
]

function calcCompletion(doctor: DoctorProfile): number {
	const personalFields = Object.entries(doctor.personal)
		.filter(
			([key]) =>
				!['contactVerified', 'emailVerified', 'avatar', 'languages', 'instagram', 'facebook'].includes(key)
		)
		.map(([, val]) => val as string)
	const langFilled = doctor.personal.languages?.length > 0 ? 1 : 0
	const professionalFields = Object.values(doctor.professional) as string[]
	const allFields = [...personalFields, ...professionalFields]
	const filled = allFields.filter((v) => v && String(v).trim()).length + langFilled
	return Math.round((filled / (allFields.length + 1)) * 100)
}

export default function DoctorProfilePage() {
	const location = useLocation()
	const queryParams = new URLSearchParams(location.search)
	const tabFromUrl = queryParams.get('tab')
	const [activeTab, setActiveTab] = useState<string>(tabFromUrl || 'personal')
	const [doctor, setDoctor] = useState<DoctorProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const { role, user, accessToken, refreshToken, lookupData } = useAuth()

	// ── Fetch profile ───────────────────────────────────────────────────────────
	const fetchProfile = useCallback(() => {
		setLoading(true)
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

	// useEffect(() => {
	// 	fetchProfile()
	// }, [fetchProfile])

	useEffect(() => {
		const loadProfile = async () => {
			setLoading(true)

			try {
				const res = await getDoctorProfile()

				if (res.success) {
					setDoctor(mapDoctorProfileApi(res.data))
				} else {
					setError(res.message)
				}
			} catch {
				setError('Failed to load profile')
			} finally {
				setLoading(false)
			}
		}

		loadProfile()
	}, [])

	const completionPercent = useMemo(() => (doctor ? calcCompletion(doctor) : 0), [doctor])

	const handlePersonalChange = (updated: Partial<DoctorProfilePersonal>) =>
		setDoctor((prev) => (prev ? { ...prev, personal: { ...prev.personal, ...updated } } : prev))

	const handleProfessionalChange = (updated: Partial<DoctorProfileProfessional>) =>
		setDoctor((prev) => (prev ? { ...prev, professional: { ...prev.professional, ...updated } } : prev))

	// the photo is compulsory for doctors: it can be replaced but not removed, so no `remove` is wired
	const { change: handleAvatarChange, busy: avatarBusy } = useAvatarChange({
		current: doctor?.personal.avatar ?? '',
		onChanged: (avatar) => setDoctor((prev) => (prev ? { ...prev, personal: { ...prev.personal, avatar } } : prev)),
		onSaved: (avatar) => setAuth(role!, { ...user!, avatar }, accessToken!, refreshToken!, lookupData),
	})

	const handleHospitalsChange = (hospitals: DoctorProfile['hospitals']) =>
		setDoctor((prev) => (prev ? { ...prev, hospitals } : prev))

	const handleAvailabilityChange = (availability: DoctorProfile['availability']) =>
		setDoctor((prev) => (prev ? { ...prev, availability } : prev))

	const handleAdditionalDetailChange = (updated: Partial<DoctorAdditionalDetail>) =>
		setDoctor((prev) => (prev ? { ...prev, additionalDetail: { ...prev.additionalDetail, ...updated } as DoctorAdditionalDetail } : prev))

	const handleAdditionalDetailsSave = async () => {
		if (!doctor?.additionalDetail) return
		try {
			const payload = {
				treatments: doctor.additionalDetail.treatments.map((t) => t.id),
				areas_of_expertise: doctor.additionalDetail.areas_of_expertise.map((a) => a.id),
			}
			await updateAdditionalDetails(payload)
			fetchProfile()
		} catch (err) {
			console.error('Failed to save additional details', err)
			setError('Failed to save additional details')
		}
	}

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
				return (
					<DoctorPersonalTab
						data={doctor.personal}
						onChange={handlePersonalChange}
						onSaveSuccess={fetchProfile}
					/>
				)
			case 'professional':
				return (
					<DoctorProfessionalTab
						data={doctor.professional}
						onChange={handleProfessionalChange}
						onSaveSuccess={fetchProfile}
					/>
				)
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
			case 'bank-details':
				return <DoctorBankDetailsTab />
			case 'additional':
				return (
					<DoctorAdditionalDetailTab
						data={doctor.additionalDetail ?? { treatments: [], areas_of_expertise: [] }}
						onChange={handleAdditionalDetailChange}
						handleSave={handleAdditionalDetailsSave}
					/>
				)
			case 'achievements':
				return <DoctorAchievementsTab />
			case 'favourites':
				return <DoctorFavouritesTab />
			case 'sessions':
				return <SessionsTab />
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
							avatarBusy={avatarBusy}
							avatarRequired
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 9 }}>{renderTab()}</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
