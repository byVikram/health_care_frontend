// src/routes/AppRoutes.tsx
import { Routes, Route, Outlet } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import DoctorDetailPage from '../features/doctor/detail/DoctorDetailPage'
import DoctorSearchPage from '../features/doctor/search/DoctorSearchPage'
import PaymentPage from '../features/appointments/PaymentPage'
import ProfilePage from '../features/profile/ProfilePage'
import NotFoundPage from '../components/common/NotFoundPage'
import MainLayout from '../components/layout/MainLayout'
import SidebarLayout from '../components/layout/SidebarLayout'
import ConsultationPage from '../features/consultation/ConsultationPage'
import DoctorAccountDetailsPage from '../features/auth/DoctorAccountDetailsPage'
import NavbarLayout from '../components/layout/NavbarLayout'
import TestPage from '../features/auth/test/TestPage'
import { ROUTES } from '../constants/routes'
import TestRegister from '../features/auth/test/TestRegister'
import PortalPage from '../features/portal/PortalPage'

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

function LoggedInNavbarLayout() {
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

			{/*
			  Register route — owns the full sign-up journey internally:
			    /register  →  RoleSelectorPage (fetches roles from api/auth/get-roles)
			                → OnBoardingPage   (role-specific slides)
			                → RegisterForm     (submits with selected roleId UUID)
			*/}
			<Route path={ROUTES.AUTH.REGISTER} element={<RegisterPage />} />

			<Route path={ROUTES.TEST_REGISTER} element={<TestRegister onSubmit={(email) => console.log('Registered:', email)} />} />
			<Route path={ROUTES.DOCTOR_ACCOUNT_DETAILS} element={<DoctorAccountDetailsPage />} />

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

			<Route element={<LoggedInNavbarLayout />}>
				<Route path={ROUTES.PORTAL.HOME} element={<PortalPage />} />
				<Route path={ROUTES.PORTAL.PROFILE} element={<ProfilePage />} />
				<Route path={ROUTES.PORTAL.CONSULTATION} element={<ConsultationPage />} />
			</Route>

			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}
