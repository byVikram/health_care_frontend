// src/routes/AppRoutes.tsx
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import NotFoundPage from '../components/common/NotFoundPage'
import MainLayout from '../components/layout/MainLayout'
import SidebarLayout from '../components/layout/SidebarLayout'
import NavbarLayout from '../components/layout/NavbarLayout'
import { ROUTES } from '../constants/routes'
import { ADMIN_ROLES, USER_ROLES } from '../constants/constants'

import { useAuth } from '../hooks/useAuth'
import NotificationPermissionPopup from '../components/common/NotificationPermissionPopup'

// Static route components imports
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import WelcomePage from '../features/auth/WelcomePage'
import DashboardPage from '../features/dashboard/DashboardPage'
import DoctorDetailPage from '../features/doctor/detail/DoctorDetailPage'
import DoctorSearchPage from '../features/doctor/search/DoctorSearchPage'
import PaymentPage from '../features/appointments/PaymentPage'
import AppointmentConfirmedPage from '../features/appointments/AppointmentConfirmedPage'
import ProfilePage from '../features/profile/ProfilePage'
import ConsultationPage from '../features/consultation/ConsultationPage'
import DoctorAccountDetailsPage from '../features/auth/DoctorAccountDetailsPage'
import PortalPage from '../features/portal/PortalPage'
import MyBookingsPage from '../features/bookings/MyBookingsPage'
import SchedulePage from '../features/schedule/SchedulePage'
import LabBrowsePage from '../features/lab/LabBrowsePage'
import LabCartPage from '../features/lab/LabCartPage'
import LabReviewPage from '../features/lab/LabReviewPage'
import LabBookedPage from '../features/lab/LabBookedPage'
import LabOrderPage from '../features/lab/LabOrderPage'
import LabReportPage from '../features/lab/LabReportPage'
import PatientAppointmentDetailPage from '../features/patient/PatientAppointmentDetailPage'
import RadiologyProfilePage from '../features/radiology/profile/RadiologyProfilePage'
import BookingsList from '../features/radiology/bookings/BookingsList'
import BookingDetailPage from '../features/radiology/bookings/BookingDetailPage'
import AllSpecialitiesPage from '../features/dashboard/AllSpecialitiesPage'
import AllSymptomsPage from '../features/dashboard/AllSymptomsPage'
import RadiologySearchPage from '../features/radiology/search/RadiologySearchPage'
import FavouriteDoctorsPage from '../features/doctor/favourites/FavouriteDoctorsPage'


// Admin Portal Components
import AdminLoginPage from '../features/admin/auth/AdminLoginPage'
import AdminLayout from '../components/layout/AdminLayout'
import AdminProtectedRoute from './AdminProtectedRoute'
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage'
import AdminVerificationsPage from '../features/admin/pages/AdminVerificationsPage'
import AdminVerificationReviewPage from '../features/admin/pages/AdminVerificationReviewPage'
import AdminUsersPage from '../features/admin/pages/AdminUsersPage'
import AdminUserDetailPage from '../features/admin/pages/AdminUserDetailPage'
import AdminAppointmentsPage from '../features/admin/pages/AdminAppointmentsPage'
import AdminAuditsPage from '../features/admin/pages/AdminAuditsPage'
import AdminSpecialitiesPage from '../features/admin/pages/AdminSpecialitiesPage'
import AdminAncillaryCategoriesPage from '../features/admin/pages/AdminAncillaryCategoriesPage'
import AdminBlogsPage from '../features/admin/pages/AdminBlogsPage'
import AdminBlogCreatePage from '../features/admin/pages/AdminBlogCreatePage'
import AdminBlogEditPage from '../features/admin/pages/AdminBlogEditPage'
import AdminArticlesPage from '../features/admin/pages/AdminArticlesPage'
import AdminArticleCreatePage from '../features/admin/pages/AdminArticleCreatePage'
import AdminArticleEditPage from '../features/admin/pages/AdminArticleEditPage'
import AdminCommentsPage from '../features/admin/pages/AdminCommentsPage'
import AdminReviewsPage from '../features/admin/pages/AdminReviewsPage'
import AdminAdsPage from '../features/admin/pages/AdminAdsPage'
import AdminCommunitiesPage from '../features/admin/pages/AdminCommunitiesPage'
import AdminEventsPage from '../features/admin/pages/AdminEventsPage'
import AdminQAPage from '../features/admin/pages/AdminQAPage'
import AdminAdminsPage from '../features/admin/pages/AdminAdminsPage'
import AdminAncillaryPage from '../features/admin/pages/AdminAncillaryPage'
import AdminAncillaryDetailPage from '../features/admin/pages/AdminAncillaryDetailPage'

