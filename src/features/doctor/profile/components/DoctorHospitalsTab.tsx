// src/features/doctor/profile/components/DoctorHospitalsTab.tsx
import { useState } from 'react'
import { customCardStyle } from '../../../../styles/commonStyles'
import { Box, Typography, IconButton, Radio } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import AppButton from '../../../../components/common/Button/AppButton'
import AppInput from '../../../../components/common/Input/AppInput'
import { DoctorHospital } from '../../../../types/doctor-profile'

interface DoctorHospitalsTabProps {
	hospitals: DoctorHospital[]
	onChange: (hospitals: DoctorHospital[]) => void
}

const EMPTY_FORM = { name: '', location: '', fullAddress: '' }

export default function DoctorHospitalsTab({ hospitals, onChange }: DoctorHospitalsTabProps) {
	const [showForm, setShowForm] = useState(false)
	const [form, setForm] = useState(EMPTY_FORM)

	const handleSetPrimary = (id: string) => {
		onChange(hospitals.map((h) => ({ ...h, isPrimary: h.id === id })))
	}

	const handleSave = () => {
		if (!form.name.trim()) return
		const newHospital: DoctorHospital = {
			id: Date.now().toString(),
			name: form.name,
			location: form.location,
			fullAddress: form.fullAddress,
			isPrimary: hospitals.length === 0,
		}
		onChange([...hospitals, newHospital])
		setForm(EMPTY_FORM)
		setShowForm(false)
	}

	// -- Add new address form ------------------------------------------
	if (showForm) {
		return (
			<Box sx={{ ...customCardStyle }}>
				{/* Header */}
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
						Add new address
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					<AppInput
						label="Enter hospital name"
						value={form.name}
						placeholder="e.g. Arogya Clinic"
						onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
					/>
					<AppInput
						label="Location"
						value={form.location}
						placeholder="e.g. KR Market, Bengaluru"
						onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
					/>
					<AppInput
						label="Enter Full address"
						value={form.fullAddress}
						placeholder="Enter complete address"
						multiline
						rows={3}
						onChange={(e) => setForm((p) => ({ ...p, fullAddress: e.target.value }))}
					/>
				</Box>

				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
					<AppButton
						variant="contained"
						onClick={handleSave}
						// sx={{ px: 4, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
						label="Save Address"
					/>
				</Box>
			</Box>
		)
	}

	// -- Hospital list -------------------------------------------------
	return (
		<Box sx={{ ...customCardStyle }}>
			{/* Header */}
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

			{/* Hospital cards */}
			{hospitals.length === 0 ? (
				<Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
					<HomeOutlinedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
					<Typography variant="body2">No hospitals added yet</Typography>
				</Box>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					{hospitals.map((hospital, index) => (
						<Box key={hospital.id}>
							{/* Address label */}
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

							{/* Card row */}
							<Box sx={{ display: 'flex', gap: 1 }}>
								{/* Main card */}
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
												{hospital.fullAddress}
												{hospital.location && ` ${hospital.location}`}
											</Typography>
										</Box>
									</Box>
								</Box>

								{/* Set as Primary */}
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

								{/* More options */}
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
