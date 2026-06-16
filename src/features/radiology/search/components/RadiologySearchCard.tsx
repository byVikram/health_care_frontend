// src/features/radiology/search/components/RadiologySearchCard.tsx
import { useState } from 'react'
import {
	Box,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	IconButton,
	Snackbar,
	Alert,
	Chip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ScienceIcon from '@mui/icons-material/Science'
import LocalActivityIcon from '@mui/icons-material/LocalActivity'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import AppButton from '../../../../components/common/Button/AppButton'
import { RadiologySearchResultItem } from '../../../../types/radiology-search'
import { createRadiologyBooking } from '../../radiologyService'
import { formatINR } from '../../../../utils/Utils'
import { useNavigate } from 'react-router-dom'

interface RadiologySearchCardProps {
	item: RadiologySearchResultItem
}

export default function RadiologySearchCard({ item }: RadiologySearchCardProps) {
	const navigate = useNavigate()
	const [openModal, setOpenModal] = useState(false)
	const [bookingDate, setBookingDate] = useState('')
	const [bookingTime, setBookingTime] = useState('')
	const [notes, setNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)

	// Notification states
	const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success',
	})

	const handleOpen = (e: React.MouseEvent) => {
		e.stopPropagation()
		setOpenModal(true)
	}

	const handleClose = () => {
		setOpenModal(false)
		setBookingDate('')
		setBookingTime('')
		setNotes('')
	}

	const handleSubmit = async () => {
		if (!bookingDate || !bookingTime) {
			setToast({
				open: true,
				message: 'Please fill in both date and time',
				severity: 'error',
			})
			return
		}

		try {
			setSubmitting(true)
			const res = await createRadiologyBooking({
				radiology_id: item.radiology_id,
				scan_ids: [item.scan_id],
				booking_date: bookingDate,
				booking_time: bookingTime,
				notes: notes || undefined,
			})

			if (res.success) {
				setToast({
					open: true,
					message: 'Booking request submitted successfully!',
					severity: 'success',
				})
				handleClose()
				// Redirect to booking list
				setTimeout(() => {
					navigate('/radiology/bookings')
				}, 1000)
			} else {
				throw new Error(res.message || 'Failed to book')
			}
		} catch (err: unknown) {
			console.error(err)
			setToast({
				open: true,
				message: (err as Error)?.message || 'Something went wrong. Please try again.',
				severity: 'error',
			})
		} finally {
			setSubmitting(false)
		}
	}

	const getPricingLabel = () => {
		switch (item.pricing_model) {
			case 'fixed':
				return 'Fixed'
			case 'starting_from':
				return 'Starts from'
			case 'quote_required':
				return 'Quote Required'
			default:
				return item.pricing_model
		}
	}

	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '12px',
				overflow: 'hidden',
				transition: 'box-shadow 0.2s, transform 0.2s',
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				justifyContent: 'space-between',
				'&:hover': {
					boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
					transform: 'translateY(-2px)',
				},
			}}
		>
			<Box sx={{ p: 2.5 }}>
				{/* Badge / Scan Category Icon */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
					<Chip
						icon={<ScienceIcon sx={{ fontSize: '16px !important' }} />}
						label={item.scan_name}
						size="small"
						sx={{
							bgcolor: 'rgba(43,111,113,0.08)',
							color: 'primary.main',
							fontWeight: 600,
							px: 0.5,
						}}
					/>
					<Chip
						label={getPricingLabel()}
						size="small"
						variant="outlined"
						color={item.pricing_model === 'quote_required' ? 'warning' : 'primary'}
						sx={{ fontWeight: 600, height: 20, fontSize: '11px' }}
					/>
				</Box>

				{/* Title / Facility Name */}
				<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, lineHeight: 1.3 }}>
					{item.name}
				</Typography>

				{/* Address Row */}
				<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 2 }}>
					<LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.3 }} />
					<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
						{item.address}, {item.city}, {item.state}
					</Typography>
				</Box>

				{/* Pricing Section */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'baseline',
						bgcolor: 'grey.50',
						p: 1.5,
						borderRadius: '8px',
						gap: 0.5,
					}}
				>
					{item.pricing_model !== 'quote_required' && item.base_price !== null ? (
						<>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
								<CurrencyRupeeIcon sx={{ fontSize: 20 }} />
								{item.base_price}
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>
								{item.pricing_model === 'starting_from' ? 'onwards' : ''}
							</Typography>
						</>
					) : (
						<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Pricing provided via quote request
						</Typography>
					)}
				</Box>
			</Box>

			{/* Book Now Button */}
			<Box sx={{ p: 2, pt: 0 }}>
				<AppButton
					label="Book Scan"
					fullWidth
					onClick={handleOpen}
					sx={{ borderRadius: '8px', py: 1, fontWeight: 600 }}
				/>
			</Box>

			{/* Booking Modal */}
			<Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
					<Typography variant="h6" sx={{ fontWeight: 700 }}>
						Book {item.scan_name}
					</Typography>
					<IconButton onClick={handleClose} size="small">
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				<DialogContent dividers>
					<Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
						Schedule your scan appointment at <strong>{item.name}</strong>. The diagnostic center will review your request and confirm or provide a quote.
					</Typography>

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						<TextField
							label="Preferred Date"
							type="date"
							fullWidth
							required
							value={bookingDate}
							onChange={(e) => setBookingDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
							inputProps={{ min: new Date().toISOString().split('T')[0] }}
						/>

						<TextField
							label="Preferred Time"
							type="time"
							fullWidth
							required
							value={bookingTime}
							onChange={(e) => setBookingTime(e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>

						<TextField
							label="Additional Notes / Symptoms"
							multiline
							rows={3}
							fullWidth
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Mention any specific instructions or requirements..."
						/>
					</Box>
				</DialogContent>

				<DialogActions sx={{ p: 2.5 }}>
					<Button onClick={handleClose} variant="text" sx={{ color: 'text.secondary' }}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						variant="contained"
						disabled={submitting}
						sx={{
							bgcolor: 'primary.main',
							color: '#fff',
							fontWeight: 600,
							'&:hover': { bgcolor: 'primary.dark' },
						}}
					>
						{submitting ? 'Booking...' : 'Confirm Booking'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Feedback message */}
			<Snackbar
				open={toast.open}
				autoHideDuration={4000}
				onClose={() => setToast((prev) => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity={toast.severity} sx={{ width: '100%' }}>
					{toast.message}
				</Alert>
			</Snackbar>
		</Box>
	)
}
