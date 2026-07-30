// src/routes/AppRoutes.tsx
import { lazy, Suspense } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import NotFoundPage from '../components/common/NotFoundPage'
import MainLayout from '../components/layout/MainLayout'
import SidebarLayout from '../components/layout/SidebarLayout'
import NavbarLayout from '../components/layout/NavbarLayout'
import { ROUTES } from '../constants/routes'

import { useAuth } from '../hooks/useAuth'
import AppLoader from '../components/common/Loader/AppLoader'

// Lazy-loaded route components
const LoginPage = lazy(() => import('../features/auth/LoginPage'))
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'))
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'))
const DoctorDetailPage = lazy(() => import('../features/doctor/detail/DoctorDetailPage'))
const DoctorSearchPage = lazy(() => import('../features/doctor/search/DoctorSearchPage'))
const PaymentPage = lazy(() => import('../features/appointments/PaymentPage'))
const BookRidePage = lazy(() => import('../features/transportation/BookRidePage'))
const TransportationLandingPage = lazy(() => import('../features/transportation/TransportationLandingPage'))
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'))
const ConsultationPage = lazy(() => import('../features/consultation/ConsultationPage'))
const DoctorAccountDetailsPage = lazy(() => import('../features/auth/DoctorAccountDetailsPage'))
const TestPage = lazy(() => import('../features/auth/test/TestPage'))
const TestRegister = lazy(() => import('../features/auth/test/TestRegister'))
const PortalPage = lazy(() => import('../features/portal/PortalPage'))
const DoctorAppointmentList = lazy(() => import('../features/appointments/AppointmentList'))
const PatientAppointmentDetailPage = lazy(() => import('../features/patient/PatientAppointmentDetailPage'))
const WelcomePage = lazy(() => import('../features/auth/WelcomePage'))
const OrderList = lazy(() => import('../features/Pharmacy/orders/OrderList'))
const OrderDetailPage = lazy(() => import('../features/Pharmacy/orders/OrderDeatailPage'))
const PharmacySearchPage = lazy(() => import('../features/Pharmacy/components/PharmacySearchPage'))
const RadiologyProfilePage = lazy(() => import('../features/radiology/profile/RadiologyProfilePage'))
const BookingsList = lazy(() => import('../features/radiology/bookings/BookingsList'))
const BookingDetailPage = lazy(() => import('../features/radiology/bookings/BookingDetailPage'))
const AllSpecialitiesPage = lazy(() => import('../features/dashboard/AllSpecialitiesPage'))
const RadiologySearchPage = lazy(() => import('../features/radiology/search/RadiologySearchPage'))
const LaboratorySearchPage = lazy(() => import('../features/laboratory/search/LaboratorySearchPage'))
const FavouriteDoctorsPage = lazy(() => import('../features/doctor/favourites/FavouriteDoctorsPage'))

const LaboratoryOrdersList = lazy(() => import('../features/laboratory/bookings/LaboratoryOrdersList'))
const LaboratoryBookingDetailPage = lazy(() => import('../features/laboratory/bookings/LaboratoryBookingDetailPage'))

// Admin Portal Components
const AdminLoginPage = lazy(() => import('../features/admin/auth/AdminLoginPage'))
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'))
const AdminProtectedRoute = lazy(() => import('./AdminProtectedRoute'))
const AdminDashboardPage = lazy(() => import('../features/admin/pages/AdminDashboardPage'))
const AdminVerificationsPage = lazy(() => import('../features/admin/pages/AdminVerificationsPage'))
const AdminUsersPage = lazy(() => import('../features/admin/pages/AdminUsersPage'))
const AdminUserDetailPage = lazy(() => import('../features/admin/pages/AdminUserDetailPage'))
const AdminAppointmentsPage = lazy(() => import('../features/admin/pages/AdminAppointmentsPage'))
const AdminAuditsPage = lazy(() => import('../features/admin/pages/AdminAuditsPage'))
const AdminSpecialitiesPage = lazy(() => import('../features/admin/pages/AdminSpecialitiesPage'))

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
		<Suspense fallback={<AppLoader />}>
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
		</Suspense>
	)
}
