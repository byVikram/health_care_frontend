// src/features/doctor/profile/components/DoctorProfessionalTab.tsx
import { useState, useEffect, useRef } from 'react'
import ProfileFormActions from '../../../../components/common/ProfileFormActions/ProfileFormActions'
import { Box, Typography, Grid, Divider, Button, IconButton } from '@mui/material'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import AppInput from '../../../../components/common/Input/AppInput'
import AppSelect from '../../../../components/common/Select/AppSelect'
import { DoctorProfileProfessional, DoctorDegree } from '../../../../types/doctor-profile'
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

const EXPERIENCE_OPTIONS = Array.from({ length: 30 }, (_, i) => ({
	value: String(i + 1),
	label: `${i + 1} ${i + 1 === 1 ? 'year' : 'years'}`,
}))

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
	fileName,
	onChange,
}: {
	label: string
	required?: boolean
	description?: string
	/** The file picked now, or the one already stored: a key or a signed link, shown as its file name. */
	fileName?: string
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
						<Box component="span" sx={{ color: 'text.secondary', ml: 0.3 }}>
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
				{fileName && (
					<Typography
						variant="caption"
						sx={{ color: 'primary.main', fontSize: '11.5px', display: 'block', wordBreak: 'break-all' }}
					>
						{fileName.split('?')[0].split('/').pop()}
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

	const handleDegreeFieldChange = (index: number, updatedField: Partial<DoctorDegree>) => {
		const currentDegrees = [...(data.degrees || [])]
		currentDegrees[index] = { ...currentDegrees[index], ...updatedField }
		onChange({ degrees: currentDegrees })
	}

	const handleAddDegree = () => {
		const newDegree: DoctorDegree = {
			degree: '',
			specialization: '',
			college: '',
			yearOfPassing: '',
			qualificationProof: '',
		}
		onChange({ degrees: [...(data.degrees || []), newDegree] })
	}

	const handleRemoveDegree = (index: number) => {
		const currentDegrees = (data.degrees || []).filter((_, idx) => idx !== index)
		onChange({ degrees: currentDegrees })
	}

	const handleSave = async () => {
		// Validation
		const degrees = data.degrees || []
		if (degrees.length === 0) {
			toast.error('Please add at least one educational qualification.')
			return
		}

		for (let i = 0; i < degrees.length; i++) {
			const deg = degrees[i]
			if (!deg.degree) {
				toast.error(`Please select a degree for qualification #${i + 1}`)
				return
			}
			if (!deg.college) {
				toast.error(`Please select or enter college for qualification #${i + 1}`)
				return
			}
			if (!deg.yearOfPassing) {
				toast.error(`Please enter the passing year for qualification #${i + 1}`)
				return
			}
		}

		if (!data.registrationNumber) {
			toast.error('Registration number is required.')
			return
		}

		try {
			const payload: Record<string, unknown> = {
				experience_years: data.experience ? Number(data.experience) : undefined,
				registration_number: data.registrationNumber,
				about: data.about,
				// (a proof is never sent as text: a picked file goes in the same request, see below)
				specialities: [data.specialization_id],
				degrees: degrees.map((d) => ({
					degree: d.degree,
					specialization: d.specialization || null,
					college: d.college,
					year_of_passing: d.yearOfPassing,
					id: d.id, // keeps the degree, and its saved certificate, when no new file is picked
				})),
			}

			await updateProfessionalDetails(payload, {
				degreeCertificates: degrees.map((d) => d.qualificationFile),
				registrationProof: data.registrationFile,
			})

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
	const degrees = data.degrees || []

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Professional Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				{/* Specialization */}
				<Box>
					<SectionTitle>Select specialization</SectionTitle>
					{/* <AppSelect
						label=""
						value={data.specialization_id || ''}
						options={specialities}
						placeholder="Select your specialization"
						onChange={(e) => onChange({ specialization_id: e.target.value as string })}
					/> */}
					<AppSelect
						label=""
						value={data.specialization_id || ''}
						options={specialities}
						placeholder="Select your specialization"
						onChange={(e) => {
							const selected = specialities.find((s) => s.value === e.target.value)

							onChange({
								specialization_id: selected?.value || '',
								specialization_label: selected?.label || '',
							})
						}}
					/>
				</Box>

				<Divider />

				{/* Experience */}
				<Box>
					<SectionTitle>Years of experience</SectionTitle>
					<AppSelect
						label=""
						value={data.experience || ''}
						options={EXPERIENCE_OPTIONS}
						placeholder="Select years of experience"
						onChange={(e) => onChange({ experience: e.target.value as string })}
					/>
				</Box>

				<Divider />

				{/* Educational qualifications list */}
				<Box>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
						<SectionTitle>Educational qualifications and proofs</SectionTitle>
						<Button
							variant="outlined"
							color="primary"
							startIcon={<AddIcon />}
							onClick={handleAddDegree}
							sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
						>
							Add Qualification
						</Button>
					</Box>

					{degrees.length === 0 ? (
						<Box
							sx={{
								border: '1px dashed',
								borderColor: 'divider',
								borderRadius: '8px',
								p: 3,
								textAlign: 'center',
								bgcolor: 'background.paper',
							}}
						>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
								No qualifications added yet.
							</Typography>
							<Button variant="text" startIcon={<AddIcon />} onClick={handleAddDegree}>
								Add your first degree
							</Button>
						</Box>
					) : (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
							{degrees.map((deg, index) => (
								<Box
									key={index}
									sx={{
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: '12px',
										p: 3,
										position: 'relative',
										bgcolor: 'background.paper',
										boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
									}}
								>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											mb: 2,
										}}
									>
										<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
											Qualification #{index + 1}
										</Typography>
										{degrees.length > 1 && (
											<IconButton
												size="small"
												color="error"
												onClick={() => handleRemoveDegree(index)}
												sx={{
													p: 0,
													'&:hover': {
														backgroundColor: 'transparent',
													},
												}}
											>
												<DeleteOutlineIcon fontSize="small" />
											</IconButton>
										)}
									</Box>

									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
										<Grid container spacing={2}>
											<Grid size={{ xs: 12, sm: 6 }}>
												<AppSelect
													label="Select Degree *"
													value={deg.degree || ''}
													options={DEGREE_OPTIONS}
													onChange={(e) =>
														handleDegreeFieldChange(index, {
															degree: e.target.value as string,
														})
													}
												/>
											</Grid>
											<Grid size={{ xs: 12, sm: 6 }}>
												<AppInput
													label="Specialization / Field (Optional)"
													value={deg.specialization || ''}
													placeholder="e.g. Cardiology, Pediatrics"
													onChange={(e) =>
														handleDegreeFieldChange(index, {
															specialization: e.target.value,
														})
													}
												/>
											</Grid>
										</Grid>

										<Grid container spacing={2}>
											<Grid size={{ xs: 12, sm: 8 }}>
												<AppSelect
													label="Select College/University *"
													value={deg.college || ''}
													options={COLLEGE_OPTIONS}
													placeholder="Select college or university"
													onChange={(e) =>
														handleDegreeFieldChange(index, {
															college: e.target.value as string,
														})
													}
												/>
											</Grid>
											<Grid size={{ xs: 12, sm: 4 }}>
												<AppInput
													label="Year of Passing *"
													value={deg.yearOfPassing || ''}
													placeholder="YYYY"
													onChange={(e) =>
														handleDegreeFieldChange(index, {
															yearOfPassing: e.target.value,
														})
													}
												/>
											</Grid>
										</Grid>

										<UploadBox
											label="Upload image or PDF of Qualification proofs"
											required
											description="Submit council registration proof or passing certificate."
											fileName={deg.qualificationProof}
											onChange={(file) =>
												handleDegreeFieldChange(index, {
													qualificationProof: file.name,
													qualificationFile: file,
												})
											}
										/>
									</Box>
								</Box>
							))}
						</Box>
					)}
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
								<UploadBox
										label=""
										fileName={data.registrationProof}
										onChange={(file) => onChange({ registrationProof: file.name, registrationFile: file })}
									/>
							</Grid>
						</Grid>
						<AppInput
							label="About / Bio"
							value={data.about}
							placeholder="Write a short bio about yourself"
							onChange={(e) => onChange({ about: e.target.value })}
						/>
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
