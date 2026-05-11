// src/features/laboratory/profile/LaboratoryProfilePage.tsx
import { useState, useMemo, useEffect } from 'react'
import { Box, Container, Grid, CircularProgress, Typography } from '@mui/material'
import AppProfileSidebar from '../../../components/common/ProfileSidebar/AppProfileSidebar'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LabPersonalTab from './components/LabPersonalTab'
import { LaboratoryProfile, LaboratoryProfilePersonal } from '../../../types/laboratory-profile'
import { customCardStyle } from '../../../styles/commonStyles'
import { getLaboratoryProfile, mapLaboratoryProfileApi } from '../laboratoryService'
import { useAuth, setAuth } from '../../../hooks/useAuth'
import ApiService from '../../../services/apiService'

const LAB_NAV_ITEMS = [
	{ id: 'personal', label: 'Personal details', icon: <PersonOutlineIcon fontSize="small" /> },
	{ id: 'professional', label: 'Professional details', icon: <WorkOutlineIcon fontSize="small" /> },
	{ id: 'services', label: 'Services', icon: <ScienceOutlinedIcon fontSize="small" /> },
	{ id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
]

function calcCompletion(lab: LaboratoryProfile): number {
	const personalFields = Object.entries(lab.personal)
		.filter(([key]) => !['contactVerified', 'emailVerified', 'avatar', 'instagram', 'facebook'].includes(key))
		.map(([, val]) => val as string)
	const professionalFields = Object.values(lab.professional) as string[]
	const allFields = [...personalFields, ...professionalFields]
	const filled = allFields.filter((v) => v && String(v).trim()).length
	return Math.round((filled / allFields.length) * 100)
}

export default function LaboratoryProfilePage() {
	const [activeTab, setActiveTab] = useState<string>('personal')
	const [lab, setLab] = useState<LaboratoryProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const { role, user, accessToken, refreshToken, lookupData } = useAuth()

	// ── Fetch on mount ──────────────────────────────────────────────────────────
	useEffect(() => {
		getLaboratoryProfile()
			.then((res) => {
				if (res.success) {
					setLab(mapLaboratoryProfileApi(res.data))
				} else {
					setError(res.message)
				}
			})
			.catch(() => setError('Failed to load profile'))
			.finally(() => setLoading(false))
	}, [])

	const completionPercent = useMemo(() => (lab ? calcCompletion(lab) : 0), [lab])

	const handlePersonalChange = (updated: Partial<LaboratoryProfilePersonal>) =>
		setLab((prev) => (prev ? { ...prev, personal: { ...prev.personal, ...updated } } : prev))

	// const handleProfessionalChange = (updated: Partial<LaboratoryProfileProfessional>) =>
	// 	setLab((prev) => (prev ? { ...prev, professional: { ...prev.professional, ...updated } } : prev))

	const handleAvatarChange = async (file: File) => {
		const localPreviewUrl = URL.createObjectURL(file)
		setLab((prev) => (prev ? { ...prev, personal: { ...prev.personal, avatar: localPreviewUrl } } : prev))

		try {
			const formData = new FormData()
			formData.append('file', file)
			const res = await ApiService.post<{ avatar_url: string }>('/api/laboratory/upload-avatar', formData)
			const newAvatarUrl = res.data.avatar_url

			setLab((prev) => (prev ? { ...prev, personal: { ...prev.personal, avatar: newAvatarUrl } } : prev))

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

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<CircularProgress sx={{ color: 'primary.main' }} />
			</Box>
		)
	}

	if (error || !lab) {
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
				return <LabPersonalTab data={lab.personal} onChange={handlePersonalChange} />
			case 'professional':
				return (
					<Box sx={{ ...customCardStyle, p: 4, color: 'text.secondary', textAlign: 'center' }}>
						Coming soon...
					</Box>
				)
			case 'services':
				return (
					<Box sx={{ ...customCardStyle, p: 4, color: 'text.secondary', textAlign: 'center' }}>
						Coming soon...
					</Box>
				)
			case 'settings':
				return (
					<Box sx={{ ...customCardStyle, p: 4, color: 'text.secondary', textAlign: 'center' }}>
						Coming soon...
					</Box>
				)
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
							avatar={lab.personal.avatar}
							name={lab.personal.name}
							subTitle={lab.labType}
							completionPercent={completionPercent}
							backLabel="Laboratory Profile"
							navItems={LAB_NAV_ITEMS}
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
