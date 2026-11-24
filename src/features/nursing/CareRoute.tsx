// src/features/nursing/CareRoute.tsx
//
// Guards the /care/:serviceKey/... routes: a service the web has no booking flow for (a mistyped address) goes to the nursing page instead of a broken one.
import type { ReactNode } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { isCareServiceKey } from './careServices'

export default function CareRoute({ children }: { children: ReactNode }) {
	const { serviceKey } = useParams()
	if (serviceKey !== undefined && !isCareServiceKey(serviceKey)) return <Navigate to={ROUTES.NURSING.HOME} replace />
	return <>{children}</>
}
