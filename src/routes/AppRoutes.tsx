// src/routes/AppRoutes.tsx
import { Routes, Route, Outlet } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import NotFoundPage from '../components/common/NotFoundPage'
import MainLayout from '../components/layout/MainLayout'
import SidebarLayout from '../components/layout/SidebarLayout'
import NavbarLayout from '../components/layout/NavbarLayout'
import { ROUTES } from '../constants/routes'

import { useAuth } from '../hooks/useAuth'
import NotificationPermissionPopup from '../components/common/NotificationPermissionPopup'

// Static route components imports
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import DoctorDetailPage from '../features/doctor/detail/DoctorDetailPage'
import DoctorSearchPage from '../features/doctor/search/DoctorSearchPage'
import PaymentPage from '../features/appointments/PaymentPage'
import BookRidePage from '../features/transportation/BookRidePage'
import TransportationLandingPage from '../features/transportation/TransportationLandingPage'
import ProfilePage from '../features/profile/ProfilePage'
import ConsultationPage from '../features/consultation/ConsultationPage'
import DoctorAccountDetailsPage from '../features/auth/DoctorAccountDetailsPage'
import TestPage from '../features/auth/test/TestPage'
import TestRegister from '../features/auth/test/TestRegister'
import PortalPage from '../features/portal/PortalPage'
import DoctorAppointmentList from '../features/appointments/AppointmentList'
import PatientAppointmentDetailPage from '../features/patient/PatientAppointmentDetailPage'
import WelcomePage from '../features/auth/WelcomePage'
import OrderList from '../features/Pharmacy/orders/OrderList'
import OrderDetailPage from '../features/Pharmacy/orders/OrderDeatailPage'
import PharmacySearchPage from '../features/Pharmacy/components/PharmacySearchPage'
import RadiologyProfilePage from '../features/radiology/profile/RadiologyProfilePage'
import BookingsList from '../features/radiology/bookings/BookingsList'
import BookingDetailPage from '../features/radiology/bookings/BookingDetailPage'
import AllSpecialitiesPage from '../features/dashboard/AllSpecialitiesPage'
import RadiologySearchPage from '../features/radiology/search/RadiologySearchPage'
import LaboratorySearchPage from '../features/laboratory/search/LaboratorySearchPage'
import FavouriteDoctorsPage from '../features/doctor/favourites/FavouriteDoctorsPage'

import LaboratoryOrdersList from '../features/laboratory/bookings/LaboratoryOrdersList'
import LaboratoryBookingDetailPage from '../features/laboratory/bookings/LaboratoryBookingDetailPage'

// Admin Portal Components
import AdminLoginPage from '../features/admin/auth/AdminLoginPage'
import AdminLayout from '../components/layout/AdminLayout'
import AdminProtectedRoute from './AdminProtectedRoute'
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage'
import AdminVerificationsPage from '../features/admin/pages/AdminVerificationsPage'
import AdminUsersPage from '../features/admin/pages/AdminUsersPage'
import AdminUserDetailPage from '../features/admin/pages/AdminUserDetailPage'
import AdminAppointmentsPage from '../features/admin/pages/AdminAppointmentsPage'
import AdminAuditsPage from '../features/admin/pages/AdminAuditsPage'
import AdminSpecialitiesPage from '../features/admin/pages/AdminSpecialitiesPage'

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
		<>
			<NotificationPermissionPopup />
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

				{/* Admin Login Route */}
				<Route path={ROUTES.ADMIN.LOGIN} element={<AdminLoginPage />} />

				{/* Admin Protected Routes */}
				<Route element={<AdminProtectedRoute />}>
					<Route element={<AdminLayout />}>
						<Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
						<Route path={ROUTES.ADMIN.VERIFICATIONS} element={<AdminVerificationsPage />} />
						<Route path={ROUTES.ADMIN.USERS} element={<AdminUsersPage />} />
						<Route path={ROUTES.ADMIN.USER_DETAIL} element={<AdminUserDetailPage />} />
						<Route path={ROUTES.ADMIN.APPOINTMENTS} element={<AdminAppointmentsPage />} />
						<Route path={ROUTES.ADMIN.AUDITS} element={<AdminAuditsPage />} />
						<Route path={ROUTES.ADMIN.SPECIALITIES} element={<AdminSpecialitiesPage />} />
					</Route>
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
						<Route path={ROUTES.PORTAL.BOOK_RIDE} element={<BookRidePage />} />
						<Route path={ROUTES.PORTAL.TRANSPORTATION} element={<TransportationLandingPage />} />
						<Route path={ROUTES.PORTAL.PROFILE} element={<ProfilePage />} />
						<Route path={ROUTES.PORTAL.CONSULTATION} element={<ConsultationPage />} />
						<Route path={ROUTES.PHARMACY.ORDER_DETAIL} element={<OrderDetailPage />} />
						<Route path={ROUTES.PHARMACY.ORDERS} element={<OrderList />} />
						{/* <Route path={ROUTES.PHARMACY.PROFILE} element={<PharmacyProfilePage />} /> */}
						<Route path={ROUTES.PHARMACY.SEARCH} element={<PharmacySearchPage />} />

						<Route path={ROUTES.RADIOLOGY.PROFILE} element={<RadiologyProfilePage />} />
						<Route path={ROUTES.RADIOLOGY.BOOKINGS} element={<BookingsList />} />
						<Route path={ROUTES.RADIOLOGY.BOOKING_DETAIL} element={<BookingDetailPage />} />
						<Route path={ROUTES.PORTAL.FAVOURITES} element={<FavouriteDoctorsPage />} />
						<Route path={ROUTES.LABORATORY.ORDERS} element={<LaboratoryOrdersList />} />
						<Route path={ROUTES.LABORATORY.ORDER_DETAIL} element={<LaboratoryBookingDetailPage />} />
					</Route>
				</Route>

				{/* <Route path={ROUTES.LABORATORY.PROFILE} element={<LaboratoryProfilePage />} /> */}


				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</>
	)
}
