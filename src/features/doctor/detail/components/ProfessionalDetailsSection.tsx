// src/features/doctor/detail/components/ProfessionalDetailsSection.tsx
import { useState } from 'react'
import {
	Box,
	Typography,
	Chip,
	Divider,
	Collapse,
} from '@mui/material'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { DoctorDetailData, DoctorDetailDegree } from '../../../../types/doctor-detail'
import { customCardStyle } from '../../../../styles/commonStyles'

// ─── Mock data (replace with API calls once available) ─────────────────────

const MOCK_CERTIFICATIONS = [
	{ title: 'Advanced Cardiac Life Support (ACLS)', issuer: 'American Heart Association', year: '2022' },
	{ title: 'Basic Life Support (BLS)', issuer: 'American Heart Association', year: '2023' },
	{ title: 'Fellowship in Interventional Cardiology', issuer: 'Cardiology Society of India', year: '2019' },
]

const MOCK_TREATMENTS = [
	'Angioplasty',
	'Echocardiography',
	'Cardiac Catheterization',
	'Pacemaker Implantation',
	'Heart Failure Management',
	'Hypertension Treatment',
	'Lipid Disorders',
	'Arrhythmia Management',
]

const MOCK_AREAS_OF_EXPERTISE = [
	'Interventional Cardiology',
	'Preventive Cardiology',
	'Heart Failure',
	'Coronary Artery Disease',
	'Valvular Heart Disease',
	'Electrophysiology',
]

// ─── Sub-section header ─────────────────────────────────────────────────────

function SubSectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
			<Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>{icon}</Box>
			<Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
				{title}
			</Typography>
		</Box>
	)
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
	return (
		<Box
			sx={{
				border: '1px dashed',
				borderColor: 'divider',
				borderRadius: '8px',
				py: 2.5,
				px: 2,
				textAlign: 'center',
			}}
		>
			<Typography variant="body2" color="text.disabled">
				{message}
			</Typography>
		</Box>
	)
}

// ─── Main component ─────────────────────────────────────────────────────────

interface ProfessionalDetailsSectionProps {
	doctorDetail: DoctorDetailData
}

