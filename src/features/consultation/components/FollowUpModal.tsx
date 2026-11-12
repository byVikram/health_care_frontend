import React, { useState, useEffect } from 'react'
import { Box, Typography, Dialog, DialogContent, DialogTitle, IconButton, Chip, TextField, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EventRepeatIcon from '@mui/icons-material/EventRepeat'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'

type ChipOption = '1 Week' | '2 Weeks' | '1 Month' | 'Custom Date'

interface FollowUpModalProps {
	open: boolean
	onClose: () => void
	/** Saves the follow-up date on the visit's treatment record (the treatment API has no note, as in the mobile app). */
	onSave: (dueDate: Date) => Promise<void> | void
	loading?: boolean
	patientName?: string
}

export default function FollowUpModal({
	open,
	onClose,
	onSave,
	loading = false,
	patientName = 'Patient',
}: FollowUpModalProps) {
	const [selectedChip, setSelectedChip] = useState<ChipOption>('1 Week')
	const [dueDate, setDueDate] = useState<string>(() => {
		const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
		return d.toISOString().split('T')[0]
	})
	const [customDate, setCustomDate] = useState<string | null>(null)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		if (open) {
			setSelectedChip('1 Week')
			const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			setDueDate(d.toISOString().split('T')[0])
			setCustomDate(null)
			setError('')
		}
	}, [open])

	const handleChipSelect = (chip: ChipOption) => {
		setSelectedChip(chip)
		setError('')
		const now = new Date()
		if (chip === '1 Week') {
			const d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
			setDueDate(d.toISOString().split('T')[0])
		} else if (chip === '2 Weeks') {
			const d = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
			setDueDate(d.toISOString().split('T')[0])
		} else if (chip === '1 Month') {
			const d = new Date(now)
			d.setMonth(d.getMonth() + 1)
			setDueDate(d.toISOString().split('T')[0])
		} else if (chip === 'Custom Date') {
			if (customDate) {
				setDueDate(customDate)
			} else {
				const todayStr = new Date().toISOString().split('T')[0]
				setDueDate(todayStr)
				setCustomDate(todayStr)
			}
		}
	}

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		setDueDate(val)
		setCustomDate(val)
		setSelectedChip('Custom Date')
		const selected = new Date(val)
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		if (selected < today) {
			setError('Please select a date in the future.')
		} else {
			setError('')
		}
	}


	const handleSave = async () => {
		if (!dueDate) {
			setError('Please select a valid future follow-up date.')
			return
		}
		const selected = new Date(dueDate)
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		if (selected < today || isNaN(selected.getTime())) {
			setError('Please select a valid future follow-up date.')
			return
		}
		await onSave(selected)
	}

	const formatDateDisplay = (dateStr: string) => {
		if (!dateStr) return 'Select Date'
		const d = new Date(dateStr)
		if (isNaN(d.getTime())) return dateStr
		return d.toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '16px',
					boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
					overflow: 'hidden',
				},
			}}
		>
			<DialogTitle
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					bgcolor: '#f8fafc',
					borderBottom: '1px solid #e2e8f0',
					px: 3,
					py: 2,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: '10px',
							bgcolor: '#e8f4f4',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#2b6f71',
						}}
					>
						<EventRepeatIcon />
					</Box>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', lineHeight: 1.2 }}>
							Doctor Follow-up (Reconnect)
						</Typography>
						<Typography variant="caption" sx={{ color: '#64748b' }}>
							Recommend follow-up timeframe for {patientName}
						</Typography>
					</Box>
				</Box>
				<IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 3 }}>
				{/* Quick selection chips */}
				<Typography variant="subtitle2" sx={{ color: '#2b6f71', fontWeight: 600, mb: 1.5, mt: 1 }}>
					Select Timeframe
				</Typography>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
					{(['1 Week', '2 Weeks', '1 Month', 'Custom Date'] as ChipOption[]).map((chip) => {
						const active = selectedChip === chip
						return (
							<Chip
								key={chip}
								label={chip}
								onClick={() => handleChipSelect(chip)}
								sx={{
									fontWeight: 600,
									px: 1,
									py: 2.2,
									borderRadius: '20px',
									bgcolor: active ? '#2b6f71' : '#f1f5f9',
									color: active ? '#ffffff' : '#334155',
									border: '1px solid',
									borderColor: active ? '#2b6f71' : '#cbd5e1',
									'&:hover': {
										bgcolor: active ? '#23595b' : '#e2e8f0',
									},
								}}
							/>
						)
					})}
				</Box>

				{/* Due Date Selector */}
				{selectedChip !== 'Custom Date' ? (
					<>
						<Typography variant="subtitle2" sx={{ color: '#2b6f71', fontWeight: 600, mb: 1 }}>
							Follow-up Due Date
						</Typography>
						<Box
							onClick={() => handleChipSelect('Custom Date')}
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								p: 1.8,
								borderRadius: '12px',
								border: '1px solid #cbd5e1',
								bgcolor: '#f8fafc',
								cursor: 'pointer',
								mb: 3,
								'&:hover': { borderColor: '#94a3b8' },
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
								<CalendarMonthIcon sx={{ color: '#2b6f71', fontSize: 22 }} />
								<Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
									{formatDateDisplay(dueDate)}
								</Typography>
							</Box>
							<Typography variant="caption" sx={{ color: '#2b6f71', fontWeight: 600 }}>
								Change
							</Typography>
						</Box>
					</>
				) : (
					<>
						<Typography variant="subtitle2" sx={{ color: '#2b6f71', fontWeight: 600, mb: 1 }}>
							Select Custom Date
						</Typography>
						<Box sx={{ mb: 3, p: 2, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
							<TextField
								type="date"
								fullWidth
								size="small"
								value={dueDate}
								onChange={handleDateChange}
								inputProps={{ min: new Date().toISOString().split('T')[0] }}
							/>
						</Box>
					</>
				)}


				{error && (
					<Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mb: 2, fontWeight: 600 }}>
						{error}
					</Typography>
				)}
			</DialogContent>

			<Box
				sx={{
					display: 'flex',
					justifyContent: 'flex-end',
					gap: 1.5,
					px: 3,
					py: 2,
					bgcolor: '#f8fafc',
					borderTop: '1px solid #e2e8f0',
				}}
			>
				<AppButton
					variant="outlined"
					label="Cancel"
					onClick={onClose}
					disabled={loading}
					borderRadius="20px"
					sx={{ px: 3, borderColor: '#cbd5e1', color: '#64748b' }}
				/>
				<AppButton
					variant="contained"
					label="Save"
					onClick={handleSave}
					loading={loading}
					borderRadius="20px"
					sx={{ px: 4, bgcolor: '#2b6f71', '&:hover': { bgcolor: '#23595b' } }}
				/>
			</Box>
		</Dialog>
	)
}
