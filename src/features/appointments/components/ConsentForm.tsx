import { Dialog, DialogTitle, DialogContent, Typography, Box, Checkbox, Divider } from '@mui/material'
import { useState } from 'react'
import AppButton from '../../../components/common/Button/AppButton'

interface Props {
	open: boolean
	onClose: () => void
	onAgree: () => void
}

const appointmentRules = [
	'The appointment is subject to doctor availability and confirmation.',
	'Please provide accurate personal and medical information.',
	'Arrive at least 10–15 minutes before your appointment time.',
	'Late arrival may result in delay or rescheduling.',
	'Cancellation or rescheduling must follow clinic/hospital policy.',
	'Consultation outcomes are determined by the doctor\'s medical judgment.',
	'For online consultations, patients are responsible for internet/device availability.',
	'Patient information will be stored securely for healthcare purposes.',
]

const consentPoints = [
	'You have read and understood these terms.',
	'You agree to follow appointment policies.',
	'You consent to the collection and use of your information for appointment scheduling.',
]

export default function ConsentModal({ open, onClose, onAgree }: Props) {
	const [checked, setChecked] = useState(false)

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '16px',
					maxHeight: '90vh',
				},
			}}
		>
			<DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
				<Typography sx={{ fontWeight: 700, fontSize: '20px', color: 'text.primary' }}>
					Patient Appointment Consent
				</Typography>
				<Typography sx={{ fontSize: '13px', color: 'text.secondary', mt: 0.5 }}>
					Please read the following terms carefully before booking your appointment.
				</Typography>
			</DialogTitle>

			<DialogContent sx={{ px: 3, pb: 3 }}>
				{/* Scrollable rules area */}
				<Box
					sx={{
						border: '1px solid',
						borderColor: 'divider',
						borderRadius: '10px',
						maxHeight: 320,
						overflowY: 'auto',
						p: 2.5,
						mb: 2.5,
						bgcolor: '#f8fafc',
						'&::-webkit-scrollbar': { width: '6px' },
						'&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
						'&::-webkit-scrollbar-thumb': { bgcolor: '#c8d0d8', borderRadius: '3px' },
					}}
				>
					{/* Section 1: Rules */}
					<Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'text.primary', mb: 1.2 }}>
						By booking an appointment through this website, you agree to the following:
					</Typography>
					<Box component="ul" sx={{ pl: 2.5, m: 0, mb: 2.5 }}>
						{appointmentRules.map((rule, i) => (
							<Box
								component="li"
								key={i}
								sx={{ mb: 0.8, fontSize: '13px', color: 'text.secondary', lineHeight: 1.6 }}
							>
								{rule}
							</Box>
						))}
					</Box>

					<Divider sx={{ my: 2 }} />

					{/* Section 2: Consent */}
					<Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'text.primary', mb: 1.2 }}>
						Consent
					</Typography>
					<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>
						By clicking "Agree & Continue", you confirm that:
					</Typography>
					<Box component="ul" sx={{ pl: 2.5, m: 0 }}>
						{consentPoints.map((point, i) => (
							<Box
								component="li"
								key={i}
								sx={{ mb: 0.8, fontSize: '13px', color: 'text.secondary', lineHeight: 1.6 }}
							>
								{point}
							</Box>
						))}
					</Box>
				</Box>

				{/* Checkbox */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						p: 1.5,
						borderRadius: '8px',
						border: '1px solid',
						borderColor: checked ? '#0c7c7c' : 'divider',
						bgcolor: checked ? 'rgba(12,124,124,0.04)' : 'transparent',
						transition: 'all 0.2s ease',
						mb: 3,
						cursor: 'pointer',
					}}
					onClick={() => setChecked((v) => !v)}
				>
					<Checkbox
						checked={checked}
						onChange={(e) => setChecked(e.target.checked)}
						onClick={(e) => e.stopPropagation()}
						sx={{
							color: '#0c7c7c',
							'&.Mui-checked': { color: '#0c7c7c' },
							p: 0,
						}}
					/>
					<Typography sx={{ fontSize: '13px', color: 'text.primary', userSelect: 'none' }}>
						I agree to the appointment booking terms and conditions.
					</Typography>
				</Box>

				{/* Buttons */}
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
					<AppButton variant="outlined" label="Cancel" onClick={onClose} />
					<AppButton
						label="Agree & Continue"
						disabled={!checked}
						onClick={onAgree}
					/>
				</Box>
			</DialogContent>
		</Dialog>
	)
}
