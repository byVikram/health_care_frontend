// src/features/portal/HealthQuestionsPage.tsx
import PatientHealthQuestionsSection from '../patient/components/PatientHealthQuestionsSection'
import { Container, Box, Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useAuth } from '../../hooks/useAuth'
import { useGoBack } from '../../hooks/useGoBack'
import { USER_ROLES } from '../../constants/constants'

export default function HealthQuestionsPage() {
	const goBack = useGoBack()
	const { role } = useAuth()
	// '/' is the public / patient landing page; everyone else signed in comes from their dashboard
	const backLabel = role && role !== USER_ROLES.PATIENT ? 'Back to Dashboard' : 'Back to Home'

	return (
		<Box sx={{ py: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
			<Container maxWidth="lg">
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={goBack}
					sx={{ mb: 2, textTransform: 'none', color: '#0f172a', fontWeight: 600 }}
				>
					{backLabel}
				</Button>
				<PatientHealthQuestionsSection isPortalPage={true} />
			</Container>
		</Box>
	)
}
