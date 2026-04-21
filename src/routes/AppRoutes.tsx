// src/routes/AppRoutes.tsx
import {Routes, Route, Outlet, useNavigate } from 'react-router-dom'
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
import TestPage from '../features/auth/test/TestPage'
import { ROUTES } from '../constants/routes'
import TestRegister from '../features/auth/test/TestRegister'
import OnBoardingScreens from '../features/auth/onboarding/OnBoardingScreens'

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
	const navigate = useNavigate()

	return (
		<Routes>
			{/* Public routes */}
			<Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
			<Route path={ROUTES.AUTH.REGISTER} element={<RegisterPage />} />
			<Route path={ROUTES.TEST_REGISTER} element={<TestRegister onSubmit={(email) => console.log('Registered:', email)} />} />
			<Route path={ROUTES.PUBLIC.ACCOUNT} element={<AccountPage />} />
			<Route
				path={ROUTES.PUBLIC.WELCOME_DOCTOR}
				element={<WelcomePage onContinue={() => navigate(ROUTES.PORTAL.PROFILE)} />}
			/>

			{/* Onboarding */}
			<Route
				path={ROUTES.ONBOARDING}
				element={
					<OnBoardingScreens
						role="PATIENT"
						onFinish={() => navigate(ROUTES.AUTH.REGISTER)}
					/>
				}
			/>

			{/* Protected routes */}
			<Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
				<Route element={<ProtectedLayout />}>
					<Route path={ROUTES.ROOT} element={<DashboardPage />} />
					<Route path={ROUTES.DOCTORS.DETAIL} element={<DoctorDetailPage />} />
					<Route path={ROUTES.DOCTORS.SEARCH} element={<DoctorSearchPage />} />
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
