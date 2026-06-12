// src/features/dashboard/AllSpecialitiesPage.tsx
import { Box, Container, Typography, Grid, Skeleton, InputAdornment, Alert } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import AppButton from '../../components/common/Button/AppButton'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ConsultCard from '../../components/common/Card/ConsultCard'
import { getSpecialities } from '../doctor/doctorService'
import { SpecialityItem } from '../../types/speciality'
import AppInput from '../../components/common/Input/AppInput'

// ── Local image assets ──────────────────────────────────────────────────────────
import dentistImage from '../../assets/specialties/dentist.png'
import gynoCologistImage from '../../assets/specialties/gynocologist.png'
import nutritionImage from '../../assets/specialties/nutrition.png'
import physiotherapistImage from '../../assets/specialties/physiotherapist.png'
import cardiologistImage from '../../assets/specialties/cardiologist.png'
import dermatologistImage from '../../assets/specialties/dermatologist.png'
import neurologistImage from '../../assets/specialties/neurologist.png'
import pediatricianImage from '../../assets/specialties/pediatrician .png'
import entImage from '../../assets/specialties/ent.png'
import orthopedicsImage from '../../assets/specialties/orthopedics.png'
import opthalmologistImage from '../../assets/specialties/ophthalmologist.png'
import psychiatristImage from '../../assets/specialties/psychiatrist.png'
import nephrologistImage from '../../assets/specialties/nephrologist.png'
import gastroenterologistImage from '../../assets/specialties/gastroenterologist.png'
import urologistImage from '../../assets/specialties/urologist.png'
import pulmonologistImage from '../../assets/specialties/pulmonologist.png'
import oncologistImage from '../../assets/specialties/oncologist.png'
import rheumatologistImage from '../../assets/specialties/rheumatologist.png'
import endocrinologistImage from '../../assets/specialties/endocrinologist.png'

// ── Visual config: keyword in API label -> local image + crop anchor ────────────
interface VisualConfig {
	image: string
	objectPosition: string
}

const VISUAL_MAP: [string, VisualConfig][] = [
	['dentist', { image: dentistImage, objectPosition: 'center top' }],
	['gynecolog', { image: gynoCologistImage, objectPosition: 'center top' }],
	['dietitian', { image: nutritionImage, objectPosition: 'center center' }],
	['nutrition', { image: nutritionImage, objectPosition: 'center center' }],
	['physiotherap', { image: physiotherapistImage, objectPosition: 'center top' }],
	['cardiolog', { image: cardiologistImage, objectPosition: 'center top' }],
	['dermatolog', { image: dermatologistImage, objectPosition: 'center top' }],
	['pediatric', { image: pediatricianImage, objectPosition: 'center top' }],
	['orthoped', { image: orthopedicsImage, objectPosition: 'center top' }],
	['neurolog', { image: neurologistImage, objectPosition: 'center top' }],
	['ophthalm', { image: opthalmologistImage, objectPosition: 'center top' }],
	['ear, nose', { image: entImage, objectPosition: 'center top' }],
	['ent', { image: entImage, objectPosition: 'center top' }],
	['psychiatr', { image: psychiatristImage, objectPosition: 'center top' }],
	['urolog', { image: urologistImage, objectPosition: 'center top' }],
	['gastroenter', { image: gastroenterologistImage, objectPosition: 'center top' }],
	['pulmonolog', { image: pulmonologistImage, objectPosition: 'center top' }],
	['endocrinolog', { image: endocrinologistImage, objectPosition: 'center top' }],
	['oncolog', { image: oncologistImage, objectPosition: 'center top' }],
	['nephrolog', { image: nephrologistImage, objectPosition: 'center 30%' }],
	['rheumatolog', { image: rheumatologistImage, objectPosition: 'center 30%' }],
]

const FALLBACK: VisualConfig = {
	image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop&auto=format',
	objectPosition: 'center top',
}

function resolveVisual(label: string): VisualConfig {
	const lower = label.toLowerCase()
	for (const [kw, cfg] of VISUAL_MAP) {
		if (lower.includes(kw)) return cfg
	}
	return FALLBACK
}

// ── Description map ─────────────────────────────────────────────────────────────
const DESC_MAP: [string, string][] = [
	['dentist', 'Dental care, oral hygiene and teeth treatment'],
	['gynecolog', "Women's health, pregnancy and fertility care"],
	['dietitian', 'Diet planning, healthy eating and nutrition guidance'],
	['nutrition', 'Diet planning, healthy eating and nutrition guidance'],
	['physiotherap', 'Pain relief, movement rehab and physical therapy'],
	['general phys', 'General health checkup and primary care'],
	['cardiolog', 'Heart and blood vessel specialist care'],
	['dermatolog', 'Skin, hair, nails and cosmetic treatments'],
	['pediatric', 'Child health, growth and immunization care'],
	['orthoped', 'Bone, joint, spine and musculoskeletal care'],
	['neurolog', 'Brain, nerves, spine and neurological disorders'],
	['ophthalm', 'Eye care, vision and eye disease treatment'],
	['ear, nose', 'Ear, nose, throat and hearing care'],
	['ent', 'Ear, nose, throat and hearing care'],
	['psychiatr', 'Mental health, stress, anxiety and emotional well-being'],
	['urolog', "Urinary tract, kidney and men's health care"],
	['gastroenter', 'Digestive system, stomach, liver and gut health'],
	['pulmonolog', 'Lung and respiratory disorders treatment'],
	['endocrinolog', 'Hormone disorders, diabetes and thyroid care'],
	['oncolog', 'Cancer care, treatment and support'],
	['nephrolog', 'Kidney care, dialysis and renal diseases'],
	['rheumatolog', 'Arthritis, joint pain and autoimmune disorders'],
]

