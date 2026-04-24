// src/features/doctor/profile/components/DoctorHospitalsTab.tsx
import { useState } from 'react'
import { Box, Typography, IconButton, Radio } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import { toast } from 'react-toastify'
import AppButton from '../../../../components/common/Button/AppButton'
import AppInput from '../../../../components/common/Input/AppInput'
import { customCardStyle } from '../../../../styles/commonStyles'
import type { DoctorHospital } from '../../../../types/doctor-profile'
import { createHospital } from '../../doctorService'
import { MenuItem, TextField } from '@mui/material'

interface DoctorHospitalsTabProps {
	hospitals: DoctorHospital[]
	onChange: (hospitals: DoctorHospital[]) => void
}

const EMPTY_FORM = {
	name: '',
	fullAddress: '',
	phone_number: '',
	video_consultation_fee: '',
	offline_consultation_fee: '',
}

const getSuccessMessage = (response: unknown) => {
	if (
		typeof response === 'object' &&
		response !== null &&
		'message' in response &&
		typeof response.message === 'string'
	) {
		return response.message
	}

	return 'Hospital saved successfully'
}

const getHospitalAddressText = (hospital: DoctorHospital) => {
	const fullAddress = hospital.fullAddress.trim()
	const location = hospital.location.trim()

	if (fullAddress && location && fullAddress !== location) {
		return `${fullAddress} ${location}`.trim()
	}

	return fullAddress || location
}

// Generate time options for a given hour range (inclusive start, exclusive end)
// Generate time options for a given hour range; value = 24h, label = 12h AM/PM
const makeTimeOptions = (startHour: number, endHour: number) => {
	const options: { value: string; label: string }[] = []
	for (let h = startHour; h <= endHour; h++) {
		for (const m of ['00', '30']) {
			if (h === endHour && m === '30') break
			const value = String(h).padStart(2, '0') + ':' + m
			const period = h < 12 ? 'AM' : 'PM'
			const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
			const label = h12 + ':' + m + ' ' + period
			options.push({ value, label })
		}
	}
	return options
}

const morningOptions   = makeTimeOptions(8, 12)   // 8:00 AM - 12:00 PM
const afternoonOptions = makeTimeOptions(12, 17)  // 12:00 PM - 5:00 PM
const eveningOptions   = makeTimeOptions(17, 21)  // 5:00 PM - 9:00 PM

const durationOptions = [10, 15, 20, 25, 30]

