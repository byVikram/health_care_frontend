// src/features/Pharmacy/profile/PharmacyProfilePage.tsx
import { useState, useMemo } from 'react'
import { Box, Container, Grid, CircularProgress, Typography } from '@mui/material'
import AppProfileSidebar from '../../../components/common/ProfileSidebar/AppProfileSidebar'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import PharmacyPersonalTab from '../components/PersonalTab'
import PharmacyProfessionalTab, { PharmacyProfileProfessional } from '../components/ProfessionalTab'
import PharmacySettingTab from '../components/SettingsTab'
import { customCardStyle } from '../../../styles/commonStyles'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PharmacyProfilePersonal {
	name: string
	contactNumber: string
	contactVerified: boolean
	email: string
	emailVerified: boolean
	gender: string
	dateOfBirth: string
	location: string
	avatar: string
	instagram: string
	facebook: string
}

export type { PharmacyProfileProfessional }

export interface PharmacyProfile {
	id: string
	pharmacyType: string
	personal: PharmacyProfilePersonal
	professional: PharmacyProfileProfessional
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const PHARMACY_NAV_ITEMS = [
	{ id: 'personal', label: 'Personal details', icon: <PersonOutlineIcon fontSize="small" /> },
	{ id: 'professional', label: 'Professional details', icon: <WorkOutlineIcon fontSize="small" /> },
	{ id: 'inventory', label: 'Inventory', icon: <MedicationOutlinedIcon fontSize="small" /> },
	{ id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
]

// ─── Completion calculator ─────────────────────────────────────────────────────

function calcCompletion(pharmacy: PharmacyProfile): number {
	const personalFields = Object.entries(pharmacy.personal)
		.filter(([key]) => !['contactVerified', 'emailVerified', 'avatar', 'instagram', 'facebook'].includes(key))
		.map(([, val]) => val as string)
	const professionalFields = Object.values(pharmacy.professional) as string[]
	const allFields = [...personalFields, ...professionalFields]
	const filled = allFields.filter((v) => v && String(v).trim()).length
	return Math.round((filled / allFields.length) * 100)
}

// ─── Default / empty state ────────────────────────────────────────────────────

const EMPTY_PHARMACY: PharmacyProfile = {
	id: '',
	pharmacyType: '',
	personal: {
		name: '',
		contactNumber: '',
		contactVerified: false,
		email: '',
		emailVerified: false,
		gender: '',
		dateOfBirth: '',
		location: '',
		avatar: '',
		instagram: '',
		facebook: '',
	},
	professional: {
		specializationId: '',
		specializationLabel: '',
		degree: '',
		college: '',
		yearOfPassing: '',
		qualificationProof: '',
		registrationNumber: '',
		statePharmacyCouncil: '',
		licenseExpiryDate: '',
		registrationProof: '',
		currentWorkplace: '',
		yearsOfExperience: '',
		pharmacyType: '',
		previousOrganization: '',
		certificationName: '',
		certificationProof: '',
		about: '',
	},
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function PharmacyProfilePage() {
	const [activeTab, setActiveTab] = useState<string>('personal')
	const [pharmacy, setPharmacy] = useState<PharmacyProfile>(EMPTY_PHARMACY)
	const [loading] = useState(false)
	const [error] = useState<string | null>(null)

	const completionPercent = useMemo(() => calcCompletion(pharmacy), [pharmacy])

	const handlePersonalChange = (updated: Partial<PharmacyProfilePersonal>) =>
		setPharmacy((prev) => ({ ...prev, personal: { ...prev.personal, ...updated } }))

	const handleProfessionalChange = (updated: Partial<PharmacyProfileProfessional>) =>
		setPharmacy((prev) => ({ ...prev, professional: { ...prev.professional, ...updated } }))

	const handleAvatarChange = (file: File) => {
		const localPreviewUrl = URL.createObjectURL(file)
		setPharmacy((prev) => ({ ...prev, personal: { ...prev.personal, avatar: localPreviewUrl } }))
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
				return <PharmacyPersonalTab data={pharmacy.personal} onChange={handlePersonalChange} />
			case 'professional':
				return <PharmacyProfessionalTab data={pharmacy.professional} onChange={handleProfessionalChange} />
			case 'inventory':
				return (
					<Box sx={{ ...customCardStyle, p: 4, color: 'text.secondary', textAlign: 'center' }}>
						Coming soon...
					</Box>
				)
			case 'settings':
				return <PharmacySettingTab />
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
							avatar={pharmacy.personal.avatar}
							name={pharmacy.personal.name}
							subTitle={pharmacy.pharmacyType}
							completionPercent={completionPercent}
							backLabel="Pharmacy Profile"
							navItems={PHARMACY_NAV_ITEMS}
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