export default function ProfessionalDetailsSection({ doctorDetail }: ProfessionalDetailsSectionProps) {
	const [expanded, setExpanded] = useState(false)

	const details = doctorDetail.details

	// Build the degrees list: prefer the full array if available, otherwise fall back
	// to the single legacy fields from the public API
	const degrees: DoctorDetailDegree[] = (() => {
		if (details.degrees && details.degrees.length > 0) return details.degrees
		if (details.degree || details.college) {
			return [
				{
					degree: details.degree,
					college: details.college,
					year_of_passing: details.year_of_passing,
					specialization: doctorDetail.specialities?.[0] ?? null,
				},
			]
		}
		return []
	})()

	return (
		<Box sx={{ ...customCardStyle, p: 3 }}>
			{/* Heading */}
			<Typography variant="h5" sx={{ mb: 1.5 }}>
				Professional Details
			</Typography>

			{/* Introductory Paragraph */}
			<Typography
				variant="body2"
				sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}
			>
				Explore the doctor's professional background, including educational qualifications, certifications, treatments offered, and areas of expertise to better understand their experience and clinical focus.
			</Typography>

			{/* See More action */}
			{!expanded && (
				<Box
					onClick={() => setExpanded(true)}
					sx={{
						display: 'inline-flex',
						alignItems: 'center',
						color: 'primary.main',
						cursor: 'pointer',
						fontWeight: 600,
						fontSize: '0.875rem',
						alignSelf: 'flex-start',
						'&:hover': { color: 'primary.dark' },
					}}
				>
					See More
					<KeyboardArrowDownIcon sx={{ ml: 0.5, fontSize: 18 }} />
				</Box>
			)}

			{/* Expanded content */}
			<Collapse in={expanded} timeout={280}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

					{/* 1. Educational Qualifications */}
					<Box>
						<SubSectionHeader icon={<SchoolOutlinedIcon fontSize="small" />} title="Educational Qualifications" />
						{degrees.length === 0 ? (
							<EmptyState message="No educational qualifications available." />
						) : (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
								{degrees.map((deg, idx) => (
									<Box
										key={idx}
										sx={{
											border: '1px solid',
											borderColor: 'divider',
											borderRadius: '10px',
											px: 2.5,
											py: 2,
											bgcolor: 'background.default',
										}}
									>
										<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
											<Typography
												variant="subtitle2"
												sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}
											>
												{deg.degree.toUpperCase()}
											</Typography>
											{deg.specialization && (
												<Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
													· {deg.specialization}
												</Typography>
											)}
										</Box>
										<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.75 }}>
											{deg.college && (
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													<ApartmentOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
													<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
														{deg.college}
													</Typography>
												</Box>
											)}
											{deg.year_of_passing && (
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													<CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
													<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
														{deg.year_of_passing}
													</Typography>
												</Box>
											)}
										</Box>
									</Box>
								))}
							</Box>
						)}
					</Box>

					<Divider />

					{/* 2. Certifications */}
					<Box>
						<SubSectionHeader icon={<VerifiedOutlinedIcon fontSize="small" />} title="Certifications" />
						{MOCK_CERTIFICATIONS.length === 0 ? (
							<EmptyState message="No certifications listed." />
						) : (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
								{MOCK_CERTIFICATIONS.map((cert, idx) => (
									<Box
										key={idx}
										sx={{
											display: 'flex',
											alignItems: 'flex-start',
											gap: 1.5,
										}}
									>
										<Box
											sx={{
												width: 6,
												height: 6,
												borderRadius: '50%',
												bgcolor: 'primary.main',
												mt: '6px',
												flexShrink: 0,
											}}
										/>
										<Box>
											<Typography
												variant="body2"
												sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.4 }}
											>
												{cert.title}
											</Typography>
											<Typography variant="caption" sx={{ color: 'text.secondary' }}>
												{cert.issuer}
												{cert.year ? ` · ${cert.year}` : ''}
											</Typography>
										</Box>
									</Box>
								))}
							</Box>
						)}
					</Box>

					<Divider />

					{/* 3. Treatments Offered */}
					<Box>
						<SubSectionHeader icon={<HealingOutlinedIcon fontSize="small" />} title="Treatments Offered" />
						{MOCK_TREATMENTS.length === 0 ? (
							<EmptyState message="No treatments listed." />
						) : (
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								{MOCK_TREATMENTS.map((treatment) => (
									<Chip
										key={treatment}
										label={treatment}
										size="small"
										sx={{
											bgcolor: 'rgba(43,111,113,0.08)',
											color: 'primary.main',
											fontWeight: 500,
											fontSize: '0.78rem',
											border: '1px solid rgba(43,111,113,0.2)',
											'&:hover': { bgcolor: 'rgba(43,111,113,0.14)' },
										}}
									/>
								))}
							</Box>
						)}
					</Box>

					<Divider />

					{/* 4. Areas of Expertise */}
					<Box>
						<SubSectionHeader icon={<PsychologyOutlinedIcon fontSize="small" />} title="Areas of Expertise" />
						{MOCK_AREAS_OF_EXPERTISE.length === 0 ? (
							<EmptyState message="No areas of expertise listed." />
						) : (
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								{MOCK_AREAS_OF_EXPERTISE.map((area) => (
									<Chip
										key={area}
										label={area}
										size="small"
										sx={{
											bgcolor: 'rgba(43,111,113,0.05)',
											color: 'text.primary',
											fontWeight: 500,
											fontSize: '0.78rem',
											border: '1px solid',
											borderColor: 'divider',
										}}
									/>
								))}
							</Box>
						)}
					</Box>

					{/* See Less button */}
					<Box
						onClick={() => setExpanded(false)}
						sx={{
							display: 'inline-flex',
							alignItems: 'center',
							color: 'primary.main',
							cursor: 'pointer',
							fontWeight: 600,
							fontSize: '0.875rem',
							alignSelf: 'flex-start',
							mt: 1,
							'&:hover': { color: 'primary.dark' },
						}}
					>
						See Less
						<KeyboardArrowUpIcon sx={{ ml: 0.5, fontSize: 18 }} />
					</Box>

				</Box>
			</Collapse>
		</Box>
	)
}
