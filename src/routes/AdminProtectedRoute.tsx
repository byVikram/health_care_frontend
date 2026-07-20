// src/routes/AdminProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ADMIN_ROLES } from '../constants/constants'
import { ROUTES } from '../constants/routes'

export default function AdminProtectedRoute() {
	const { accessToken, role } = useAuth()
	const isAuthenticated = !!accessToken
	const isAdmin = role ? ADMIN_ROLES.includes(role as any) : false

	if (!isAuthenticated || !isAdmin) {
		return <Navigate to={ROUTES.ADMIN.LOGIN} replace />
	}
	return <Outlet />
}
