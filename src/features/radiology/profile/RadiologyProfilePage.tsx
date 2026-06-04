// src/features/radiology/profile/RadiologyProfilePage.tsx
import { useState, useMemo } from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'
import AppProfileSidebar from '../../../components/common/ProfileSidebar/AppProfileSidebar'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import MiscellaneousServicesOutlinedIcon from '@mui/icons-material/MiscellaneousServicesOutlined'
import RadiologyPersonalTab, { RadiologyProfilePersonal } from './components/PersonalTab'
import RadiologyProfessionalTab from './components/ProfessionalTab'
import {RadiologyProfileProfessional,EMPTY_RADIOLOGY_PROFESSIONAL} from '../../../types/radiology-profile'
import RadiologySettingTab from './components/SettingsTab'
import { customCardStyle } from '../../../styles/commonStyles'

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

// ─── localStorage helpers ─────────────────────────────────────────────────────

function readPersonal(): RadiologyProfilePersonal {
	const EMPTY: RadiologyProfilePersonal = {
		name: '',
		contactNumber: '',
		contactVerified: false,
		email: '',
		emailVerified: false,
		alternateMobile: '',
		whatsappNumber: '',
		avatar: '',
	}
	try {
		const stored = localStorage.getItem('radiology_personal_tab')
		return stored ? (JSON.parse(stored) as RadiologyProfilePersonal) : EMPTY
	} catch {
		return EMPTY
	}
}

function readProfessional(): RadiologyProfileProfessional {
	try {
		const stored = localStorage.getItem('radiology_professional_tab')
		return stored ? (JSON.parse(stored) as RadiologyProfileProfessional) : EMPTY_RADIOLOGY_PROFESSIONAL
	} catch {
		return EMPTY_RADIOLOGY_PROFESSIONAL
	}
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function RadiologyProfilePage() {
	const [activeTab, setActiveTab] = useState<string>('personal')

	// Lazy initialisers: read localStorage once on mount, no useEffect needed
	const [profile, setProfile] = useState<RadiologyProfile>(() => ({
		id: '',
		personal: readPersonal(),
		professional: readProfessional(),
	}))

	const completionPercent = useMemo(() => calcCompletion(profile), [profile])

	const handlePersonalChange = (updated: Partial<RadiologyProfilePersonal>) =>
		setProfile((prev) => ({ ...prev, personal: { ...prev.personal, ...updated } }))

	const handleProfessionalChange = (updated: Partial<RadiologyProfileProfessional>) =>
		setProfile((prev) => ({ ...prev, professional: { ...prev.professional, ...updated } }))

	const handleAvatarChange = (file: File) => {
		const localPreviewUrl = URL.createObjectURL(file)
		setProfile((prev) => ({ ...prev, personal: { ...prev.personal, avatar: localPreviewUrl } }))
	}

	const renderTab = () => {
		switch (activeTab) {
			case 'personal':
				return <RadiologyPersonalTab data={profile.personal} onChange={handlePersonalChange} />
			case 'professional':
				return <RadiologyProfessionalTab data={profile.professional} onChange={handleProfessionalChange} />
			case 'services':
				return (
					<Box sx={{ ...customCardStyle, p: 4, color: 'text.secondary', textAlign: 'center' }}>
						<Typography>Service details — coming soon</Typography>
					</Box>
				)
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
