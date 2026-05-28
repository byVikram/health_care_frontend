// src/features/Pharmacy/components/ProfessionalTab.tsx
import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Grid, Divider } from '@mui/material'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import ProfileFormActions from '../../../components/common/ProfileFormActions/ProfileFormActions'
import { customCardStyle } from '../../../styles/commonStyles'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PharmacyProfileProfessional {
	specializationId: string
	specializationLabel: string
	degree: string
	college: string
	yearOfPassing: string
	qualificationProof: string
	registrationNumber: string
	statePharmacyCouncil: string
	licenseExpiryDate: string
	registrationProof: string
	currentWorkplace: string
	yearsOfExperience: string
	pharmacyType: string
	previousOrganization: string
	certificationName: string
	certificationProof: string
	about: string
}

interface PharmacyProfessionalTabProps {
	data: PharmacyProfileProfessional
	onChange: (updated: Partial<PharmacyProfileProfessional>) => void
}

// ─── Options ──────────────────────────────────────────────────────────────────

const SPECIALIZATION_OPTIONS = [
	{ value: 'clinical_pharmacist', label: 'Clinical Pharmacist' },
	{ value: 'retail_pharmacist', label: 'Retail Pharmacist' },
	{ value: 'hospital_pharmacist', label: 'Hospital Pharmacist' },
	{ value: 'oncology_pharmacist', label: 'Oncology Pharmacist' },
	{ value: 'pediatric_pharmacist', label: 'Pediatric Pharmacist' },
	{ value: 'industrial_pharmacist', label: 'Industrial Pharmacist' },
	{ value: 'community_pharmacist', label: 'Community Pharmacist' },
]

const DEGREE_OPTIONS = ['B.Pharm', 'D.Pharm', 'Pharm.D', 'M.Pharm', 'PhD in Pharmacy'].map((d) => ({
	value: d.toLowerCase().replace(/[.\s]/g, '_'),
	label: d,
}))

const COLLEGE_OPTIONS = [
	{ value: 'manipal', label: 'Manipal College of Pharmaceutical Sciences' },
	{ value: 'jssp', label: 'JSS College of Pharmacy' },
	{ value: 'kle', label: 'KLE University College of Pharmacy' },
	{ value: 'bits', label: 'BITS Pilani - Pharmacy' },
	{ value: 'delhi', label: 'Delhi Institute of Pharmaceutical Sciences' },
	{ value: 'bombay', label: 'Bombay College of Pharmacy' },
	{ value: 'other', label: 'Other' },
]

const EXPERIENCE_OPTIONS = Array.from({ length: 30 }, (_, i) => ({
	value: String(i + 1),
	label: `${i + 1} ${i + 1 === 1 ? 'year' : 'years'}`,
}))

const PHARMACY_TYPE_OPTIONS = [
	{ value: 'retail', label: 'Retail Pharmacy' },
	{ value: 'hospital', label: 'Hospital Pharmacy' },
	{ value: 'clinical', label: 'Clinical Pharmacy' },
	{ value: 'online', label: 'Online Pharmacy' },
	{ value: 'compounding', label: 'Compounding Pharmacy' },
	{ value: 'specialty', label: 'Specialty Pharmacy' },
]

const CERTIFICATION_OPTIONS = [
	{ value: 'clinical_pharmacy', label: 'Clinical Pharmacy Certification' },
	{ value: 'drug_safety', label: 'Drug Safety Training' },
	{ value: 'immunization', label: 'Immunization Certification' },
	{ value: 'pharmaceutical_care', label: 'Pharmaceutical Care Training' },
	{ value: 'other', label: 'Other' },
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

export default function PharmacyProfessionalTab({ data, onChange }: PharmacyProfessionalTabProps) {
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

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Professional Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

				{/* ── 1. Pharmacy Specialization ────────────────────────────────── */}
				<Box>
					<SectionTitle>Select pharmacy specialization</SectionTitle>
					<AppSelect
						label=""
						value={data.specializationId || ''}
						options={SPECIALIZATION_OPTIONS}
						placeholder="Select your pharmacy specialization"
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
									label="Year of Passing *"
									value={data.yearOfPassing}
									placeholder="Enter year of passing"
									onChange={(e) => onChange({ yearOfPassing: e.target.value })}
								/>
							</Grid>
						</Grid>

						<UploadBox
							label="Upload image or PDF of qualification proof"
							required
							description="Submit mark sheets or passing certificates from a UGC-approved pharmacy institution. Pharmacy council registration proof with degree name is required for verification."
							onChange={(file) => onChange({ qualificationProof: file.name })}
						/>
					</Box>
				</Box>

				<Divider />

				{/* ── 3. Pharmacy Council Registration ─────────────────────────── */}
				<Box>
					<SectionTitle>Pharmacy council registration details</SectionTitle>
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
									Please provide valid pharmacy council registration details and supporting documents
									for verification. You have selected{' '}
									<strong>{data.specializationLabel}</strong> as your specialization.
								</Typography>
							</Box>
						)}

						<Grid container spacing={2} alignItems="flex-end">
							<Grid size={{ xs: 12, sm: 8 }}>
								<AppInput
									label="Pharmacy Registration Number *"
									value={data.registrationNumber}
									placeholder="Enter Pharmacy registration number"
									onChange={(e) => onChange({ registrationNumber: e.target.value })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 4 }}>
								<UploadBox
									label=""

									onChange={(file) => onChange({ registrationProof: file.name })}
								/>
							</Grid>
						</Grid>

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="State Pharmacy Council *"
									value={data.statePharmacyCouncil}
									placeholder="E.g. Karnataka State Pharmacy Council"
									onChange={(e) => onChange({ statePharmacyCouncil: e.target.value })}
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
									label="Current Workplace"
									value={data.currentWorkplace}
									placeholder="Enter current workplace"
									onChange={(e) => onChange({ currentWorkplace: e.target.value })}
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
								<AppSelect
									label="Pharmacy Type"
									value={data.pharmacyType || ''}
									options={PHARMACY_TYPE_OPTIONS}
									placeholder="Select pharmacy type"
									onChange={(e) => onChange({ pharmacyType: e.target.value as string })}
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<AppInput
									label="Previous Organization"
									value={data.previousOrganization}
									placeholder="Enter previous organization name"
									onChange={(e) => onChange({ previousOrganization: e.target.value })}
								/>
							</Grid>
						</Grid>
					</Box>
				</Box>

				<Divider />

				{/* ── 5. Additional Certifications ──────────────────────────────── */}
				<Box>
					<SectionTitle>Additional certifications</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<AppSelect
							label="Certification Name"
							value={data.certificationName || ''}
							options={CERTIFICATION_OPTIONS}
							placeholder="Select certification"
							onChange={(e) => onChange({ certificationName: e.target.value as string })}
						/>
						<UploadBox
							label="Upload certification proof"
							description="Upload image or PDF of your certification document."
							onChange={(file) => onChange({ certificationProof: file.name })}
						/>
					</Box>
				</Box>

				<Divider />

				{/* ── 6. About / Bio ──────────────────────────────────────────────
				<Box>
					<SectionTitle>About / Bio</SectionTitle>
					<AppInput
						label="About"
						value={data.about}
						placeholder="Write about your pharmacy expertise, experience, and areas of practice."
						multiline
						rows={4}
						onChange={(e) => onChange({ about: e.target.value })}
					/>
				</Box> */}

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
