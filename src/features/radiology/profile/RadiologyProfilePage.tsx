// src/features/radiology/profile/RadiologyProfilePage.tsx
import { useState, useMemo, useEffect } from 'react'
import { Box, Container, Grid, Typography, CircularProgress } from '@mui/material'
import AppProfileSidebar from '../../../components/common/ProfileSidebar/AppProfileSidebar'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import MiscellaneousServicesOutlinedIcon from '@mui/icons-material/MiscellaneousServicesOutlined'
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined'
import SessionsTab from '../../../components/common/SessionsTab/SessionsTab'
import RadiologyPersonalTab, { RadiologyProfilePersonal } from './components/PersonalTab'
import RadiologyProfessionalTab from './components/ProfessionalTab'
import { RadiologyProfileProfessional, EMPTY_RADIOLOGY_PROFESSIONAL } from '../../../types/radiology-profile'
import RadiologySettingTab from './components/SettingsTab'
import RadiologyServiceTab from './components/RadiologyServiceTab'
import { customCardStyle } from '../../../styles/commonStyles'
import { getMyRadiologyProfile, mapRadiologyDetailsApi } from '../radiologyService'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RadiologyProfile {
	id: string
	personal: RadiologyProfilePersonal
	professional: RadiologyProfileProfessional
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const RADIOLOGY_NAV_ITEMS = [
	{ id: 'personal', label: 'Personal details', icon: <PersonOutlineIcon fontSize="small" /> },
	{ id: 'professional', label: 'Professional details', icon: <WorkOutlineIcon fontSize="small" /> },
	{ id: 'services', label: 'Service details', icon: <MiscellaneousServicesOutlinedIcon fontSize="small" /> },
	{ id: 'sessions', label: 'Active Sessions', icon: <DesktopWindowsOutlinedIcon fontSize="small" /> },
	{ id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
]

// ─── Completion calculator ────────────────────────────────────────────────────

function calcCompletion(profile: RadiologyProfile): number {
	const personalFields = Object.entries(profile.personal)
		.filter(([key]) => !['contactVerified', 'emailVerified', 'avatar'].includes(key))
		.map(([, val]) => String(val ?? ''))
	const professionalFields = Object.values(profile.professional).map((v) =>
		Array.isArray(v) ? (v.length > 0 ? 'filled' : '') : String(v ?? '')
	)
	const allFields = [...personalFields, ...professionalFields]
	const filled = allFields.filter((v) => v && String(v).trim()).length
	return Math.round((filled / allFields.length) * 100)
}

const EMPTY_PERSONAL: RadiologyProfilePersonal = {
	name: '',
	contactNumber: '',
	contactVerified: false,
	email: '',
	emailVerified: false,
	alternateMobile: '',
	whatsappNumber: '',
	avatar: '',
}

const EMPTY_RADIOLOGY: RadiologyProfile = {
	id: '',
	personal: EMPTY_PERSONAL,
	professional: EMPTY_RADIOLOGY_PROFESSIONAL,
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function RadiologyProfilePage() {
	const [activeTab, setActiveTab] = useState<string>('personal')
	const [profile, setProfile] = useState<RadiologyProfile>(EMPTY_RADIOLOGY)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoading(true)
				const res = await getMyRadiologyProfile()
				if (res.success && res.data) {
					setProfile(mapRadiologyDetailsApi(res.data))
				}
			} catch (err: unknown) {
				const status = (err as { response?: { status?: number } })?.response?.status
				if (status !== 404) {
					setError(`Failed to load radiology profile. (${status ?? 'unknown'})`)
				}
			} finally {
				setLoading(false)
			}
		}
		fetchProfile()
	}, [])

	const completionPercent = useMemo(() => calcCompletion(profile), [profile])

	const handlePersonalChange = (updated: Partial<RadiologyProfilePersonal>) =>
		setProfile((prev) => ({ ...prev, personal: { ...prev.personal, ...updated } }))

	const handleProfessionalChange = (updated: Partial<RadiologyProfileProfessional>) =>
		setProfile((prev) => ({ ...prev, professional: { ...prev.professional, ...updated } }))

	const handleAvatarChange = (file: File) => {
		const localPreviewUrl = URL.createObjectURL(file)
		setProfile((prev) => ({ ...prev, personal: { ...prev.personal, avatar: localPreviewUrl } }))
	}

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<CircularProgress sx={{ color: 'primary.main' }} />
			</Box>
		)
	}

	if (error) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<Typography variant="body1" sx={{ color: 'error.main' }}>
					{error}
				</Typography>
			</Box>
		)
	}

	const renderTab = () => {
		switch (activeTab) {
			case 'personal':
				return <RadiologyPersonalTab data={profile.personal} onChange={handlePersonalChange} />
			case 'professional':
				return <RadiologyProfessionalTab data={profile.professional} onChange={handleProfessionalChange} />
			case 'services':
				return <RadiologyServiceTab />
			case 'sessions':
				return <SessionsTab />
			case 'settings':
				return <RadiologySettingTab />
			default:
				return (
					<Box sx={{ ...customCardStyle, p: 4, color: 'text.secondary', textAlign: 'center' }}>
						<Typography>Coming soon...</Typography>
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
							avatar={profile.personal.avatar}
							name={profile.personal.name}
							subTitle="Radiologist"
							completionPercent={completionPercent}
							backLabel="Radiology Profile"
							navItems={RADIOLOGY_NAV_ITEMS}
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
