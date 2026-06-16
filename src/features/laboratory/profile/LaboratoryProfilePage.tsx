// src/features/laboratory/profile/LaboratoryProfilePage.tsx
import { useState, useMemo } from 'react'
import { Box, Container, Grid } from '@mui/material'
import AppProfileSidebar from '../../../components/common/ProfileSidebar/AppProfileSidebar'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined'
import SessionsTab from '../../../components/common/SessionsTab/SessionsTab'
import LabPersonalTab from './components/LabPersonalTab'
import LabProfessionalTab from './components/LabProfessionalTab'
import LabSettingsTab from './components/LabSettingsTab'
import { LaboratoryProfile, LaboratoryProfilePersonal, LaboratoryProfileProfessional } from '../../../types/laboratory-profile'
import { customCardStyle } from '../../../styles/commonStyles'

// ─── Nav items ────────────────────────────────────────────────────────────────

const LAB_NAV_ITEMS = [
	{ id: 'personal', label: 'Personal details', icon: <PersonOutlineIcon fontSize="small" /> },
	{ id: 'professional', label: 'Professional details', icon: <WorkOutlineIcon fontSize="small" /> },
	{ id: 'services', label: 'Services', icon: <ScienceOutlinedIcon fontSize="small" /> },
	{ id: 'sessions', label: 'Active Sessions', icon: <DesktopWindowsOutlinedIcon fontSize="small" /> },
	{ id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
]

// ─── Default / empty state ────────────────────────────────────────────────────

const EMPTY_LAB: LaboratoryProfile = {
	id: '',
	labType: '',
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
		institute: '',
		yearOfPassing: '',
		qualificationProof: '',
		registrationNumber: '',
		certificationAuthority: '',
		licenseExpiryDate: '',
		registrationProof: '',
		currentLab: '',
		yearsOfExperience: '',
		previousOrganization: '',
		areaOfExpertise: '',
		skills: [],
		labLicenseProof: '',
		trainingCertificateProof: '',
		internshipProof: '',
		idVerificationProof: '',
		about: '',
	},
	services: [],
}

// ─── Completion calculator ────────────────────────────────────────────────────

function calcCompletion(lab: LaboratoryProfile): number {
	const personalFields = Object.entries(lab.personal)
		.filter(([key]) => !['contactVerified', 'emailVerified', 'avatar', 'instagram', 'facebook'].includes(key))
		.map(([, val]) => val as string)
	const professionalFields = Object.entries(lab.professional)
		.filter(([key]) => !['skills', 'specializationLabel'].includes(key))
		.map(([, val]) => val as string)
	const skillsFilled = lab.professional.skills.length > 0 ? 1 : 0
	const allFields = [...personalFields, ...professionalFields]
	const filled = allFields.filter((v) => v && String(v).trim()).length + skillsFilled
	return Math.round((filled / (allFields.length + 1)) * 100)
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function LaboratoryProfilePage() {
	const [activeTab, setActiveTab] = useState<string>('personal')
	const [lab, setLab] = useState<LaboratoryProfile>(EMPTY_LAB)

	const completionPercent = useMemo(() => calcCompletion(lab), [lab])

	const handlePersonalChange = (updated: Partial<LaboratoryProfilePersonal>) =>
		setLab((prev) => ({ ...prev, personal: { ...prev.personal, ...updated } }))

	const handleProfessionalChange = (updated: Partial<LaboratoryProfileProfessional>) =>
		setLab((prev) => ({ ...prev, professional: { ...prev.professional, ...updated } }))

	const handleAvatarChange = (file: File) => {
		const localPreviewUrl = URL.createObjectURL(file)
		setLab((prev) => ({ ...prev, personal: { ...prev.personal, avatar: localPreviewUrl } }))
	}

	const renderTab = () => {
		switch (activeTab) {
			case 'personal':
				return <LabPersonalTab data={lab.personal} onChange={handlePersonalChange} />
			case 'professional':
				return <LabProfessionalTab data={lab.professional} onChange={handleProfessionalChange} />
			case 'services':
				return (
					<Box sx={{ ...customCardStyle, p: 4, color: 'text.secondary', textAlign: 'center' }}>
						Coming soon...
					</Box>
				)
			case 'sessions':
				return <SessionsTab />
			case 'settings':
				return <LabSettingsTab />
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