import BlogListPage from '../features/portal/BlogListPage'
import BlogArticlePage from '../features/portal/BlogArticlePage'
import CommunityForumPage from '../features/portal/CommunityForumPage'
import CommunityThreadPage from '../features/portal/CommunityThreadPage'
import EventDetailsPage from '../features/portal/EventDetailsPage'
import EventsListPage from '../features/portal/EventsListPage'
import HealthQuestionsPage from '../features/portal/HealthQuestionsPage'

// Doctor Events
import DoctorEventListPage from '../features/doctor/events/DoctorEventListPage'
import DoctorEventFormPage from '../features/doctor/events/DoctorEventFormPage'

// '/' is the public / patient landing page. A signed-in doctor (or radiology user) has their own
// dashboard in the portal, so reaching '/' (a stale history entry, a typed address) sends them there instead.
function HomeRoute() {
	const { accessToken, role } = useAuth()
	const hasOwnDashboard = !!accessToken && !!role && role !== USER_ROLES.PATIENT && !ADMIN_ROLES.includes(role)

	if (hasOwnDashboard) {
		return <Navigate to={ROUTES.PORTAL.HOME} replace />
	}
	return <DashboardPage />
}

function PublicOrAuthenticatedLayout() {
	const { accessToken } = useAuth()

	if (accessToken) {
		return (
			<NavbarLayout>
				<Outlet />
			</NavbarLayout>
		)
	}

	return (
		<MainLayout>
			<Outlet />
		</MainLayout>
	)
}

/** The old appointments address (bookmarks, old emails and notifications): on to the page that replaced it, keeping the query (?appointment_id=). */
function AppointmentsRedirect() {
	const { role } = useAuth()
	const { search } = useLocation()
	return <Navigate to={`${role === USER_ROLES.DOCTOR ? ROUTES.SCHEDULE : ROUTES.BOOKINGS}${search}`} replace />
}

