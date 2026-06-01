import { useEffect, useRef, useState } from 'react'
import { Box, Grid, Typography } from '@mui/material'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import AppInput from '../../../components/common/Input/AppInput'
import ProfileFormActions from '../../../components/common/ProfileFormActions/ProfileFormActions'
import { customCardStyle } from '../../../styles/commonStyles'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { updateMyPharmacyDetails } from '../pharmacyService'

export interface PharmacyProfileProfessional {
	pharmacyName: string
	drugLicenseNumber: string
	drugLicenseProof: string
	gstNumber: string
	gstCertificateProof: string
}

interface PharmacyProfessionalTabProps {
	data: PharmacyProfileProfessional
	onChange: (updated: Partial<PharmacyProfileProfessional>) => void
}

function UploadBox({
	label,
	fileName,
	onChange,
}: {
	label: string
	fileName?: string
	onChange?: (file: File) => void
}) {
	const ref = useRef<HTMLInputElement>(null)

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
					{fileName ? `Selected: ${fileName}` : 'Upload image or PDF'}
				</Typography>
			</Box>

			<Box
				onClick={() => ref.current?.click()}
				sx={{
					flexShrink: 0,
					width: 80,
					height: 80,
					border: '1.5px dashed',
					borderColor: 'divider',
					borderRadius: '10px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
					bgcolor: 'rgba(43,111,113,0.03)',
					'&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(43,111,113,0.06)' },
					transition: 'all 0.15s',
				}}
			>
				<CloudUploadOutlinedIcon sx={{ fontSize: 26, color: 'primary.main', mb: 0.5 }} />
				<Typography variant="caption" sx={{ color: 'primary.main', fontSize: '11px', fontWeight: 600 }}>
					Upload
				</Typography>
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
			const payload: Record<string, string> = {}

			if (data.pharmacyName !== saved.pharmacyName) {
				payload.name = data.pharmacyName
			}

			if (data.drugLicenseNumber !== saved.drugLicenseNumber) {
				payload.drug_license_number = data.drugLicenseNumber
			}

			if (data.drugLicenseProof !== saved.drugLicenseProof) {
				payload.drug_license_s3_key = data.drugLicenseProof
			}

			if (data.gstNumber !== saved.gstNumber) {
				payload.gst_number = data.gstNumber
			}

			if (data.gstCertificateProof !== saved.gstCertificateProof) {
				payload.gst_certificate_s3_key = data.gstCertificateProof
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
				<AppInput
					label="Pharmacy Name *"
					value={data.pharmacyName}
					placeholder="Enter pharmacy name"
					onChange={(e) => onChange({ pharmacyName: e.target.value })}
				/>

				<Grid container spacing={2} alignItems="flex-end">
					<Grid size={{ xs: 12, sm: 8 }}>
						<AppInput
							label="Drug Licence Number *"
							value={data.drugLicenseNumber}
							placeholder="Enter drug licence number"
							onChange={(e) => onChange({ drugLicenseNumber: e.target.value })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 4 }}>
						<UploadBox
							label="Drug Licence Proof"
							fileName={data.drugLicenseProof}
							onChange={(file) => onChange({ drugLicenseProof: file.name })}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2} alignItems="flex-end">
					<Grid size={{ xs: 12, sm: 8 }}>
						<AppInput
							label="GST Number *"
							value={data.gstNumber}
							placeholder="Enter GST number"
							onChange={(e) => onChange({ gstNumber: e.target.value })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 4 }}>
						<UploadBox
							label="GST Certificate"
							fileName={data.gstCertificateProof}
							onChange={(file) => onChange({ gstCertificateProof: file.name })}
						/>
					</Grid>
				</Grid>
			</Box>

			<ProfileFormActions
				isDirty={isDirty}
				showSuccess={false}
				onSave={handleSave}
				onCloseSnackbar={() => {}}
			/>
		</Box>
	)
}