function resolveDescription(label: string): string {
	const lower = label.toLowerCase()
	for (const [kw, desc] of DESC_MAP) {
		if (lower.includes(kw)) return desc
	}
	return `Specialised care for ${label.toLowerCase()}`
}

// ── Enriched type ───────────────────────────────────────────────────────────────
interface EnrichedSpeciality extends SpecialityItem {
	image: string
	objectPosition: string
	description: string
}

function enrich(s: SpecialityItem): EnrichedSpeciality {
	const v = resolveVisual(s.label)
	return { ...s, image: v.image, objectPosition: v.objectPosition, description: resolveDescription(s.label) }
}

// ── Card skeleton ───────────────────────────────────────────────────────────────
function CardSkeleton() {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
			<Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '4/3', borderRadius: '6px' }} />
			<Skeleton variant="text" width="60%" height={22} />
			<Skeleton variant="text" width="90%" height={18} />
			<Skeleton variant="text" width="75%" height={18} />
		</Box>
	)
}

// ── Main page ────────────────────────────────────────────────────────────────────
const BATCH = 12

export default function AllSpecialitiesPage() {
	const navigate = useNavigate()

	const [specialities, setSpecialities] = useState<EnrichedSpeciality[]>([])
	const [apiLoading, setApiLoading] = useState(true)
	const [apiError, setApiError] = useState<string | null>(null)

	const [search, setSearch] = useState('')

	// Fetch from API on mount
	useEffect(() => {
		let active = true
		setApiLoading(true)
		const load = async () => {
			try {
				const res = await getSpecialities()
				if (!active) return
				setSpecialities(res.data.map(enrich))
				setApiError(null)
			} catch (err) {
				console.error('Failed to load specialities:', err)
				if (!active) return
				setApiError('Failed to load specialities. Please try again.')
			} finally {
				if (active) setApiLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [])

	const filtered = specialities.filter(
		(s) =>
			s.label.toLowerCase().includes(search.toLowerCase()) ||
			s.description.toLowerCase().includes(search.toLowerCase())
	)

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
			{/* Sticky header */}
			<Box
				sx={{
					position: 'sticky',
					top: 0,
					zIndex: 100,
					bgcolor: 'background.paper',
					borderBottom: '1px solid',
					borderColor: 'divider',
					boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
				}}
			>
				<Container maxWidth="lg" sx={{ py: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
						<AppButton
							variant="text"
							label="Back"
							startIcon={<ArrowBackIosNewIcon sx={{ fontSize: '14px !important' }} />}
							onClick={() => navigate(-1)}
							sx={{ color: 'text.secondary', minWidth: 'auto', px: 1 }}
						/>
						<Box sx={{ borderLeft: '3px solid', borderColor: 'primary.main', pl: 1.5, flex: 1 }}>
							<Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
								All Specialities
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{apiLoading
									? 'Loading…'
									: `${filtered.length} specialit${filtered.length === 1 ? 'y' : 'ies'} found`}
							</Typography>
						</Box>
						<AppInput
							placeholder="Search speciality..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
									</InputAdornment>
								),
							}}
							sx={{
								minWidth: 220,
								'& .MuiOutlinedInput-root': {
									borderRadius: '30px',
								},
							}}
						/>
					</Box>
				</Container>
			</Box>

			{/* Scrollable body with custom scrollbar */}
			<Box
				sx={{
					flex: 1,
					overflowY: 'auto',
					'&::-webkit-scrollbar': { width: '8px' },
					'&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
					'&::-webkit-scrollbar-thumb': {
						bgcolor: 'primary.light',
						borderRadius: '100px',
						border: '2px solid transparent',
						backgroundClip: 'content-box',
					},
					'&::-webkit-scrollbar-thumb:hover': { bgcolor: 'primary.main' },
					scrollbarWidth: 'thin',
					scrollbarColor: 'var(--mui-palette-primary-light) transparent',
				}}
			>
				<Container maxWidth="lg" sx={{ py: 5 }}>
					{apiError && (
						<Alert severity="error" sx={{ mb: 3 }}>
							{apiError}
						</Alert>
					)}

					{apiLoading ? (
						<Grid container spacing={3}>
							{Array.from({ length: BATCH }).map((_, i) => (
								<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
									<CardSkeleton />
								</Grid>
							))}
						</Grid>
					) : filtered.length === 0 ? (
						<Box sx={{ textAlign: 'center', py: 10 }}>
							<Typography variant="h6" color="text.secondary">
								{search ? `No specialities match "${search}"` : 'No specialities available'}
							</Typography>
						</Box>
					) : (
						<Grid container spacing={3}>
							{filtered.map((s) => (
								<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={s.id}>
									<ConsultCard
										image={s.image}
										title={s.label}
										description={s.description}
										onConsult={() =>
											navigate(
												`/doctors/search?speciality_id=${s.id}&speciality_label=${encodeURIComponent(s.label)}`
											)
										}
										objectPosition={s.objectPosition}
									/>
								</Grid>
							))}
						</Grid>
					)}
				</Container>
			</Box>
		</Box>
	)
}
