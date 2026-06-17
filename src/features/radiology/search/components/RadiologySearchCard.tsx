// src/features/radiology/search/components/RadiologySearchCard.tsx
import { useState } from 'react'
import {
	Box,
	Typography,
	Avatar,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	IconButton,
	Snackbar,
	Alert,
	// Chip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn'
// import ScienceIcon from '@mui/icons-material/Science'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import AppButton from '../../../../components/common/Button/AppButton'
import { RadiologySearchResultItem } from '../../../../types/radiology-search'
import { createRadiologyBooking } from '../../radiologyService'
import { formatINR } from '../../../../utils/Utils'
import { useNavigate } from 'react-router-dom'

// ── Local asset map keyed by logo_s3_key value stored in DB ──────────────────
import apexImg from '../../../../assets/Radiology/Apex.png'
import eliteImg from '../../../../assets/Radiology/Elite.png'
import focusImg from '../../../../assets/Radiology/Focus Scanning.png'
import metroImg from '../../../../assets/Radiology/Metro Diagnostics.png'
import primeImg from '../../../../assets/Radiology/prime.png'

const LOGO_KEY_MAP: Record<string, string> = {
	'radiology/apex.png': apexImg,
	'radiology/elite.png': eliteImg,
	'radiology/focus_scanning.png': focusImg,
	'radiology/metro_diagnostics.png': metroImg,
	'radiology/prime.png': primeImg,
}

// Fallback: match by centre name if logo_s3_key is not yet set in DB
const LOGO_NAME_MAP: Record<string, string> = {
	'apex diagnostic laboratory': apexImg,
	'elite mri & ct center': eliteImg,
	'focus scan & imaging': focusImg,
	'metro diagnostics': metroImg,
	'prime diagnostics': primeImg,
}

function resolveLogoSrc(item: RadiologySearchResultItem): string {
	if (item.logo_s3_key) {
		const byKey = LOGO_KEY_MAP[item.logo_s3_key.toLowerCase()]
		if (byKey) return byKey
	}
	// Fallback to name-based lookup
	return LOGO_NAME_MAP[item.name.toLowerCase()] ?? ''
}

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

	const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success',
	})

	const logoSrc = resolveLogoSrc(item)

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
			setToast({ open: true, message: 'Please fill in both date and time', severity: 'error' })
			return
		}

		try {
			setSubmitting(true)
			const res = await createRadiologyBooking({
				radiology_id: item.id,
				scan_ids: [item.scan_id],
				booking_date: bookingDate,
				booking_time: bookingTime,
				notes: notes || undefined,
			})

			if (res.success) {
				setToast({ open: true, message: 'Booking request submitted successfully!', severity: 'success' })
				handleClose()
				setTimeout(() => navigate('/radiology/bookings'), 1000)
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
		if (item.pricing_model === 'starting_from') return 'Starts from'
		if (item.pricing_model === 'fixed') return 'Fixed'
		return item.pricing_model
	}

	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '8px',
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
			{/* Image area — same compact height as DoctorSearchCard */}
			<Box sx={{ position: 'relative', height: 160, bgcolor: 'grey.100' }}>
				<Avatar
					src={logoSrc}
					alt={item.name}
					variant="square"
					sx={{
						width: '100%',
						height: '100%',
						'& img': { objectFit: 'cover', objectPosition: 'center', height: '100%' },
					}}
				>
					<LocalHospitalIcon sx={{ fontSize: 56, color: 'primary.main', opacity: 0.3 }} />
				</Avatar>
			</Box>

			{/* Info area — compact like DoctorSearchCard */}
			<Box sx={{ p: 2 }}> 
				{/* Scan type chip */}
				{/* <Chip
					icon={<ScienceIcon sx={{ fontSize: '14px !important' }} />}
					label={item.scan_name}
					size="small"
					sx={{
						bgcolor: 'rgba(43,111,113,0.08)',
						color: 'primary.main',
						fontWeight: 600,
						mb: 0.8,
						px: 0.5,
						height: 22,
						fontSize: '11px',
					}}  */}
			

				{/* Facility Name */}
				<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.2, lineHeight: 1.25, fontSize: '1rem' }}>
					{item.name}
				</Typography>

				{/* Address */}
				<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.4, mb: 1.5 }}>
					<LocationOnIcon sx={{ fontSize: 13, color: 'primary.main', mt: 0.3 }} />
					<Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
						{item.address}, {item.city}, {item.state}
					</Typography>
				</Box>

				{/* Pricing */}
				<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 2 }}>
					{item.pricing_model !== 'quote_required' && item.base_price !== null ? (
						<>
							<Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.1rem' }}>
								{formatINR(item.base_price)}
							</Typography>
							{item.pricing_model === 'starting_from' && (
								<Typography variant="caption" sx={{ color: 'text.secondary' }}>
									{getPricingLabel()}
								</Typography>
							)}
						</>
					) : (
						<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Contact for pricing
						</Typography>
					)}
				</Box>

				{/* Book button */}
				<AppButton
					label="Book Scan"
					fullWidth
					onClick={handleOpen}
					sx={{ borderRadius: '10px', py: 0.8, fontWeight: 600 }}
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
						sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 600, '&:hover': { bgcolor: 'primary.dark' } }}
					>
						{submitting ? 'Booking...' : 'Confirm Booking'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Toast */}
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