export default function DoctorHospitalsTab({ hospitals, onChange }: DoctorHospitalsTabProps) {
	const [showForm, setShowForm] = useState(false)
	const [form, setForm] = useState(EMPTY_FORM)
	const [isSaving, setIsSaving] = useState(false)

	// Morning shift
	const [morningStart, setMorningStart] = useState('08:00')
	const [morningEnd, setMorningEnd]     = useState('12:00')

	// Afternoon shift
	const [afternoonStart, setAfternoonStart] = useState('12:00')
	const [afternoonEnd, setAfternoonEnd]     = useState('17:00')

	// Evening shift
	const [eveningStart, setEveningStart] = useState('17:00')
	const [eveningEnd, setEveningEnd]     = useState('21:00')

	// Slot duration
	const [slotDuration, setSlotDuration] = useState(15)

	const handleSetPrimary = (id: string) => {
		onChange(hospitals.map((h) => ({ ...h, isPrimary: h.id === id })))
	}

	const handleSave = async () => {
		const trimmedName = form.name.trim()
		const trimmedAddress = form.fullAddress.trim()
		const isPrimary = hospitals.length === 0

		if (!trimmedName) {
			toast.error('Hospital name is required')
			return
		}

		if (!trimmedAddress) {
			toast.error('Full address is required')
			return
		}

		setIsSaving(true)

		try {
			const response = await createHospital({
				name: trimmedName,
				phone_number: form.phone_number.trim(),
				full_address: trimmedAddress,
				is_primary: isPrimary,
				video_consultation_fee: form.video_consultation_fee.trim(),
				offline_consultation_fee: form.offline_consultation_fee.trim(),
			})

			toast.success(getSuccessMessage(response))
			window.location.reload()
		} catch (error) {
			console.error('Failed to save hospital', error)
			toast.error('Failed to save hospital')
		} finally {
			setIsSaving(false)
		}
	}

	if (showForm) {
		return (
			<Box sx={{ ...customCardStyle }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
					<IconButton
						size="small"
						onClick={() => {
							setShowForm(false)
							setForm(EMPTY_FORM)
						}}
						sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
					>
						<ArrowBackIosNewIcon sx={{ fontSize: 15 }} />
					</IconButton>
					<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px' }}>
						Add new Hospital Details
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					<AppInput
						label="Enter hospital name"
						value={form.name}
						placeholder="e.g. Arogya Clinic"
						onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
					/>
					<AppInput
						label="Phone number"
						value={form.phone_number}
						placeholder="e.g. +91 98765 43210"
						onChange={(e) => setForm((prev) => ({ ...prev, phone_number: e.target.value }))}
					/>
					<AppInput
						label="Enter Full address"
						value={form.fullAddress}
						placeholder="Enter complete address"
						multiline
						rows={3}
						onChange={(e) => setForm((prev) => ({ ...prev, fullAddress: e.target.value }))}
					/>
					<AppInput
						label="Video consultation fee"
						value={form.video_consultation_fee}
						placeholder="e.g. 500"
						onChange={(e) => setForm((prev) => ({ ...prev, video_consultation_fee: e.target.value }))}
					/>
					<AppInput
						label="Offline consultation fee"
						value={form.offline_consultation_fee}
						placeholder="e.g. 300"
						onChange={(e) => setForm((prev) => ({ ...prev, offline_consultation_fee: e.target.value }))}
					/>

					{/* Working Hours */}
					<Box sx={{ mt: 0.5 }}>
						<Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 1.5 }}>Working Hours</Typography>

						{/* Morning */}
						<Box sx={{ mb: 2 }}>
							<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>Morning</Typography>
							<Box sx={{ display: 'flex', gap: 2 }}>
								<TextField
									select label="Start Time" value={morningStart}
									onChange={(e) => setMorningStart(e.target.value)}
									size="small" sx={{ width: 150 }}
								>
									{morningOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
								</TextField>
								<TextField
									select label="End Time" value={morningEnd}
									onChange={(e) => setMorningEnd(e.target.value)}
									size="small" sx={{ width: 150 }}
								>
									{morningOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
								</TextField>
							</Box>
						</Box>

						{/* Afternoon */}
						<Box sx={{ mb: 2 }}>
							<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>Afternoon</Typography>
							<Box sx={{ display: 'flex', gap: 2 }}>
								<TextField
									select label="Start Time" value={afternoonStart}
									onChange={(e) => setAfternoonStart(e.target.value)}
									size="small" sx={{ width: 150 }}
								>
									{afternoonOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
								</TextField>
								<TextField
									select label="End Time" value={afternoonEnd}
									onChange={(e) => setAfternoonEnd(e.target.value)}
									size="small" sx={{ width: 150 }}
								>
									{afternoonOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
								</TextField>
							</Box>
						</Box>

						{/* Evening */}
						<Box sx={{ mb: 2 }}>
							<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>Evening</Typography>
							<Box sx={{ display: 'flex', gap: 2 }}>
								<TextField
									select label="Start Time" value={eveningStart}
									onChange={(e) => setEveningStart(e.target.value)}
									size="small" sx={{ width: 150 }}
								>
									{eveningOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
								</TextField>
								<TextField
									select label="End Time" value={eveningEnd}
									onChange={(e) => setEveningEnd(e.target.value)}
									size="small" sx={{ width: 150 }}
								>
									{eveningOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
								</TextField>
							</Box>
						</Box>

						{/* Slot Duration */}
						<Box>
							<Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 1 }}>Slot Duration</Typography>
							<TextField
								select label="Duration" value={slotDuration}
								onChange={(e) => setSlotDuration(Number(e.target.value))}
								size="small" sx={{ width: 150 }}
							>
								{durationOptions.map((d) => (
									<MenuItem key={d} value={d}>{d} mins</MenuItem>
								))}
							</TextField>
						</Box>
					</Box>
				</Box>

				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
					<AppButton variant="contained" onClick={handleSave} loading={isSaving} label="Save Details" />
				</Box>
			</Box>
		)
	}

	return (
		<Box sx={{ ...customCardStyle }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
				<Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
					My Hospital
				</Typography>
				<AppButton
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setShowForm(true)}
					label="Add new hospital"
				/>
			</Box>

			{hospitals.length === 0 ? (
				<Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
					<HomeOutlinedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
					<Typography variant="body2">No hospitals added yet</Typography>
				</Box>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					{hospitals.map((hospital, index) => (
						<Box key={hospital.id}>
							<Typography
								variant="caption"
								sx={{
									color: 'primary.main',
									fontWeight: 600,
									fontSize: '13px',
									mb: 1,
									display: 'block',
								}}
							>
								Address {index + 1}
							</Typography>

							<Box sx={{ display: 'flex', gap: 1 }}>
								<Box
									sx={{
										flex: 1,
										border: '1px solid',
										borderColor: hospital.isPrimary ? 'primary.main' : 'divider',
										borderRadius: '10px',
										p: 2,
										borderLeft: '4px solid',
										borderLeftColor: hospital.isPrimary ? 'primary.main' : 'divider',
									}}
								>
									<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
										<HomeOutlinedIcon
											sx={{ fontSize: 18, color: 'primary.main', mt: 0.2, flexShrink: 0 }}
										/>
										<Box sx={{ flex: 1 }}>
											<Typography
												variant="body2"
												sx={{ fontWeight: 600, color: 'text.primary', mb: 0.4 }}
											>
												{hospital.name}
											</Typography>
											<Typography
												variant="caption"
												sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.5 }}
											>
												{getHospitalAddressText(hospital)}
											</Typography>
										</Box>
									</Box>
								</Box>

								<Box
									sx={{
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: '10px',
										px: 2,
										display: 'flex',
										alignItems: 'center',
										gap: 0.5,
										cursor: 'pointer',
										minWidth: 140,
										justifyContent: 'center',
										'&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(43,111,113,0.03)' },
										transition: 'all 0.15s',
									}}
									onClick={() => handleSetPrimary(hospital.id)}
								>
									<Typography
										variant="caption"
										sx={{ color: 'primary.main', fontWeight: 500, fontSize: '13px' }}
									>
										Set as Primary
									</Typography>
									<Radio
										checked={hospital.isPrimary}
										size="small"
										sx={{ p: 0, color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
									/>
								</Box>

								<Box
									sx={{
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: '10px',
										width: 44,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
										'&:hover': { borderColor: 'primary.main' },
										transition: 'all 0.15s',
									}}
								>
									<MoreHorizIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
								</Box>
							</Box>
						</Box>
					))}
				</Box>
			)}
		</Box>
	)
}
