// src/routes/AppRoutes.tsx
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import DoctorDetailPage from '../features/doctor/detail/DoctorDetailPage'
import DoctorSearchPage from '../features/doctor/search/DoctorSearchPage'
import ProfilePage from '../features/profile/ProfilePage'

import NotFoundPage from '../components/common/NotFoundPage'
import MainLayout from '../components/layout/MainLayout'
import SidebarLayout from '../components/layout/SidebarLayout'
import ConsultationPage from '../features/consultation/ConsultationPage'
import AccountPage from '../features/auth/AccountPage'
import WelcomePage from '../features/auth/WelcomePage'
import PortalPage from '../features/portal/PortalPage'
import NavbarLayout from '../components/layout/NavbarLayout'
// import TestPage from '../features/auth/test/TestPage'
// import DoctorPortalPage from '../features/doctor/DoctorPortalPage'
// import PatientPortalPage from '../features/patient/PatientPortalPage'
// import PatientProfilePage from '../features/patient/PatientProfilePage'

// Wraps all protected pages inside MainLayout
function ProtectedLayout() {
	return (
		<MainLayout>
			<Outlet />
		</MainLayout>
	)
}

// Wraps doctor + patient pages with sidebar
function SidebarProtectedLayout() {
	return (
		<SidebarLayout>
			<Outlet />
		</SidebarLayout>
	)
}

function LoogedInNavbarLayout() {
	return (
		<NavbarLayout>
			<Outlet />
		</NavbarLayout>
	)
}
export default function AppRoutes() {
	const isAuthenticated = true

	const navigate = useNavigate()

	return (
		<Routes>
			{/* Redirect root to dashboard */}
			{/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

			{/* Public routes */}
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />

			<Route path="/account" element={<AccountPage />} />
			<Route
				path="/welcome-doctor"
				element={
					<WelcomePage
						onContinue={() => {
							navigate('/profile')
						}}
					/>
				}
			/>

			{/* Protected routes - auth check then layout */}
			<Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
				<Route element={<ProtectedLayout />}>
					<Route path="/" element={<DashboardPage />} />
					{/* <Route path="/dashboard" element={<DashboardPage />} /> */}
					<Route path="/doctors/:id" element={<DoctorDetailPage />} />
					<Route path="/doctors/search" element={<DoctorSearchPage />} />

					{/* Add more protected pages here */}
				</Route>
			</Route>
			


			<Route element={<SidebarProtectedLayout />}>
				{/* <Route path="/portal-patient" element={<PatientProfilePage />} />
				<Route path="/patient" element={<PatientPortalPage />} /> */}
			</Route>

			<Route element={<LoogedInNavbarLayout />}>
				<Route path="/portal" element={<PortalPage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/consultation/:patientId" element={<ConsultationPage />} />
			</Route>

			{/* 404 */}
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}
