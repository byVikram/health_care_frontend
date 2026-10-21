// src/components/layout/SidebarLayout.tsx
import { useState } from 'react'
import { ReactNode } from 'react'
import { Box } from '@mui/material'
import AppSidebar from '../common/Sidebar/AppSidebar'
import DoctorNavBar from '../common/Navbar/DoctorNavBar'
import { useAuth } from '../../hooks/useAuth'
import { useSyncedAvatar } from '../../hooks/useSyncedAvatar'
import { logout } from '../../features/auth/authService'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

// MUI Icons - Doctor
// import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
// import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
// import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
// MUI Icons - Patient
// import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined'
// import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined'

// MUI Icons - Common
// import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'

import AppointmentIcon from '../../assets/icons/appointments.svg'
import PharmacyIcon from '../../assets/icons/pharmacy.svg'
import RadiologyIcon from '../../assets/icons/radiology.svg'
import AncillaryIcon from '../../assets/icons/ancillary.svg'
import TreatmentIcon from '../../assets/icons/treatment.svg'
import OrdersIcon from '../../assets/icons/orders.svg'
import MyDocsIcon from '../../assets/icons/my-doctors.svg'
import InsuranceIcon from '../../assets/icons/insurance.svg'
import RemindersIcon from '../../assets/icons/reminders.svg'
import PaymentsIcon from '../../assets/icons/payments.svg'
import BlogsIcon from '../../assets/icons/blogs.svg'
import HelpCenterIcon from '../../assets/icons/help-center.svg'
import SettingsIcon from '../../assets/icons/settings.svg'
import CarePlanIcon from '../../assets/icons/care-plan.svg'
import CabIcon from '../../assets/icons/cab.svg'

const SIDEBAR_WIDTH = 280
const NAVBAR_HEIGHT = 64

// -- Doctor config -------------------------------------------------------------
const DOCTOR_MENU_ITEMS = [
	{
		id: 'appointments',
		label: 'My Appointments',
		icon: AppointmentIcon,
		path: `${ROUTES.APPOINTMENTS}?view=doctor`,
	},
	{ id: 'pharmacy', label: 'Pharmacy', icon: PharmacyIcon },
	{ id: 'radiology', label: 'Radiology', icon: RadiologyIcon },
	{ id: 'reminders', label: 'Reminders', icon: RemindersIcon },
	{ id: 'events', label: 'Events & Seminars', icon: AppointmentIcon, path: ROUTES.DOCTOR.EVENTS },
	// { id: 'patients', label: 'My Patients', icon: , path: '/doctor/patients' },
	// { id: 'hospitals', label: 'My Hospitals', icon: , path: '/profile' },
	// { id: 'availability', label: 'Availability', icon: <EventAvailableOutlinedIcon />, path: '/profile' },
	{ id: 'blogs', label: 'Blogs', icon: BlogsIcon },
	{ id: 'help', label: 'Help Center', icon: HelpCenterIcon },
	{ id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/profile' },
]

// -- Patient config ------------------------------------------------------------
const PATIENT_MENU_ITEMS = [
	{
		id: 'appointments',
		label: 'My Appointments',
		icon: AppointmentIcon,
		path: `${ROUTES.APPOINTMENTS}?view=patient`,
	},
	{ id: 'pharmacy', label: 'Pharmacy', icon: PharmacyIcon },
	{ id: 'radiology', label: 'Radiology', icon: RadiologyIcon },
	{ id: 'ancillary', label: 'Ancillary', icon: AncillaryIcon },
	{ id: 'history', label: 'Treatment History', icon: TreatmentIcon },
	{ id: 'orders', label: 'Orders', icon: OrdersIcon },
	{ id: 'doctors', label: 'My Doctors', icon: MyDocsIcon },
	{ id: 'insurance', label: 'My Insurance Policy', icon: InsuranceIcon },
	{ id: 'reminders', label: 'Reminders', icon: RemindersIcon },
	{ id: 'payments', label: 'Payments', icon: PaymentsIcon },
	{ id: 'cabs', label: 'Book a Cab', icon: CabIcon, path: '/portal/transportation' },
	{ id: 'blogs', label: 'Blogs', icon: BlogsIcon },
	{ id: 'help', label: 'Help Center', icon: HelpCenterIcon },
	{ id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/profile' },
]

// -- Props ---------------------------------------------------------------------
interface SidebarLayoutProps {
	children: ReactNode
	activeMenuId?: string
}

// -- Component -----------------------------------------------------------------
export default function SidebarLayout({ children, activeMenuId }: SidebarLayoutProps) {
	const { role, user } = useAuth()
	useSyncedAvatar() // keep the sidebar photo the same as the profile's
	const navigate = useNavigate()

	const isDoctor = role === 'doctor'

	const menuItems = isDoctor ? DOCTOR_MENU_ITEMS : PATIENT_MENU_ITEMS
	const defaultId = activeMenuId ?? menuItems[0]?.id ?? ''
	// const [activeId, setActiveId] = useState(defaultId)
	const [activeId] = useState(defaultId)

	const sidebarUser = {
		name: user?.name ?? (isDoctor ? 'Dr. Ashika Rao' : 'Nitin'),
		avatar: user?.avatar ?? '', // no stock photo for a missing one
		profileCompletion: user?.profileCompletion ?? (isDoctor ? 65 : 22),
		profilePath: user?.profilePath ?? (isDoctor ? '/profile' : '/profile'),
		showQr: user?.showQr ?? !isDoctor,
	}

	const carePlan = !isDoctor
		? {
				title: 'Whisper Ai Care Plans',
				subtitle: '12 FREE Appointments for a year',
				icon: CarePlanIcon,
			}
		: undefined

	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const handleLogout = async () => {
		if (isLoggingOut) return
		setIsLoggingOut(true)
		try {
			await logout()
			navigate('/login')
		} finally {
			setIsLoggingOut(false)
		}
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
			{/* Navbar  fixed full width */}
			<Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200 }}>
				<DoctorNavBar />
			</Box>

			{/* Body  below navbar */}
			<Box sx={{ display: 'flex', flex: 1, mt: `${NAVBAR_HEIGHT}px` }}>
				{/* Sidebar */}

				{/* <AppSidebar
					user={sidebarUser}
					carePlan={carePlan}
					menuItems={menuItems}
					activeId={activeId}
					onLogout={handleLogout}
					width={SIDEBAR_WIDTH}
					topOffset={NAVBAR_HEIGHT}
				/>
				<Box
					sx={{
						flex: 1,
						ml: `${SIDEBAR_WIDTH}px`,
						display: 'flex',
						flexDirection: 'column',
						minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
					}}
				>
					<Box sx={{ flex: 1 }}>{children}</Box>
				</Box> */}

				{/* Sidebar (only for patient) */}
				{/* {!isDoctor && ( */}
				<AppSidebar
					user={sidebarUser}
					carePlan={carePlan}
					menuItems={menuItems}
					activeId={activeId}
					onLogout={handleLogout}
					width={SIDEBAR_WIDTH}
					topOffset={NAVBAR_HEIGHT}
				/>

				{/* Page content */}
				<Box
					sx={{
						flex: 1,
						// ml: !isDoctor ? `${SIDEBAR_WIDTH}px` : 0,
						ml: `${SIDEBAR_WIDTH}px`,
						display: 'flex',
						flexDirection: 'column',
						minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
					}}
				>
					<Box sx={{ flex: 1 }}>{children}</Box>
				</Box>
			</Box>
		</Box>
	)
}
