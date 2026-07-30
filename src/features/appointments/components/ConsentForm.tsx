import { Dialog, DialogTitle, DialogContent, Typography, Box, Checkbox, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import AppButton from '../../../components/common/Button/AppButton'
import { getActiveConsent, ActiveConsentResponse } from '../../doctor/doctorService'

interface Props {
	open: boolean
	onClose: () => void
	onAgree: (consentId: string) => void
}

export default function ConsentModal({ open, onClose, onAgree }: Props) {
	const [checked, setChecked] = useState(false)
	const [consent, setConsent] = useState<ActiveConsentResponse['data'] | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	useEffect(() => {
		if (open) {
			setChecked(false)
			setLoading(true)
			setError(false)
			getActiveConsent()
				.then(data => setConsent(data))
				.catch(() => setError(true))
				.finally(() => setLoading(false))
		}
	}, [open])

	const parsedContent = typeof consent?.content === 'string'
		? (() => { try { return JSON.parse(consent.content) } catch { return { points: [] } } })()
		: consent?.content

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
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
						<CircularProgress size={32} sx={{ color: '#0c7c7c' }} />
					</Box>
				) : error ? (
					<Box sx={{ p: 4, textAlign: 'center' }}>
						<Typography color="error">Failed to load consent terms. Please try again.</Typography>
					</Box>
				) : (
					<>
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
							<Box component="ul" sx={{ pl: 2.5, m: 0 }}>
								{parsedContent?.points?.map((point: string, i: number) => (
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
					</>
				)}

				{/* Buttons */}
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
					<AppButton variant="outlined" label="Cancel" onClick={onClose} />
					<AppButton
						label="Agree & Continue"
						disabled={!checked || !consent || loading}
						onClick={() => consent && onAgree(consent.id)}
					/>
				</Box>
			</DialogContent>
		</Dialog>
	)
}
