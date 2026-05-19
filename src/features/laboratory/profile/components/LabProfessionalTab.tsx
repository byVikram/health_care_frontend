// src/features/laboratory/profile/components/LabProfessionalTab.tsx
import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Grid, Divider, Chip, Stack } from '@mui/material'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import AppInput from '../../../../components/common/Input/AppInput'
import AppSelect from '../../../../components/common/Select/AppSelect'
import ProfileFormActions from '../../../../components/common/ProfileFormActions/ProfileFormActions'
import { customCardStyle } from '../../../../styles/commonStyles'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LabProfileProfessional {
	specializationId: string
	specializationLabel: string
	degree: string
	institute: string
	yearOfPassing: string
	qualificationProof: string
	registrationNumber: string
	certificationAuthority: string
	licenseExpiryDate: string
	registrationProof: string
	currentLab: string
	yearsOfExperience: string
	previousOrganization: string
	areaOfExpertise: string
	skills: string[]
	labLicenseProof: string
	trainingCertificateProof: string
	internshipProof: string
	idVerificationProof: string
	about: string
}

interface LabProfessionalTabProps {
	data: LabProfileProfessional
	onChange: (updated: Partial<LabProfileProfessional>) => void
}

// ─── Options ──────────────────────────────────────────────────────────────────

const SPECIALIZATION_OPTIONS = [
	{ value: 'pathology', label: 'Pathology' },
	{ value: 'microbiology', label: 'Microbiology' },
	{ value: 'biochemistry', label: 'Biochemistry' },
	{ value: 'hematology', label: 'Hematology' },
	{ value: 'histopathology', label: 'Histopathology' },
	{ value: 'molecular_diagnostics', label: 'Molecular Diagnostics' },
	{ value: 'clinical_lab_technology', label: 'Clinical Laboratory Technology' },
	{ value: 'radiology_lab', label: 'Radiology Lab' },
	{ value: 'diagnostic_lab', label: 'Diagnostic Lab' },
	{ value: 'blood_bank_technology', label: 'Blood Bank Technology' },
]

const DEGREE_OPTIONS = [
	{ value: 'dmlt', label: 'DMLT' },
	{ value: 'bmlt', label: 'BMLT' },
	{ value: 'mmlt', label: 'MMLT' },
	{ value: 'diploma_lab_tech', label: 'Diploma in Lab Technology' },
	{ value: 'bsc_mlt', label: 'BSc Medical Laboratory Technology' },
	{ value: 'msc_lab_tech', label: 'MSc Laboratory Technology' },
]

const INSTITUTE_OPTIONS = [
	{ value: 'aiims', label: 'AIIMS' },
	{ value: 'pgimer', label: 'PGIMER Chandigarh' },
	{ value: 'jipmer', label: 'JIPMER' },
	{ value: 'manipal', label: 'Manipal Academy of Higher Education' },
	{ value: 'srm', label: 'SRM Institute of Science and Technology' },
	{ value: 'kmc', label: 'Kasturba Medical College' },
	{ value: 'other', label: 'Other' },
]

const EXPERIENCE_OPTIONS = Array.from({ length: 30 }, (_, i) => ({
	value: String(i + 1),
	label: `${i + 1} ${i + 1 === 1 ? 'year' : 'years'}`,
}))

const ALL_SKILLS = [
	'Blood sample collection',
	'Clinical testing',
	'Microscopy',
	'PCR testing',
	'Biochemistry analyzer',
	'Hematology analyzer',
	'Specimen handling',
	'Quality control',
]

