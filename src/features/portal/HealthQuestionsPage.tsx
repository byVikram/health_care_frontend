// src/features/portal/HealthQuestionsPage.tsx
import PatientHealthQuestionsSection from '../patient/components/PatientHealthQuestionsSection'
import { Container, Box, Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'

export default function HealthQuestionsPage() {
	const navigate = useNavigate()

	return (
		<Box sx={{ py: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
			<Container maxWidth="lg">
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/')}
					sx={{ mb: 2, textTransform: 'none', color: '#0f172a', fontWeight: 600 }}
				>
					Back to Home
				</Button>
				<PatientHealthQuestionsSection isPortalPage={true} />
			</Container>
		</Box>
	)
}
