// src/features/admin/pages/AdminAppointmentsPage.tsx
import { Box, Typography } from '@mui/material'

import SectionCard from '../../../components/common/Card/SectionCard'
import AdminAppointmentsPanel from '../components/AdminAppointmentsPanel'

export default function AdminAppointmentsPage() {
	return (
		<Box>
			<SectionCard title="Master Appointment Management & Overrides">
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					View all appointments, reschedule slots, override cancellations, or trigger manual refunds
				</Typography>

				<AdminAppointmentsPanel />
			</SectionCard>
		</Box>
	)
}
