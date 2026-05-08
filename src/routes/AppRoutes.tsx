// src/routes/AppRoutes.tsx
import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../features/auth/LoginPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import DoctorDetailPage from '../features/doctor/detail/DoctorDetailPage'
import DoctorSearchPage from '../features/doctor/search/DoctorSearchPage'
import PaymentPage from '../features/appointments/PaymentPage'
import ProfilePage from '../features/profile/ProfilePage'
import NotFoundPage from '../components/common/NotFoundPage'
import MainLayout from '../components/layout/MainLayout'
import SidebarLayout from '../components/layout/SidebarLayout'
import ConsultationPage from '../features/consultation/ConsultationPage'
import WelcomePage from '../features/auth/WelcomePage'
import PortalPage from '../features/portal/PortalPage'
import NavbarLayout from '../components/layout/NavbarLayout'
import TestPage from '../features/auth/test/TestPage'
import { ROUTES } from '../constants/routes'
import TestRegister from '../features/auth/test/TestRegister'
import OnBoardingPage from '../features/auth/onboarding/OnBoardingPage'
import RoleSelectorPage from '../features/auth/onboarding/RoleSelectorPage'
import RegisterPage from '../features/auth/RegisterPage'
import DoctorAccountDetailsPage from '../features/auth/DoctorAccountDetailsPage'

function ProtectedLayout() {
	return (
		<MainLayout>
			<Outlet />
		</MainLayout>
	)
}

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

	return (
		<Routes>
			{/* Public routes */}
			<Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
			<Route path={ROUTES.TEST_REGISTER} element={<TestRegister onSubmit={(email) => console.log('Registered:', email)} />} />

			{/* Doctor welcome & account-details flow */}
			<Route path={ROUTES.PUBLIC.WELCOME_DOCTOR} element={<WelcomePage />} />
			<Route path={ROUTES.DOCTOR_ACCOUNT_DETAILS} element={<DoctorAccountDetailsPage />} />

			{/* /register always redirects to role select so users go through onboarding first */}
			<Route path={ROUTES.AUTH.REGISTER} element={<Navigate to={ROUTES.ROLE_SELECT} replace />} />

			{/* Onboarding flow: role select → slides → register */}
			<Route path={ROUTES.ROLE_SELECT} element={<RoleSelectorPage />} />
			<Route path={ROUTES.ONBOARDING_ROLE} element={<OnBoardingPage />} />
			<Route path={ROUTES.ONBOARDING_REGISTER} element={<RegisterPage />} />

			{/* Protected routes */}
			<Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
				<Route element={<ProtectedLayout />}>
					<Route path={ROUTES.ROOT} element={<DashboardPage />} />
					<Route path={ROUTES.DOCTORS.DETAIL} element={<DoctorDetailPage />} />
					<Route path={ROUTES.DOCTORS.SEARCH} element={<DoctorSearchPage />} />
					<Route path={ROUTES.PAYMENT} element={<PaymentPage />} />
					<Route path={ROUTES.TEST} element={<TestPage />} />
				</Route>
			</Route>

			<Route element={<SidebarProtectedLayout />} />

			<Route element={<LoogedInNavbarLayout />}>
				<Route path={ROUTES.PORTAL.HOME} element={<PortalPage />} />
				<Route path={ROUTES.PORTAL.PROFILE} element={<ProfilePage />} />
				<Route path={ROUTES.PORTAL.CONSULTATION} element={<ConsultationPage />} />
			</Route>

			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}
