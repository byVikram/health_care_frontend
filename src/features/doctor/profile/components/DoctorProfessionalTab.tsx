// src/features/doctor/profile/components/DoctorProfessionalTab.tsx
import { useState, useEffect } from 'react'
import ProfileFormActions from '../../../../components/common/ProfileFormActions/ProfileFormActions'
import { useRef } from 'react'
import { Box, Typography, Grid, Divider } from '@mui/material'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import AppInput from '../../../../components/common/Input/AppInput'
import AppSelect from '../../../../components/common/Select/AppSelect'
import { DoctorProfileProfessional } from '../../../../types/doctor-profile'
import { customCardStyle } from '../../../../styles/commonStyles'
import { getSpecialities, updateProfessionalDetails } from '../../doctorService'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface DoctorProfessionalTabProps {
	data: DoctorProfileProfessional
	onChange: (updated: Partial<DoctorProfileProfessional>) => void
	onSaveSuccess?: () => void
}

const DEGREE_OPTIONS = ['MBBS', 'MD', 'MS', 'BDS', 'MDS', 'BAMS', 'BHMS', 'BPT', 'DNB'].map((d) => ({
	value: d.toLowerCase(),
	label: d,
}))

const COLLEGE_OPTIONS = [
	{ value: 'kms', label: 'Karnataka Medical Science (KMS)' },
	{ value: 'aiims', label: 'AIIMS' },
	{ value: 'afmc', label: 'Armed Forces Medical College' },
	{ value: 'jipmer', label: 'JIPMER' },
	{ value: 'mmc', label: 'Madras Medical College' },
	{ value: 'other', label: 'Other' },
]

type SpecialityId = {
	id: string
	label: string
}

type SpecialityValue = {
	value: string
	label: string
}

function UploadBox({
	label,
	required,
	description,
	onChange,
}: {
	label: string
	required?: boolean
	description?: string
	onChange?: (f: File) => void
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
					{required && (
						<Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>
							*
						</Box>
					)}
				</Typography>
				{description && (
					<Typography
						variant="caption"
						sx={{ color: 'text.secondary', fontSize: '11.5px', display: 'block', lineHeight: 1.5 }}
					>
						{description}
					</Typography>
				)}
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
						const f = e.target.files?.[0]
						if (f) onChange?.(f)
					}}
				/>
			</Box>
		</Box>
	)
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary', mb: 2 }}>
			{children}
		</Typography>
	)
}

export default function DoctorProfessionalTab({ data, onChange, onSaveSuccess }: DoctorProfessionalTabProps) {
	const [isDirty, setIsDirty] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
	const [saved, setSaved] = useState(data)
	const [specialities, setSpecialities] = useState<SpecialityValue[]>([])

	useEffect(() => {
		setIsDirty(JSON.stringify(data) !== JSON.stringify(saved))
	}, [data, saved])

	useEffect(() => {
		const fetchSpecialities = async () => {
			try {
				const res = await getSpecialities()
				const formattedRoles = res.data.map((role: SpecialityId) => ({
					value: role.id,
					label: role.label,
				}))
				setSpecialities(formattedRoles)
			} catch (err) {
				console.log(err)
			}
		}
		fetchSpecialities()
	}, [])

	const handleSave = async () => {
		try {
			const payload: Record<string, unknown> = {}
			if (data.degree) payload.degree = data.degree
			if (data.college) payload.college = data.college
			if (data.yearOfPassing) payload.year_of_passing = data.yearOfPassing
			if (data.registrationNumber) payload.registration_number = data.registrationNumber
			if (data.about) payload.about = data.about
			if (data.qualificationProof) payload.qualification_proof_s3_key = data.qualificationProof
			if (data.registrationProof) payload.registration_proof_s3_key = data.registrationProof

			await updateProfessionalDetails(payload)

			toast.success('Professional details saved successfully!')
			setSaved(data)
			setIsDirty(false)
			setShowSuccess(true)
			onSaveSuccess?.()
		} catch (error) {
			toast.error('Something went wrong. Please try again.')
			console.error(error)
		}
	}

	const selectedLabel = data.specialization_label

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Professional Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				{/* Specialization */}
				<Box>
					<SectionTitle>Select specialization</SectionTitle>
					<AppSelect
						label=""
						value={data.specialization_id || ''}
						options={specialities}
						placeholder="Select your specialization"
						onChange={(e) => onChange({ specialization_id: e.target.value as string })}
					/>
				</Box>

				<Divider />

				{/* Educational qualification */}
				<Box>
					<SectionTitle>Educational qualification and proof</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<AppSelect
							label="Select Degree *"
							value={data.degree || ''}
							options={DEGREE_OPTIONS}
							onChange={(e) => onChange({ degree: e.target.value as string })}
						/>
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppSelect
									label="Select College/University *"
									value={data.college || ''}
									options={COLLEGE_OPTIONS}
									placeholder="Select college or university"
									onChange={(e) => onChange({ college: e.target.value as string })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Select Year *"
									value={data.yearOfPassing}
									placeholder="Enter year of passing"
									onChange={(e) => onChange({ yearOfPassing: e.target.value })}
								/>
							</Grid>
						</Grid>
						<UploadBox
							label="Upload image or PDF of Qualification proofs"
							required
							description="Non allied practitioners should submit council registration proof with mentioned degree name. Allied practitioners should submit mark sheets / passing certificates from UGC approved university."
							onChange={(file) => onChange({ qualificationProof: file.name })}
						/>
					</Box>
				</Box>

				<Divider />

				{/* Registration details */}
				<Box>
					<SectionTitle>Registration details and proofs</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						{data.specialization_label && (
							<Box
								sx={{
									bgcolor: 'rgba(43,111,113,0.07)',
									border: '1px solid',
									borderColor: 'rgba(43,111,113,0.2)',
									borderRadius: '8px',
									px: 2,
									py: 1.5,
								}}
							>
								<Typography variant="caption" sx={{ color: 'primary.dark', fontSize: '12.5px' }}>
									We are asking you for registration details because you have selected{' '}
									<strong>{selectedLabel}</strong> as a speciality
								</Typography>
							</Box>
						)}
						<Grid container spacing={2} alignItems="flex-end">
							<Grid size={{ xs: 12, sm: 8 }}>
								<AppInput
									label="Registration Number *"
									value={data.registrationNumber}
									placeholder="Enter registration number"
									onChange={(e) => onChange({ registrationNumber: e.target.value })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 4 }}>
								<UploadBox label="" onChange={(file) => onChange({ registrationProof: file.name })} />
							</Grid>
						</Grid>
						<AppInput
							label="About / Bio"
							value={data.about}
							placeholder="Write a short bio about yourself"
							onChange={(e) => onChange({ about: e.target.value })}
						/>
						<Grid size={{ xs: 12 }} mt={2} display={'flex'} justifyContent={'flex-end'}></Grid>
					</Box>
				</Box>
			</Box>
			<ProfileFormActions
				isDirty={isDirty}
				showSuccess={showSuccess}
				onSave={handleSave}
				onCloseSnackbar={() => setShowSuccess(false)}
			/>
		</Box>
	)
}
