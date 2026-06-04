import { useEffect, useRef, useState } from 'react'
import { Box, Grid, Typography, Divider } from '@mui/material'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import AppInput from '../../../components/common/Input/AppInput'
import ProfileFormActions from '../../../components/common/ProfileFormActions/ProfileFormActions'
import { customCardStyle } from '../../../styles/commonStyles'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { updateMyPharmacyDetails } from '../pharmacyService'

export interface PharmacyProfileProfessional {
	pharmacyName: string
	logo: string
	drugLicenseNumber: string
	drugLicenseProof: string
	gstNumber: string
	gstCertificateProof: string
	address: string
	city: string
	state: string
	pincode: string
	landmark: string
	latitude: string
	longitude: string
}

interface PharmacyProfessionalTabProps {
	data: PharmacyProfileProfessional
	onChange: (updated: Partial<PharmacyProfileProfessional>) => void
}

function UploadBox({
	label,
	fileName,
	onChange,
	isImagePreview = false,
}: {
	label: string
	fileName?: string
	onChange?: (file: File) => void
	isImagePreview?: boolean
}) {
	const ref = useRef<HTMLInputElement>(null)
	const [imageError, setImageError] = useState(false)

	useEffect(() => {
		setImageError(false)
	}, [fileName])

	const showPreview = isImagePreview && fileName && !imageError

	return (
		// <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
		<Box
			sx={{
				display: 'flex',
				alignItems: 'flex-start',
				gap: 2,
				minHeight: 80,
			}}
		>
			<Box sx={{ flex: 1 }}>
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 500, display: 'block' }}
				>
					{label}
				</Typography>
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary', fontSize: '11.5px', display: 'block', lineHeight: 1.5 }}
				>
					{fileName
						? (showPreview ? '' : `Selected: ${fileName.split('/').pop()?.split('\\').pop()}`)
						: 'Upload image or PDF'}
				</Typography>
			</Box>

			<Box
				onClick={() => ref.current?.click()}
				sx={{
					flexShrink: 0,
					width: 80,
					height: 80,
					border: showPreview ? '1px solid' : '1.5px dashed',
					borderColor: showPreview ? 'primary.main' : 'divider',
					borderRadius: '10px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
					bgcolor: 'rgba(43,111,113,0.03)',
					overflow: 'hidden',
					position: 'relative',
					'&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(43,111,113,0.06)' },
					transition: 'all 0.15s',
				}}
			>
				{showPreview ? (
					<Box
						component="img"
						src={fileName}
						alt={label}
						onError={() => setImageError(true)}
						sx={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
					/>
				) : (
					<>
						<CloudUploadOutlinedIcon sx={{ fontSize: 26, color: 'primary.main', mb: 0.5 }} />
						<Typography variant="caption" sx={{ color: 'primary.main', fontSize: '11px', fontWeight: 600 }}>
							Upload
						</Typography>
					</>
				)}
				<input
					ref={ref}
					type="file"
					accept="image/*,.pdf"
					hidden
					onChange={(e) => {
						const file = e.target.files?.[0]
						if (file) onChange?.(file)
					}}
				/>
			</Box>
		</Box>
	)
}

