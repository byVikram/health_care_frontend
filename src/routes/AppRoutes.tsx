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
import DoctorAppointmentList from '../features/appointments/AppointmentList'
import PatientAppointmentDetailPage from '../features/patient/PatientAppointmentDetailPage'
import WelcomePage from '../features/auth/WelcomePage'
import OrderList from '../features/pharmacy/orders/OrderList'
import OrderDetailPage from '../features/pharmacy/orders/OrderDeatailPage'
import PharmacySearchPage from '../features/pharmacy/components/PharmacySearchPage'
import RadiologyProfilePage from '../features/radiology/profile/RadiologyProfilePage'
import BookingsList from '../features/radiology/bookings/BookingsList'
import BookingDetailPage from '../features/radiology/bookings/BookingDetailPage'
import AllSpecialitiesPage from '../features/dashboard/AllSpecialitiesPage'
import RadiologySearchPage from '../features/radiology/search/RadiologySearchPage'
import LaboratorySearchPage from '../features/laboratory/search/LaboratorySearchPage'
import { useAuth } from '../hooks/useAuth'

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
	const { accessToken } = useAuth()
	const isAuthenticated = !!accessToken

	return (
		<Routes>
			{/* Public routes */}
			<Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />

			<Route path={ROUTES.AUTH.REGISTER} element={<RegisterPage />} />

			<Route
				path={ROUTES.TEST_REGISTER}
				element={<TestRegister onSubmit={(email) => console.log('Registered:', email)} />}
			/>
			<Route path={ROUTES.DOCTOR_ACCOUNT_DETAILS} element={<DoctorAccountDetailsPage />} />


			<Route path={ROUTES.PUBLIC.WELCOME} element={<WelcomePage />} />


			<Route path={ROUTES.PUBLIC.WELCOME_DOCTOR} element={<WelcomePage role="doctor" />} />
			<Route element={<ProtectedLayout />}>
				<Route path={ROUTES.ROOT} element={<DashboardPage />} />
			</Route>

			{/* Protected routes */}
			<Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
				<Route element={<ProtectedLayout />}>
					
					<Route path={ROUTES.DOCTORS.DETAIL} element={<DoctorDetailPage />} />
					<Route path={ROUTES.DOCTORS.SEARCH} element={<DoctorSearchPage />} />
					<Route path={ROUTES.PAYMENT} element={<PaymentPage />} />
					<Route path={ROUTES.TEST} element={<TestPage />} />
					<Route path={ROUTES.PHARMACY.SEARCH} element={<PharmacySearchPage />} />
					<Route path={ROUTES.SPECIALITIES} element={<AllSpecialitiesPage />} />
					<Route path={ROUTES.RADIOLOGY.SEARCH} element={<RadiologySearchPage />} />
					<Route path={ROUTES.LABORATORY.SEARCH} element={<LaboratorySearchPage />} />
					
				</Route>

				<Route element={<SidebarProtectedLayout />} />

				<Route element={<LoggedInNavbarLayout />}>
					<Route path={ROUTES.PORTAL.HOME} element={<PortalPage />} />
					<Route path={ROUTES.APPOINTMENTS} element={<DoctorAppointmentList />} />
					<Route path={ROUTES.PORTAL.APPOINTMENT_DETAIL} element={<PatientAppointmentDetailPage />} />
					<Route path={ROUTES.PORTAL.PROFILE} element={<ProfilePage />} />
					<Route path={ROUTES.PORTAL.CONSULTATION} element={<ConsultationPage />} />
					<Route path={ROUTES.PHARMACY.ORDER_DETAIL} element={<OrderDetailPage />} />
					<Route path={ROUTES.PHARMACY.ORDERS} element={<OrderList />} />
					<Route path={ROUTES.PHARMACY.ORDER_DETAIL} element={<OrderDetailPage />} />
					{/* <Route path={ROUTES.PHARMACY.PROFILE} element={<PharmacyProfilePage />} /> */}
					<Route path={ROUTES.PHARMACY.SEARCH} element={<PharmacySearchPage />} />

					<Route path={ROUTES.PHARMACY.ORDERS} element={<OrderList />} />
					<Route path={ROUTES.RADIOLOGY.PROFILE} element={<RadiologyProfilePage />} />
					<Route path={ROUTES.RADIOLOGY.BOOKINGS} element={<BookingsList />} />
					<Route path={ROUTES.RADIOLOGY.BOOKING_DETAIL} element={<BookingDetailPage />} />
				</Route>
			</Route>

			{/* <Route path={ROUTES.LABORATORY.PROFILE} element={<LaboratoryProfilePage />} /> */}


			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}