// ─── Shared sub-components ────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function LabProfessionalTab({ data, onChange }: LabProfessionalTabProps) {
	const [isDirty, setIsDirty] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
	const [saved, setSaved] = useState(data)

	useEffect(() => {
		setIsDirty(JSON.stringify(data) !== JSON.stringify(saved))
	}, [data, saved])

	const handleSave = () => {
		try {
			setSaved(data)
			setIsDirty(false)
			setShowSuccess(true)
			toast.success('Professional details saved successfully!')
		} catch {
			toast.error('Something went wrong. Please try again.')
		}
	}

	const toggleSkill = (skill: string) => {
		const current = data.skills ?? []
		const updated = current.includes(skill)
			? current.filter((s) => s !== skill)
			: [...current, skill]
		onChange({ skills: updated })
	}

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Professional Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

				{/* ── 1. Laboratory Specialization ──────────────────────────────── */}
				<Box>
					<SectionTitle>Select laboratory specialization</SectionTitle>
					<AppSelect
						label=""
						value={data.specializationId || ''}
						options={SPECIALIZATION_OPTIONS}
						placeholder="Select your laboratory specialization"
						onChange={(e) => {
							const selected = SPECIALIZATION_OPTIONS.find((o) => o.value === e.target.value)
							onChange({
								specializationId: e.target.value as string,
								specializationLabel: selected?.label ?? '',
							})
						}}
					/>
				</Box>

				<Divider />

				{/* ── 2. Educational Qualification ─────────────────────────────── */}
				<Box>
					<SectionTitle>Educational qualification and proof</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<AppSelect
							label="Select Degree / Certification *"
							value={data.degree || ''}
							options={DEGREE_OPTIONS}
							onChange={(e) => onChange({ degree: e.target.value as string })}
						/>

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppSelect
									label="Select Institute / University *"
									value={data.institute || ''}
									options={INSTITUTE_OPTIONS}
									placeholder="Select institute or university"
									onChange={(e) => onChange({ institute: e.target.value as string })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Year of Passing *"
									value={data.yearOfPassing}
									placeholder="Enter year of passing"
									onChange={(e) => onChange({ yearOfPassing: e.target.value })}
								/>
							</Grid>
						</Grid>

						<UploadBox
							label="Upload certificate or marksheet"
							required
							description="Submit mark sheets or passing certificates from a recognized medical laboratory institution. Attach UGC-approved university documents where applicable."
							onChange={(file) => onChange({ qualificationProof: file.name })}
						/>
					</Box>
				</Box>

				<Divider />

				{/* ── 3. Registration & Certification Details ───────────────────── */}
				<Box>
					<SectionTitle>Registration and certification details</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						{data.specializationLabel && (
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
									Please upload valid laboratory certification and registration documents for
									verification purposes. You have selected{' '}
									<strong>{data.specializationLabel}</strong> as your specialization.
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
									required
									onChange={(file) => onChange({ registrationProof: file.name })}
								/>
							</Grid>
						</Grid>

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Certification Authority *"
									value={data.certificationAuthority}
									placeholder="E.g. NABL, ICMR, State Medical Council"
									onChange={(e) => onChange({ certificationAuthority: e.target.value })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="License Expiry Date *"
									value={data.licenseExpiryDate}
									placeholder="DD/MM/YYYY"
									onChange={(e) => onChange({ licenseExpiryDate: e.target.value })}
								/>
							</Grid>
						</Grid>
					</Box>
				</Box>

				<Divider />

				{/* ── 4. Professional Experience ────────────────────────────────── */}
				<Box>
					<SectionTitle>Professional experience</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Current Laboratory / Hospital"
									value={data.currentLab}
									placeholder="Enter current lab or hospital name"
									onChange={(e) => onChange({ currentLab: e.target.value })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppSelect
									label="Years of Experience"
									value={data.yearsOfExperience || ''}
									options={EXPERIENCE_OPTIONS}
									placeholder="Select years of experience"
									onChange={(e) => onChange({ yearsOfExperience: e.target.value as string })}
								/>
							</Grid>
						</Grid>

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Previous Organization"
									value={data.previousOrganization}
									placeholder="Enter previous organization name"
									onChange={(e) => onChange({ previousOrganization: e.target.value })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Area of Expertise"
									value={data.areaOfExpertise}
									placeholder="E.g. Blood bank, PCR diagnostics"
									onChange={(e) => onChange({ areaOfExpertise: e.target.value })}
								/>
							</Grid>
						</Grid>
					</Box>
				</Box>

				<Divider />

				{/* ── 5. Laboratory Skills & Equipment ─────────────────────────── */}
				<Box>
					<SectionTitle>Laboratory skills and equipment handled</SectionTitle>
					<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
						Select all skills and equipment you are proficient with
					</Typography>
					<Stack direction="row" flexWrap="wrap" gap={1}>
						{ALL_SKILLS.map((skill) => {
							const selected = (data.skills ?? []).includes(skill)
							return (
								<Chip
									key={skill}
									label={skill}
									onClick={() => toggleSkill(skill)}
									variant={selected ? 'filled' : 'outlined'}
									sx={{
										cursor: 'pointer',
										borderColor: selected ? 'primary.main' : 'divider',
										bgcolor: selected ? 'rgba(43,111,113,0.12)' : 'transparent',
										color: selected ? 'primary.dark' : 'text.secondary',
										fontWeight: selected ? 600 : 400,
										'&:hover': {
											bgcolor: 'rgba(43,111,113,0.08)',
											borderColor: 'primary.main',
										},
									}}
								/>
							)
						})}
					</Stack>
				</Box>

				<Divider />

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