function AuthenticatedNavbarLayout() {
	return (
		<NavbarLayout>
			<Outlet />
		</NavbarLayout>
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
				<Route path={ROUTES.DOCTOR_ACCOUNT_DETAILS} element={<DoctorAccountDetailsPage />} />
				<Route path={ROUTES.PUBLIC.WELCOME} element={<WelcomePage />} />
				<Route path={ROUTES.PUBLIC.WELCOME_DOCTOR} element={<WelcomePage role="doctor" />} />


				<Route element={<PublicOrAuthenticatedLayout />}>
					<Route path={ROUTES.ROOT} element={<HomeRoute />} />
					<Route path={ROUTES.PUBLIC.HEALTH_QUESTIONS} element={<HealthQuestionsPage />} />
				</Route>

				{/* Admin Login Route */}
				<Route path={ROUTES.ADMIN.LOGIN} element={<AdminLoginPage />} />

				{/* Admin Protected Routes */}
				<Route element={<AdminProtectedRoute />}>
					<Route element={<AdminLayout />}>
						<Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
						<Route path={ROUTES.ADMIN.VERIFICATIONS} element={<AdminVerificationsPage />} />
						<Route path={ROUTES.ADMIN.VERIFICATION_REVIEW} element={<AdminVerificationReviewPage />} />
						<Route path={ROUTES.ADMIN.USERS} element={<AdminUsersPage />} />
						<Route path={ROUTES.ADMIN.USER_DETAIL} element={<AdminUserDetailPage />} />
						<Route path={ROUTES.ADMIN.APPOINTMENTS} element={<AdminAppointmentsPage />} />
						<Route path={ROUTES.ADMIN.AUDITS} element={<AdminAuditsPage />} />
						<Route path={ROUTES.ADMIN.SPECIALITIES} element={<AdminSpecialitiesPage />} />
						<Route path={ROUTES.ADMIN.ANCILLARY_CATEGORIES} element={<AdminAncillaryCategoriesPage />} />
						<Route path={ROUTES.ADMIN.BLOGS} element={<AdminBlogsPage />} />
						<Route path={ROUTES.ADMIN.BLOG_CREATE} element={<AdminBlogCreatePage />} />
						<Route path={ROUTES.ADMIN.BLOG_EDIT} element={<AdminBlogEditPage />} />
						<Route path={ROUTES.ADMIN.ARTICLES} element={<AdminArticlesPage />} />
						<Route path={ROUTES.ADMIN.ARTICLE_CREATE} element={<AdminArticleCreatePage />} />
						<Route path={ROUTES.ADMIN.ARTICLE_EDIT} element={<AdminArticleEditPage />} />
						<Route path={ROUTES.ADMIN.COMMENTS} element={<AdminCommentsPage />} />
						<Route path={ROUTES.ADMIN.REVIEWS} element={<AdminReviewsPage />} />
						<Route path={ROUTES.ADMIN.ADS} element={<AdminAdsPage />} />
						<Route path={ROUTES.ADMIN.COMMUNITIES} element={<AdminCommunitiesPage />} />
						<Route path={ROUTES.ADMIN.EVENTS} element={<AdminEventsPage />} />
						<Route path={ROUTES.ADMIN.QA} element={<AdminQAPage />} />
						<Route path={ROUTES.ADMIN.ADMINS} element={<AdminAdminsPage />} />
						<Route path={ROUTES.ADMIN.ANCILLARY} element={<AdminAncillaryPage />} />
						<Route path={ROUTES.ADMIN.ANCILLARY_DETAIL} element={<AdminAncillaryDetailPage />} />
					</Route>
				</Route>

				{/* Protected routes */}
				<Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
					<Route element={<AuthenticatedNavbarLayout />}>
						
						<Route path={ROUTES.DOCTORS.DETAIL} element={<DoctorDetailPage />} />
						<Route path={ROUTES.DOCTORS.SEARCH} element={<DoctorSearchPage />} />
						<Route path={ROUTES.PAYMENT} element={<PaymentPage />} />
						<Route path={ROUTES.APPOINTMENT_CONFIRMED} element={<AppointmentConfirmedPage />} />
						<Route path={ROUTES.SPECIALITIES} element={<AllSpecialitiesPage />} />
						<Route path={ROUTES.SYMPTOMS} element={<AllSymptomsPage />} />
						<Route path={ROUTES.RADIOLOGY.SEARCH} element={<RadiologySearchPage />} />
						
					</Route>

					<Route element={<SidebarProtectedLayout />} />

					<Route element={<LoggedInNavbarLayout />}>
						<Route path={ROUTES.PORTAL.HOME} element={<PortalPage />} />
						<Route path={ROUTES.APPOINTMENTS} element={<AppointmentsRedirect />} />
						<Route path={ROUTES.BOOKINGS} element={<MyBookingsPage />} />
						<Route path={ROUTES.LAB.HOME} element={<LabBrowsePage />} />
						<Route path={ROUTES.LAB.CART} element={<LabCartPage />} />
						<Route path={ROUTES.LAB.REVIEW} element={<LabReviewPage />} />
						<Route path={ROUTES.LAB.BOOKED} element={<LabBookedPage />} />
						<Route path={ROUTES.LAB.ORDER} element={<LabOrderPage />} />
						<Route path={ROUTES.LAB.REPORT} element={<LabReportPage />} />
						<Route path={ROUTES.SCHEDULE} element={<SchedulePage />} />
						<Route path={ROUTES.PORTAL.APPOINTMENT_DETAIL} element={<PatientAppointmentDetailPage />} />
						<Route path={ROUTES.PORTAL.PROFILE} element={<ProfilePage />} />
						<Route path={ROUTES.PORTAL.CONSULTATION} element={<ConsultationPage />} />

						<Route path={ROUTES.RADIOLOGY.PROFILE} element={<RadiologyProfilePage />} />
						<Route path={ROUTES.RADIOLOGY.BOOKINGS} element={<BookingsList />} />
						<Route path={ROUTES.RADIOLOGY.BOOKING_DETAIL} element={<BookingDetailPage />} />
						<Route path={ROUTES.PORTAL.FAVOURITES} element={<FavouriteDoctorsPage />} />
						
						{/* Doctor Events */}
						<Route path={ROUTES.DOCTOR.EVENTS} element={<DoctorEventListPage />} />
						<Route path={ROUTES.DOCTOR.EVENT_CREATE} element={<DoctorEventFormPage />} />
						<Route path={ROUTES.DOCTOR.EVENT_EDIT} element={<DoctorEventFormPage />} />
						
						<Route path={ROUTES.BLOGS.LIST} element={<BlogListPage />} />
						<Route path={ROUTES.BLOGS.DETAIL} element={<BlogArticlePage />} />
						<Route path={ROUTES.COMMUNITIES.LIST} element={<CommunityForumPage />} />
						<Route path={ROUTES.COMMUNITIES.DETAIL} element={<CommunityThreadPage />} />
						<Route path={ROUTES.COMMUNITIES.THREAD} element={<CommunityThreadPage />} />
						
						<Route path={ROUTES.EVENTS.LIST} element={<EventsListPage />} />
						<Route path={ROUTES.EVENTS.DETAIL} element={<EventDetailsPage />} />
					</Route>
				</Route>



				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</>
	)
}
