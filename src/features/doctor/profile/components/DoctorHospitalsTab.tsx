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
import { DoctorHospital } from '../../../../types/doctor-profile'
import { createHospital } from '../../doctorService'

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

export default function DoctorHospitalsTab({ hospitals, onChange }: DoctorHospitalsTabProps) {
	const [showForm, setShowForm] = useState(false)
	const [form, setForm] = useState(EMPTY_FORM)
	const [isSaving, setIsSaving] = useState(false)

	const handleSetPrimary = (id: string) => {
		onChange(hospitals.map((h) => ({ ...h, isPrimary: h.id === id })))
	}

	const handleSave = async () => {
  	const trimmedName = form.name.trim();
  	const trimmedAddress = form.fullAddress.trim();
  	const isPrimary = hospitals.length === 0;

 	 if (!trimmedName) {
   		 toast.error("Hospital name is required");
    return;
  	}

  	if (!trimmedAddress) {
    	toast.error("Full address is required");
    return;
  	}

  	setIsSaving(true);

  	try {
    	const response = await createHospital({
      		name: trimmedName,
      		phone_number: form.phone_number.trim(),
      		full_address: trimmedAddress,
      		is_primary: isPrimary,
      		video_consultation_fee: form.video_consultation_fee.trim(),
      		offline_consultation_fee: form.offline_consultation_fee.trim(),
    	});

    toast.success(getSuccessMessage(response));
    window.location.reload();

  	} catch (error) {
    	console.error("Failed to save hospital", error);
    	toast.error("Failed to save hospital");
  	} finally {
    	setIsSaving(false);
  	}
	};
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
						Add new address
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
						onChange={(e) =>
							setForm((prev) => ({ ...prev, video_consultation_fee: e.target.value }))
						}
					/>
					<AppInput
						label="Offline consultation fee"
						value={form.offline_consultation_fee}
						placeholder="e.g. 300"
						onChange={(e) =>
							setForm((prev) => ({ ...prev, offline_consultation_fee: e.target.value }))
						}
					/>
				</Box>

				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
					<AppButton variant="contained" onClick={handleSave} loading={isSaving} label="Save Address" />
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
