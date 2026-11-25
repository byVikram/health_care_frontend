// src/components/layout/PatientPageShell.tsx
//
// The frame of the patient booking pages (Lab tests, home care): the desktop page background under the navbar, a centred column with the design's gutters, and the
// patient-only guard (a doctor who lands here is sent to their Schedule).
import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { USER_ROLES } from '../../constants/constants'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { DESK } from '../../styles/deskTokens'

interface PatientPageShellProps {
	children: ReactNode
	/** Width of the centred column in px (the design: 1240 for the browse / cart / order pages, narrower for Booked and Report). */
	maxWidth?: number
	/** A full-width band above the centred column (the browse page's dark hero). */
	hero?: ReactNode
}

export default function PatientPageShell({ children, maxWidth = 1240, hero }: PatientPageShellProps) {
	const { role } = useAuth()
	if (role === USER_ROLES.DOCTOR) return <Navigate to={ROUTES.SCHEDULE} replace />

	return (
		<Box sx={{ bgcolor: DESK.page, color: DESK.ink, minHeight: 'calc(100vh - 64px)' }}>
			{hero}
			<Box sx={{ px: '24px' }}>
				<Box sx={{ maxWidth, mx: 'auto', pt: '22px', pb: '48px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
					{children}
				</Box>
			</Box>
		</Box>
	)
}
