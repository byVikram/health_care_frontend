// src/components/layout/SidebarLayout.tsx
import { useState } from 'react'
import { ReactNode } from 'react'
import { Box } from '@mui/material'
import AppSidebar from '../common/Sidebar/AppSidebar'
import DoctorNavBar from '../common/Navbar/DoctorNavBar'
import { useAuth, clearAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

// MUI Icons - Doctor
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
// MUI Icons - Patient
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined'
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined'
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined'
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined'
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
// MUI Icons - Common
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import drImage from '../../assets/Services/doctors-service.png'

const SIDEBAR_WIDTH = 280
const NAVBAR_HEIGHT = 64

// -- Doctor config -------------------------------------------------------------
const DOCTOR_MENU_ITEMS = [
	{ id: 'appointments', label: 'My Appointments', icon: <CalendarMonthOutlinedIcon />, path: '/doctor' },
	{ id: 'patients', label: 'My Patients', icon: <PeopleAltOutlinedIcon />, path: '/doctor/patients' },
	{ id: 'hospitals', label: 'My Hospitals', icon: <LocalHospitalOutlinedIcon />, path: '/profile' },
	{ id: 'availability', label: 'Availability', icon: <EventAvailableOutlinedIcon />, path: '/profile' },
	{ id: 'help', label: 'Help Center', icon: <HelpOutlineIcon /> },
	{ id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon />, path: '/profile' },
]

// -- Patient config ------------------------------------------------------------
const PATIENT_MENU_ITEMS = [
	{
		id: 'appointments',
		label: 'My Appointments',
		icon: <CalendarMonthOutlinedIcon />,
		path: '/patient/appointments',
	},
	{ id: 'pharmacy', label: 'Pharmacy', icon: <LocalPharmacyOutlinedIcon /> },
	{ id: 'lab', label: 'Lab', icon: <BiotechOutlinedIcon /> },
	{ id: 'radiology', label: 'Radiology', icon: <MedicalInformationOutlinedIcon /> },
	{ id: 'ancillary', label: 'Ancillary', icon: <AccessibilityNewOutlinedIcon /> },
	{ id: 'history', label: 'Treatment History', icon: <HistoryOutlinedIcon /> },
	{ id: 'orders', label: 'Orders', icon: <ShoppingCartOutlinedIcon /> },
	{ id: 'doctors', label: 'My Doctors', icon: <FavoriteOutlinedIcon /> },
	{ id: 'insurance', label: 'My Insurance Policy', icon: <HealthAndSafetyOutlinedIcon /> },
	{ id: 'reminders', label: 'Reminders', icon: <NotificationsNoneOutlinedIcon /> },
	{ id: 'payments', label: 'Payments', icon: <PaymentsOutlinedIcon /> },
	{ id: 'blogs', label: 'Blogs', icon: <ArticleOutlinedIcon /> },
	{ id: 'help', label: 'Help Center', icon: <HelpOutlineIcon /> },
	{ id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon />, path: '/profile' },
]

// -- Props ---------------------------------------------------------------------
interface SidebarLayoutProps {
	children: ReactNode
	activeMenuId?: string
}

// -- Component -----------------------------------------------------------------
export default function SidebarLayout({ children, activeMenuId }: SidebarLayoutProps) {
	const { role, user } = useAuth()
	const navigate = useNavigate()

	const isDoctor = role === 'doctor'

	const menuItems = isDoctor ? DOCTOR_MENU_ITEMS : PATIENT_MENU_ITEMS
	const defaultId = activeMenuId ?? menuItems[0]?.id ?? ''
	const [activeId, setActiveId] = useState(defaultId)

	const sidebarUser = {
		name: user?.name ?? (isDoctor ? 'Dr. Ashika Rao' : 'Nitin'),
		avatar: user?.avatar ?? (isDoctor ? drImage : ''),
		profileCompletion: user?.profileCompletion ?? (isDoctor ? 65 : 22),
		profilePath: user?.profilePath ?? (isDoctor ? '/profile' : '/profile'),
		showQr: user?.showQr ?? !isDoctor,
	}

	const carePlan = !isDoctor
		? {
				title: 'Whisper Ai Care Plans',
				subtitle: '12 FREE Appointments for a year',
				icon: <EmojiEventsOutlinedIcon />,
			}
		: undefined

	const handleLogout = () => {
		clearAuth()
		navigate('/login')
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
				{!isDoctor && (
					<AppSidebar
						user={sidebarUser}
						carePlan={carePlan}
						menuItems={menuItems}
						activeId={activeId}
						onLogout={handleLogout}
						width={SIDEBAR_WIDTH}
						topOffset={NAVBAR_HEIGHT}
					/>
				)}

				{/* Page content */}
				<Box
					sx={{
						flex: 1,
						ml: !isDoctor ? `${SIDEBAR_WIDTH}px` : 0,
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
