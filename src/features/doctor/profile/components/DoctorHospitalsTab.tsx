// src/features/doctor/profile/components/DoctorHospitalsTab.tsx
import { useState } from 'react'
import {
	Box,
	Typography,
	IconButton,
	Radio,
	Menu,
	MenuItem as MuiMenuItem,
	Grid,
} from '@mui/material'
import {
	Add as AddIcon,
	MoreVert as MoreVertIcon,
	ArrowBackIosNew as ArrowBackIosNewIcon,
	HomeOutlined as HomeOutlinedIcon,
	LocationOnOutlined as LocationOnOutlinedIcon,
	PhoneOutlined as PhoneOutlinedIcon,
	Check as CheckIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import AppButton from '../../../../components/common/Button/AppButton'
import AppInput from '../../../../components/common/Input/AppInput'
import AppSelect from '../../../../components/common/Select/AppSelect'
import { customCardStyle } from '../../../../styles/commonStyles'
import type { DoctorHospital } from '../../../../types/doctor-profile'
import { createHospital, updateHospital } from '../../doctorService'

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

// Pay Later is on for every hospital for now (its toggle was removed), so every save sends it as true.
const DEFAULT_ALLOW_PAY_LATER = true

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

export default function DoctorHospitalsTab({ hospitals, onChange }: DoctorHospitalsTabProps) {
	const [showForm, setShowForm] = useState(false)
	const [form, setForm] = useState(EMPTY_FORM)
	const [isSaving, setIsSaving] = useState(false)

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const [menuHospitalId, setMenuHospitalId] = useState<string | null>(null)
	const [editingHospitalId, setEditingHospitalId] = useState<string | null>(null)

	const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, hospitalId: string) => {
		e.stopPropagation()
		setAnchorEl(e.currentTarget)
		setMenuHospitalId(hospitalId)
	}

	const handleCloseMenu = () => {
		setAnchorEl(null)
		setMenuHospitalId(null)
	}

	const [followUpDays, setFollowUpDays] = useState(7)
	const [rescheduleCutoff, setRescheduleCutoff] = useState(2)

	const resetFormState = () => {
		setForm(EMPTY_FORM)
		setEditingHospitalId(null)
		setFollowUpDays(7)
		setRescheduleCutoff(2)
	}

	const handleEdit = (hospitalId: string) => {
		handleCloseMenu()
		const h = hospitals.find((h) => h.id === hospitalId)
		if (!h) return

		setForm({
			name: h.name,
			fullAddress: h.fullAddress,
			phone_number: h.phone_number ?? '',
			video_consultation_fee: h.video_consultation_fee !== undefined && h.video_consultation_fee !== null ? String(h.video_consultation_fee) : '',
			offline_consultation_fee: h.clinic_consultation_fee !== undefined && h.clinic_consultation_fee !== null ? String(h.clinic_consultation_fee) : '',
		})

		setFollowUpDays(h.free_followup_validity_days ?? 7)
		setRescheduleCutoff(h.reschedule_allowed_until_hours ?? 2)

		setEditingHospitalId(hospitalId)
		setShowForm(true)
	}

	const handleSetPrimary = (id: string) => {
		onChange(hospitals.map((h) => ({ ...h, isPrimary: h.id === id })))
	}

	const handleSave = async () => {
		const trimmedName = form.name.trim()
		const trimmedAddress = form.fullAddress.trim()
		const videoConsultationFee = Number(form.video_consultation_fee.trim() || 0)
		const clinicConsultationFee = Number(form.offline_consultation_fee.trim() || 0)
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
			if (editingHospitalId) {
				await updateHospital({
					hospital_id: editingHospitalId,
					name: trimmedName,
					full_address: trimmedAddress,
					phone_number: form.phone_number.trim(),
					video_consultation_fee: form.video_consultation_fee.trim(),
					offline_consultation_fee: form.offline_consultation_fee.trim(),
					free_followup_validity_days: followUpDays,
					reschedule_allowed_until_hours: rescheduleCutoff,
					allow_pay_later: DEFAULT_ALLOW_PAY_LATER,
				})
				const updatedHospitals = hospitals.map((h) =>
					h.id === editingHospitalId
						? {
							...h,
							name: trimmedName,
							fullAddress: trimmedAddress,
							location: trimmedAddress,
							phone_number: form.phone_number.trim(),
							video_consultation_fee: Number(form.video_consultation_fee.trim()) || 0,
							clinic_consultation_fee: Number(form.offline_consultation_fee.trim()) || 0,
							free_followup_validity_days: followUpDays,
							reschedule_allowed_until_hours: rescheduleCutoff,
							allow_pay_later: DEFAULT_ALLOW_PAY_LATER,
						}
						: h
				)
				onChange(updatedHospitals)
				toast.success('Hospital updated successfully')
			} else {
				const response = await createHospital({
					name: trimmedName,
					phone_number: form.phone_number.trim(),
					full_address: trimmedAddress,
					is_primary: isPrimary,
					video_consultation_fee: form.video_consultation_fee.trim(),
					offline_consultation_fee: form.offline_consultation_fee.trim(),
					appointment_rules: {
						free_followup_validity_days: followUpDays,
						reschedule_allowed_until_hours: rescheduleCutoff,
						allow_pay_later: DEFAULT_ALLOW_PAY_LATER,
					},
				})
				const hospitalId = response.data.public_id
				const newHospital: DoctorHospital = {
					id: hospitalId,
					name: trimmedName,
					location: trimmedAddress,
					fullAddress: trimmedAddress,
					isPrimary: isPrimary,
					phone_number: form.phone_number.trim(),
					video_consultation_fee: Number(form.video_consultation_fee.trim()) || 0,
					clinic_consultation_fee: Number(form.offline_consultation_fee.trim()) || 0,
					free_followup_validity_days: followUpDays,
					reschedule_allowed_until_hours: rescheduleCutoff,
					allow_pay_later: DEFAULT_ALLOW_PAY_LATER,
				}
				onChange([...hospitals, newHospital])
				toast.success(getSuccessMessage(response))
			}
			resetFormState()
			setShowForm(false)
		} catch (err: unknown) {
			const apiError = err as { response?: { data?: { message?: string } } }
			console.error('Failed to save:', apiError?.response?.data)
			toast.error(apiError?.response?.data?.message ?? 'Failed to save')
		} finally {
			setIsSaving(false)
		}
	}

	if (showForm) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				{/* Header Back Bar */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Box
						onClick={() => {
							setShowForm(false)
							resetFormState()
						}}
						sx={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 0.8,
							cursor: 'pointer',
							color: 'text.secondary',
							transition: 'color 0.2s',
							'&:hover': { color: '#2B6F71' },
						}}
					>
						<ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
						<Typography variant="caption" sx={{ fontWeight: 700 }}>
							Back to clinic list
						</Typography>
					</Box>
					<Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px' }}>
						* fields are required
					</Typography>
				</Box>

				<Box>
					<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.2, fontSize: '18px' }}>
						{editingHospitalId ? 'Edit Hospital Details' : 'Add new Hospital Details'}
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
						Define location details, consultation fees, and patient booking rules. Set working hours in the Availability tab.
					</Typography>
				</Box>

				{/* Clinic details, fees and booking rules, all in one card */}
				<Box sx={{ ...customCardStyle, borderRadius: '12px', border: '1px solid #E2E8F0', p: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: 28,
								height: 28,
								borderRadius: '6px',
								bgcolor: 'rgba(43, 111, 113, 0.08)',
								color: '#2B6F71',
							}}
						>
							<HomeOutlinedIcon sx={{ fontSize: 16 }} />
						</Box>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A4345' }}>
							Clinic Details & Booking Preferences
						</Typography>
					</Box>

					<Grid container spacing={2}>
						{/* Row 1: Hospital Name + Phone Number */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								label="Enter hospital name"
								value={form.name}
								placeholder="e.g. Arogya Clinic"
								onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
								size="small"
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								label="Phone number"
								value={form.phone_number}
								placeholder="+91 00000 00000"
								onChange={(e) => setForm((prev) => ({ ...prev, phone_number: e.target.value }))}
								size="small"
							/>
						</Grid>
						{/* Row 2: Full Address */}
						<Grid size={{ xs: 12 }}>
							<AppInput
								label="Enter Full address"
								value={form.fullAddress}
								placeholder="Enter complete hospital address..."
								multiline
								rows={2}
								onChange={(e) => setForm((prev) => ({ ...prev, fullAddress: e.target.value }))}
								size="small"
							/>
						</Grid>
						{/* Row 3: Video Fee + Clinic Fee */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								label="Video consultation fee"
								value={form.video_consultation_fee}
								placeholder="e.g. 500"
								onChange={(e) =>
									setForm((prev) => ({ ...prev, video_consultation_fee: e.target.value }))
								}
								size="small"
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								label="Clinic consultation fee"
								value={form.offline_consultation_fee}
								placeholder="e.g. 500"
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										offline_consultation_fee: e.target.value,
									}))
								}
								size="small"
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
								Free Follow-up Validity
							</Typography>
							<AppSelect
								value={followUpDays}
								onChange={(e) => setFollowUpDays(Number(e.target.value))}
								size="small"
								options={[
									{ value: 0, label: 'No Follow-up' },
									{ value: 3, label: '3 Days' },
									{ value: 5, label: '5 Days' },
									{ value: 7, label: '7 Days' },
									{ value: 10, label: '10 Days' },
									{ value: 15, label: '15 Days' },
								]}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
								Reschedule Allowed Until
							</Typography>
							<AppSelect
								value={rescheduleCutoff}
								onChange={(e) => setRescheduleCutoff(Number(e.target.value))}
								size="small"
								options={[
									{ value: 1, label: '1 Hour' },
									{ value: 2, label: '2 Hours' },
									{ value: 3, label: '3 Hours' },
									{ value: 4, label: '4 Hours' },
									{ value: 6, label: '6 Hours' },
									{ value: 12, label: '12 Hours' },
									{ value: 24, label: '1 Day' },
								]}
							/>
						</Grid>
					</Grid>
				</Box>

				{/* Cancel / Save the hospital's details. The weekly working hours are set in the Availability tab. */}
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
					<AppButton
						variant="outlined"
						onClick={() => {
							setShowForm(false)
							resetFormState()
						}}
						label="Cancel"
					/>

					<AppButton variant="contained" onClick={handleSave} loading={isSaving} label="Save" />
				</Box>
			</Box>
		)
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
			{/* Hospital Tab Top Toolbar */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					gap: 1.5,
				}}
			>
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.2 }}>
						<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', fontSize: '20px' }}>
							My Hospital
						</Typography>
						<Box
							sx={{
								px: 1,
								py: 0.2,
								bgcolor: 'rgba(43, 111, 113, 0.08)',
								color: '#2B6F71',
								borderRadius: '12px',
								fontSize: '11px',
								fontWeight: 700,
							}}
						>
							{hospitals.length} Clinics
						</Box>
					</Box>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>
						Manage locations, consulting fees, working sessions, and booking specifications.
					</Typography>
				</Box>
				<AppButton
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => {
						resetFormState()
						setShowForm(true)
					}}
					label="Add new hospital"
					size="small"
					sx={{
						bgcolor: '#2B6F71',
						fontWeight: 700,
						'&:hover': {
							bgcolor: '#1D4D4F',
						}
					}}
				/>
			</Box>

			{/* Empty State Redesign */}
			{hospitals.length === 0 ? (
				<Box
					sx={{
						...customCardStyle,
						py: 6,
						px: 3,
						textAlign: 'center',
						borderRadius: '12px',
						border: '1px dashed #CBD5E1',
						bgcolor: 'rgba(248, 250, 252, 0.5)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 1.5,
					}}
				>
					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: '50%',
							bgcolor: 'rgba(43, 111, 113, 0.05)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#2B6F71',
							mb: 0.5,
						}}
					>
						<HomeOutlinedIcon sx={{ fontSize: 24 }} />
					</Box>
					<Box>
						<Typography variant="body1" sx={{ fontWeight: 800, color: '#1A4345', mb: 0.2 }}>
							No Clinics Registered
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 320, mx: 'auto', display: 'block', lineHeight: 1.5 }}>
							You haven't added any clinics or hospitals to your profile yet. Add a location to start receiving patient appointments.
						</Typography>
					</Box>
					<AppButton
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={() => {
							resetFormState()
							setShowForm(true)
						}}
						label="Register first location"
						size="small"
						sx={{
							borderColor: '#2B6F71',
							color: '#2B6F71',
							fontWeight: 700,
							mt: 0.5,
							'&:hover': {
								borderColor: '#1D4D4F',
								bgcolor: 'rgba(43, 111, 113, 0.04)',
							}
						}}
					/>
				</Box>
			) : (
				/* Hospital Cards Loop */
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{hospitals.map((hospital) => {
						const addressText = getHospitalAddressText(hospital)

						return (
							<Box
								key={hospital.id}
								sx={{
									display: 'flex',
									flexDirection: { xs: 'column', md: 'row' },
									alignItems: { xs: 'stretch', md: 'center' },
									gap: 1.5,
									border: '1px solid',
									borderColor: hospital.isPrimary ? '#2B6F71' : '#E2E8F0',
									borderLeft: '4px solid',
									borderLeftColor: hospital.isPrimary ? '#2B6F71' : '#94A3B8',
									borderRadius: '12px',
									p: 2,
									bgcolor: hospital.isPrimary ? 'rgba(43, 111, 113, 0.01)' : 'background.paper',
									boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
									transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
									position: 'relative',
									'&:hover': {
										transform: 'translateY(-1px)',
										boxShadow: '0 4px 16px rgba(43, 111, 113, 0.06)',
										borderColor: '#2B6F71',
									}
								}}
							>
								{/* Left Side: Hospital Details Info Group */}
								<Box sx={{ display: 'flex', gap: 2, flex: 1, alignItems: 'flex-start' }}>
									<Box
										sx={{
											width: 36,
											height: 36,
											borderRadius: '8px',
											bgcolor: hospital.isPrimary ? 'rgba(43, 111, 113, 0.08)' : '#F1F5F9',
											color: hospital.isPrimary ? '#2B6F71' : '#64748B',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0,
										}}
									>
										<HomeOutlinedIcon sx={{ fontSize: 18 }} />
									</Box>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, flex: 1 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
											<Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '14px' }}>
												{hospital.name}
											</Typography>
											{hospital.isPrimary && (
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														gap: 0.3,
														px: 0.8,
														py: 0.1,
														bgcolor: '#E6F4F1',
														color: '#2B6F71',
														borderRadius: '8px',
														fontSize: '10px',
														fontWeight: 800,
													}}
												>
													<CheckIcon sx={{ fontSize: 8, fontWeight: 900 }} />
													Primary
												</Box>
											)}
										</Box>
										<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, color: 'text.secondary', mt: 0.2 }}>
											<LocationOnOutlinedIcon sx={{ fontSize: 14, color: '#64748B', mt: 0.1 }} />
											<Typography variant="caption" sx={{ fontSize: '11.5px', lineHeight: 1.3, color: '#475569' }}>
												{addressText}
											</Typography>
										</Box>
										{hospital.phone_number && (
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
												<PhoneOutlinedIcon sx={{ fontSize: 13, color: '#64748B' }} />
												<Typography variant="caption" sx={{ fontSize: '11.5px', color: '#475569', fontWeight: 500 }}>
													{hospital.phone_number}
												</Typography>
											</Box>
										)}
									</Box>
								</Box>

								{/* Right Side: Options & Status Actions */}
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-end', mt: { xs: 1, md: 0 } }}>
									{/* Set Primary Button Widget */}
									{!hospital.isPrimary ? (
										<Box
											onClick={() => handleSetPrimary(hospital.id)}
											sx={{
												display: 'inline-flex',
												alignItems: 'center',
												gap: 0.8,
												px: 1.2,
												py: 0.6,
												cursor: 'pointer',
												transition: 'all 0.2s',
												'&:hover': {
													borderColor: '#2B6F71',
													bgcolor: 'rgba(43, 111, 113, 0.02)',
												}
											}}
										>
											<Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.secondary' }}>
												Set as Primary
											</Typography>
											<Radio
												checked={hospital.isPrimary}
												size="small"
												sx={{
													p: 0,
													color: 'text.disabled',
													'&.Mui-checked': { color: '#2B6F71' }
												}}
											/>
										</Box>
									) : (
										/* Blank placeholder on desktop so cards keep width symmetry */
										<Box sx={{ display: { xs: 'none', md: 'block' }, width: 110 }} />
									)}

									{/* Options Vertical Ellipsis Button */}
									<IconButton
										onClick={(e) => handleOpenMenu(e, hospital.id)}
										sx={{
											border: '1px solid #E2E8F0',
											borderRadius: '8px',
											p: 0.6,
											color: 'text.secondary',
											transition: 'all 0.2s',
											'&:hover': {
												borderColor: '#2B6F71',
												color: '#2B6F71',
												bgcolor: 'rgba(43, 111, 113, 0.04)',
											}
										}}
									>
										<MoreVertIcon sx={{ fontSize: 16 }} />
									</IconButton>
								</Box>
							</Box>
						)
					})}
				</Box>
			)}

			{/* Context menu for each hospital */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleCloseMenu}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				PaperProps={{
					elevation: 2,
					sx: {
						mt: 0.5,
						minWidth: 130,
						borderRadius: '8px',
						border: '1px solid #E2E8F0',
						boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
						p: 0.3,
					},
				}}
			>
				<MuiMenuItem
					onClick={() => menuHospitalId && handleEdit(menuHospitalId)}
					sx={{
						fontSize: '12.5px',
						fontWeight: 600,
						py: 0.8,
						px: 1.5,
						borderRadius: '6px',
						'&:hover': { bgcolor: 'rgba(43, 111, 113, 0.05)', color: '#2B6F71' },
					}}
				>
					Edit
				</MuiMenuItem>
				<MuiMenuItem
					onClick={handleCloseMenu}
					sx={{
						fontSize: '12.5px',
						fontWeight: 600,
						py: 0.8,
						px: 1.5,
						borderRadius: '6px',
						color: 'error.main',
						'&:hover': { bgcolor: '#FEE2E2' },
					}}
				>
					Deactivate
				</MuiMenuItem>
			</Menu>
		</Box>
	)
}
