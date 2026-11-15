// src/features/Pharmacy/profile/PharmacyProfilePage.tsx
import { useState, useMemo, useEffect } from 'react'
import { Box, Container, Grid, CircularProgress, Typography } from '@mui/material'
import AppProfileSidebar from '../../../components/common/ProfileSidebar/AppProfileSidebar'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import MiscellaneousServicesOutlinedIcon from '@mui/icons-material/MiscellaneousServicesOutlined'
import PharmacyPersonalTab from '../components/PersonalTab'
import PharmacyProfessionalTab, { PharmacyProfileProfessional } from '../components/ProfessionalTab'
import PharmacyServiceTab, { PharmacyProfileServices } from '../components/ServiceTab'
import PharmacySettingTab from '../components/SettingsTab'
import { customCardStyle } from '../../../styles/commonStyles'
import { getMyPharmacyDetails, mapPharmacyDetailsApi } from '../pharmacyService'
import { useAvatarChange } from '../../../hooks/useAvatarChange'
import { useAuth, setAuth } from '../../../hooks/useAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PharmacyProfilePersonal {
	name: string
	contactNumber: string
	contactVerified: boolean
	email: string
	emailVerified: boolean
	alternateMobile: string
	whatsappNumber: string
	avatar: string
}

export type { PharmacyProfileProfessional, PharmacyProfileServices }

export interface PharmacyProfile {
	id: string
	pharmacyType: string
	personal: PharmacyProfilePersonal
	professional: PharmacyProfileProfessional
	services: PharmacyProfileServices
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const PHARMACY_NAV_ITEMS = [
	{ id: 'personal', label: 'Personal details', icon: <PersonOutlineIcon fontSize="small" /> },
	{ id: 'professional', label: 'Professional details', icon: <WorkOutlineIcon fontSize="small" /> },
	{ id: 'services', label: 'Service details', icon: <MiscellaneousServicesOutlinedIcon fontSize="small" /> },
	{ id: 'inventory', label: 'Inventory', icon: <MedicationOutlinedIcon fontSize="small" /> },
	{ id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
]

// ─── Completion calculator ─────────────────────────────────────────────────────

function calcCompletion(pharmacy: PharmacyProfile): number {
	const personalFields = Object.entries(pharmacy.personal)
		.filter(([key]) => !['contactVerified', 'emailVerified', 'avatar'].includes(key))
		.map(([, val]) => String(val ?? ''))
	const professionalFields = Object.values(pharmacy.professional).map((v) => String(v ?? ''))
	const serviceFields = [
		String(pharmacy.services.is_24_x_7),
		pharmacy.services.open_days.length > 0 ? 'filled' : '',
		pharmacy.services.payment_methods.length > 0 ? 'filled' : '',
	]
	const allFields = [...personalFields, ...professionalFields, ...serviceFields]
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
		alternateMobile: '',
		whatsappNumber: '',
		avatar: '',
	},
	professional: {
		pharmacyName: '',
		logo: '',
		drugLicenseNumber: '',
		drugLicenseProof: '',
		gstNumber: '',
		gstCertificateProof: '',
		address: '',
		city: '',
		state: '',
		pincode: '',
		landmark: '',
		latitude: '',
		longitude: '',
	},
	services: {
		is_24_x_7: false,
		open_days: [],
		operating_hours: {},
		home_delivery_available: false,
		delivery_radius_km: '',
		estimated_delivery_time_mins: '',
		min_order_amount: '',
		emergency_medicine_available: false,
		payment_methods: [],
	},
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function PharmacyProfilePage() {
	const [activeTab, setActiveTab] = useState<string>('personal')
	const [pharmacy, setPharmacy] = useState<PharmacyProfile>(EMPTY_PHARMACY)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoading(true)
				const res = await getMyPharmacyDetails()
				if (res.success && res.data) {
					setPharmacy(mapPharmacyDetailsApi(res.data))
				}
			} catch (err: unknown) {
				// 404 = pharmacy record not created yet — show empty form so they can fill it in
				const status = (err as { response?: { status?: number } })?.response?.status
				if (status !== 404) {
					setError(`Failed to load pharmacy profile. (${status ?? 'unknown'})`)
				}
			} finally {
				setLoading(false)
			}
		}
		fetchProfile()
	}, [])

	const completionPercent = useMemo(() => calcCompletion(pharmacy), [pharmacy])

	const handlePersonalChange = (updated: Partial<PharmacyProfilePersonal>) =>
		setPharmacy((prev) => ({ ...prev, personal: { ...prev.personal, ...updated } }))

	const handleProfessionalChange = (updated: Partial<PharmacyProfileProfessional>) =>
		setPharmacy((prev) => ({ ...prev, professional: { ...prev.professional, ...updated } }))

	const handleServicesChange = (updated: Partial<PharmacyProfileServices>) =>
		setPharmacy((prev) => ({ ...prev, services: { ...prev.services, ...updated } }))

	const { role, user, accessToken, refreshToken, lookupData } = useAuth()
	// only patients may delete their photo (the server refuses it for every other role)
	const { change: handleAvatarChange, busy: avatarBusy } = useAvatarChange({
		current: pharmacy.personal.avatar,
		onChanged: (avatar) => setPharmacy((prev) => ({ ...prev, personal: { ...prev.personal, avatar } })),
		onSaved: (avatar) => setAuth(role!, { ...user!, avatar }, accessToken!, refreshToken!, lookupData),
	})

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
			case 'services':
				return <PharmacyServiceTab data={pharmacy.services} onChange={handleServicesChange} />
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
							avatarBusy={avatarBusy}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 9 }}>{renderTab()}</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