export default function PharmacyProfessionalTab({ data, onChange }: PharmacyProfessionalTabProps) {
	const [isDirty, setIsDirty] = useState(false)
	const [saved, setSaved] = useState(data)

	useEffect(() => {
		setIsDirty(JSON.stringify(data) !== JSON.stringify(saved))
	}, [data, saved])

	const handleSave = async () => {
		try {
			const payload: Record<string, unknown> = {}

			if (data.pharmacyName !== saved.pharmacyName) {
				payload.name = data.pharmacyName
			}

			if (data.drugLicenseNumber !== saved.drugLicenseNumber) {
				payload.drug_license_number = data.drugLicenseNumber
			}

			if (data.gstNumber !== saved.gstNumber) {
				payload.gst_number = data.gstNumber
			}

			if (data.address !== saved.address) {
				payload.address = data.address
			}

			if (data.city !== saved.city) {
				payload.city = data.city
			}

			if (data.state !== saved.state) {
				payload.state = data.state
			}

			if (data.pincode !== saved.pincode) {
				payload.pincode = data.pincode
			}

			if (data.landmark !== saved.landmark) {
				payload.landmark = data.landmark
			}

			if (data.latitude !== saved.latitude) {
				const lat = parseFloat(data.latitude)
				payload.latitude = isNaN(lat) ? null : lat
			}

			if (data.longitude !== saved.longitude) {
				const lon = parseFloat(data.longitude)
				payload.longitude = isNaN(lon) ? null : lon
			}

			if (Object.keys(payload).length === 0) {
				toast.info('No professional changes to save.')
				return
			}

			await updateMyPharmacyDetails(payload)

			setSaved(data)
			toast.success('Professional details saved successfully!')
		} catch {
			toast.error('Something went wrong. Please try again.')
		}
	}

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Professional Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					{/* Pharmacy Identity */}
					<Box>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 700,
								fontSize: '16px',
								color: 'text.primary',
								mb: 2,
							}}
						>
							Pharmacy Identity
						</Typography>

						<Grid container spacing={2.5} alignItems="flex-start">
							<Grid size={{ xs: 12, md: 8 }}>
								<AppInput
									label="Pharmacy Name *"
									value={data.pharmacyName}
									placeholder="Enter pharmacy name"
									onChange={(e) => onChange({ pharmacyName: e.target.value })}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 4 }}>
								<UploadBox
									label="Pharmacy Logo"
									fileName={data.logo}
									isImagePreview={true}
									onChange={(file) =>
										onChange({
											logo: URL.createObjectURL(file),
										})
									}
								/>
							</Grid>
						</Grid>
					</Box>

					<Divider />

					{/* Regulatory & Tax Information */}
					<Box>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 700,
								fontSize: '16px',
								color: 'text.primary',
								mb: 2,
							}}
						>
							Regulatory & Tax Information
						</Typography>

						<Grid container spacing={2.5} alignItems="flex-start">
							<Grid size={{ xs: 12, md: 8 }}>
								<AppInput
									label="Drug Licence Number *"
									value={data.drugLicenseNumber}
									placeholder="Enter drug licence number"
									onChange={(e) =>
										onChange({
											drugLicenseNumber: e.target.value,
										})
									}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 4 }}>
								<UploadBox
									label="Drug Licence Proof"
									fileName={data.drugLicenseProof}
									onChange={(file) =>
										onChange({
											drugLicenseProof: file.name,
										})
									}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 8 }}>
								<AppInput
									label="GST Number *"
									value={data.gstNumber}
									placeholder="Enter GST number"
									onChange={(e) =>
										onChange({
											gstNumber: e.target.value,
										})
									}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 4 }}>
								<UploadBox
									label="GST Certificate"
									fileName={data.gstCertificateProof}
									onChange={(file) =>
										onChange({
											gstCertificateProof: file.name,
										})
									}
								/>
							</Grid>
						</Grid>
					</Box>

					<Divider />

					{/* Address Details */}
					<Box>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 700,
								fontSize: '16px',
								color: 'text.primary',
								mb: 2,
							}}
						>
							Address Details
						</Typography>

						<Grid container spacing={2.5}>
							<Grid size={{ xs: 12 }}>
								<AppInput
									label="Street Address *"
									value={data.address}
									placeholder="Enter street address"
									onChange={(e) =>
										onChange({
											address: e.target.value,
										})
									}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Landmark"
									value={data.landmark}
									placeholder="Enter landmark"
									onChange={(e) =>
										onChange({
											landmark: e.target.value,
										})
									}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Pincode *"
									value={data.pincode}
									placeholder="Enter pincode"
									onChange={(e) =>
										onChange({
											pincode: e.target.value,
										})
									}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="City *"
									value={data.city}
									placeholder="Enter city"
									onChange={(e) =>
										onChange({
											city: e.target.value,
										})
									}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="State *"
									value={data.state}
									placeholder="Enter state"
									onChange={(e) =>
										onChange({
											state: e.target.value,
										})
									}
								/>
							</Grid>
						</Grid>
					</Box>

					<Divider />

					{/* Location Coordinates */}
					{/* <Box>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 700,
								fontSize: '16px',
								color: 'text.primary',
								mb: 2,
							}}
						>
							Location Coordinates
						</Typography>

						<Grid container spacing={2.5}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Latitude"
									value={data.latitude}
									placeholder="19.0760"
									onChange={(e) =>
										onChange({
											latitude: e.target.value,
										})
									}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Longitude"
									value={data.longitude}
									placeholder="72.8777"
									onChange={(e) =>
										onChange({
											longitude: e.target.value,
										})
									}
								/>
							</Grid>
						</Grid>
					</Box> */}
				</Box>
			</Box>

			<ProfileFormActions
				isDirty={isDirty}
				showSuccess={false}
				onSave={handleSave}
				onCloseSnackbar={() => { }}
			/>
		</Box>
	)
}
