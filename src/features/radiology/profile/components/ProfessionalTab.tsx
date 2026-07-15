// src/features/radiology/profile/components/ProfessionalTab.tsx
import { useState, useRef } from 'react'
import {
	Box,
	Typography,
	Grid,
	Divider,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
} from '@mui/material'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import AppInput from '../../../../components/common/Input/AppInput'
import AppSelect from '../../../../components/common/Select/AppSelect'
import AppMultiSelect from '../../../../components/common/Select/AppMultiSelect'
import ProfileFormActions from '../../../../components/common/ProfileFormActions/ProfileFormActions'
import { customCardStyle } from '../../../../styles/commonStyles'
import { RadiologyProfileProfessional } from '../../../../types/radiology-profile'

// ─── Options ──────────────────────────────────────────────────────────────────

const DEGREE_OPTIONS = ['MBBS', 'BDS', 'BAMS', 'BHMS', 'BPT', 'DNB'].map((d) => ({ value: d, label: d }))

const POST_GRAD_OPTIONS = ['MD Radiodiagnosis', 'MD Radiology', 'DNB Radiodiagnosis', 'MS Radiology', 'DMRD'].map(
	(d) => ({ value: d, label: d })
)

const COLLEGE_OPTIONS = [
	{ value: 'bmc', label: 'Bangalore Medical College' },
	{ value: 'aiims', label: 'AIIMS' },
	{ value: 'afmc', label: 'Armed Forces Medical College' },
	{ value: 'jipmer', label: 'JIPMER' },
	{ value: 'mmc', label: 'Madras Medical College' },
	{ value: 'kmc', label: 'Kasturba Medical College' },
	{ value: 'manipal', label: 'Manipal Academy of Higher Education' },
	{ value: 'other', label: 'Other' },
]

const REGISTRATION_COUNCIL_OPTIONS = [
	{ value: 'kmc', label: 'Karnataka Medical Council' },
	{ value: 'tnmc', label: 'Tamil Nadu Medical Council' },
	{ value: 'mmc', label: 'Maharashtra Medical Council' },
	{ value: 'dmc', label: 'Delhi Medical Council' },
	{ value: 'apmc', label: 'Andhra Pradesh Medical Council' },
	{ value: 'other', label: 'Others' },
]

const SUB_SPECIALIZATION_OPTIONS = [
	{ value: 'diagnostic', label: 'Diagnostic Radiology' },
	{ value: 'interventional', label: 'Interventional Radiology' },
	{ value: 'neuroradiology', label: 'Neuroradiology' },
	{ value: 'pediatric', label: 'Pediatric Radiology' },
	{ value: 'musculoskeletal', label: 'Musculoskeletal Radiology' },
	{ value: 'breast', label: 'Breast Imaging' },
	{ value: 'cardiovascular', label: 'Cardiovascular Imaging' },
	{ value: 'abdominal', label: 'Abdominal Imaging' },
	{ value: 'thoracic', label: 'Thoracic Imaging' },
]

const IMAGING_MODALITY_OPTIONS = [
	{ value: 'xray', label: 'X-Ray' },
	{ value: 'ultrasound', label: 'Ultrasound' },
	{ value: 'doppler', label: 'Doppler' },
	{ value: 'ct', label: 'CT Scan' },
	{ value: 'mri', label: 'MRI' },
	{ value: 'mammography', label: 'Mammography' },
	{ value: 'petct', label: 'PET-CT' },
	{ value: 'fluoroscopy', label: 'Fluoroscopy' },
	{ value: 'dexa', label: 'DEXA Scan' },
]

const CERTIFICATION_OPTIONS = [
	{ value: 'fir', label: 'Fellowship in Interventional Radiology' },
	{ value: 'edir', label: 'European Diploma in Radiology (EDiR)' },
	{ value: 'ai_imaging', label: 'AI in Medical Imaging Certification' },
	{ value: 'fbnr', label: 'Fellowship in Body & Neuroradiology' },
	{ value: 'other', label: 'Other' },
]

const MEMBERSHIP_OPTIONS = [
	{ value: 'iria', label: 'Indian Radiological and Imaging Association (IRIA)' },
	{ value: 'rsna', label: 'Radiological Society of North America (RSNA)' },
	{ value: 'esr', label: 'European Society of Radiology (ESR)' },
	{ value: 'ismir', label: 'Indian Society of Magnetic Resonance in Medicine (ISMRM)' },
	{ value: 'cirse', label: 'Cardiovascular and Interventional Radiological Society of Europe (CIRSE)' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary', mb: 2 }}>
			{children}
		</Typography>
	)
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
				{fileName && (
					<Typography
						variant="caption"
						sx={{ color: 'primary.main', fontSize: '11px', display: 'block', mt: 0.5 }}
					>
						📎 {fileName}
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface RadiologyProfessionalTabProps {
	data: RadiologyProfileProfessional
	onChange: (updated: Partial<RadiologyProfileProfessional>) => void
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RadiologyProfessionalTab({ data, onChange }: RadiologyProfessionalTabProps) {
	// Initialise saved state from localStorage (lazy initialiser — runs once, no effect needed)
	const isDirty = true
	const [showSuccess, setShowSuccess] = useState(false)

	const handleSave = () => {
		console.log(data)
		setShowSuccess(true)
	}

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Professional Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				{/* ── Specialization (fixed) ── */}
				<Box>
					<SectionTitle>Select Specialization</SectionTitle>
					<AppInput label="Specialization" value="Radiology" disabled />
				</Box>

				<Divider />

				{/* ── Educational Qualification ── */}
				<Box>
					<SectionTitle>Educational Qualification and Proof</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppSelect
									label="Degree *"
									value={data.degree}
									options={DEGREE_OPTIONS}
									placeholder="Select degree"
									onChange={(e) => onChange({ degree: e.target.value as string })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppSelect
									label="Post Graduation *"
									value={data.postGraduation}
									options={POST_GRAD_OPTIONS}
									placeholder="Select post graduation"
									onChange={(e) => onChange({ postGraduation: e.target.value as string })}
								/>
							</Grid>
						</Grid>

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 8 }}>
								<AppSelect
									label="College / University *"
									value={data.college}
									options={COLLEGE_OPTIONS}
									placeholder="Select college or university"
									onChange={(e) => onChange({ college: e.target.value as string })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 4 }}>
								<AppInput
									label="Year of Completion *"
									value={data.yearOfPassing}
									placeholder="e.g. 2015"
									onChange={(e) => onChange({ yearOfPassing: e.target.value })}
								/>
							</Grid>
						</Grid>

						<UploadBox
							label="Upload Qualification Proof"
							required
							description="Upload MBBS / MD / Fellowship certificates. Accepted formats: PDF, JPG, PNG."
							fileName={data.qualificationProof}
							onChange={(file) => onChange({ qualificationProof: file.name })}
						/>
					</Box>
				</Box>

				<Divider />

				{/* ── Registration Details ── */}
				<Box>
					<SectionTitle>Registration Details and Proofs</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<Grid container spacing={2} alignItems="flex-end">
							<Grid size={{ xs: 12, sm: 8 }}>
								<AppInput
									label="Medical Registration Number *"
									value={data.registrationNumber}
									placeholder="e.g. KMC/12345/2015"
									onChange={(e) => onChange({ registrationNumber: e.target.value })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 4 }}>
								<UploadBox
									label=""
									fileName={data.registrationProof}
									onChange={(file) => onChange({ registrationProof: file.name })}
								/>
							</Grid>
						</Grid>

						<AppSelect
							label="Registration Council *"
							value={data.registrationCouncil}
							options={REGISTRATION_COUNCIL_OPTIONS}
							placeholder="Select registration council"
							onChange={(e) => onChange({ registrationCouncil: e.target.value as string })}
						/>
					</Box>
				</Box>

				<Divider />

				{/* ── Radiology Practice Details ── */}
				<Box>
					<SectionTitle>Radiology Practice Details</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<AppMultiSelect
							label="Sub-specialization *"
							value={data.subSpecializations || []}
							options={SUB_SPECIALIZATION_OPTIONS}
							onChange={(val) => onChange({ subSpecializations: val as string[] })}
						/>

						<AppMultiSelect
							label="Imaging Modalities *"
							value={data.imagingModalities}
							options={IMAGING_MODALITY_OPTIONS}
							placeholder="Select imaging modalities"
							onChange={(val) => onChange({ imagingModalities: val as string[] })}
						/>

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Years of Experience *"
									value={data.yearsOfExperience}
									placeholder="Years of Experience"
									onChange={(e) => onChange({ yearsOfExperience: e.target.value })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Current Hospital / Diagnostic Center *"
									value={data.currentHospital}
									placeholder="e.g. Manipal Hospital"
									onChange={(e) => onChange({ currentHospital: e.target.value })}
								/>
							</Grid>
						</Grid>
					</Box>
				</Box>

				<Divider />

				{/* ── Certifications & Memberships ── */}
				<Box>
					<SectionTitle>Certifications and Memberships</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<AppMultiSelect
							label="Professional Certifications"
							value={data.certifications}
							options={CERTIFICATION_OPTIONS}
							placeholder="Select certifications"
							onChange={(val) => onChange({ certifications: val as string[] })}
						/>

						<AppMultiSelect
							label="Professional Memberships"
							value={data.memberships}
							options={MEMBERSHIP_OPTIONS}
							placeholder="Select memberships"
							onChange={(val) => onChange({ memberships: val as string[] })}
						/>

						<UploadBox
							label="Upload Supporting Documents (Optional)"
							description="Upload fellowship certificates, membership certificates, or research publications."
							fileName={data.certificationProof}
							onChange={(file) => onChange({ certificationProof: file.name })}
						/>
					</Box>
				</Box>

				<Divider />

				{/* ── Teleradiology / Reporting Availability ── */}
				<Box>
					<SectionTitle>Reporting Availability</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<FormControl>
							<FormLabel sx={{ fontSize: '13px', fontWeight: 500, color: 'text.secondary', mb: 0.5 }}>
								Teleradiology Services Available?
							</FormLabel>
							<RadioGroup
								row
								value={data.teleradiologyAvailable}
								onChange={(e) => onChange({ teleradiologyAvailable: e.target.value })}
							>
								<FormControlLabel
									value="yes"
									control={<Radio size="small" />}
									label={<Typography sx={{ fontSize: '14px' }}>Yes</Typography>}
								/>
								<FormControlLabel
									value="no"
									control={<Radio size="small" />}
									label={<Typography sx={{ fontSize: '14px' }}>No</Typography>}
								/>
							</RadioGroup>
						</FormControl>

						{data.teleradiologyAvailable === 'yes' && (
							<Grid container spacing={2}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<AppInput
										label="Reporting Hours"
										value={data.reportingHours}
										placeholder="e.g. 8 AM – 10 PM"
										onChange={(e) => onChange({ reportingHours: e.target.value })}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<AppInput
										label="Time Zone Coverage"
										value={data.timezoneCoverage}
										placeholder="e.g. IST, EST"
										onChange={(e) => onChange({ timezoneCoverage: e.target.value })}
									/>
								</Grid>
							</Grid>
						)}
					</Box>
				</Box>

				<Divider />

				{/* ── About / Bio ── */}
				<Box>
					<SectionTitle>About / Bio</SectionTitle>
					<AppInput
						label="Bio"
						value={data.about}
						placeholder="e.g. Senior Radiologist with 12 years of experience in diagnostic and interventional radiology..."
						multiline
						rows={4}
						onChange={(e) => onChange({ about: e.target.value })}
					/>
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
