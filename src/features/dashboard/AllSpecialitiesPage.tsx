// src/features/dashboard/AllSpecialitiesPage.tsx
import { Box, Container, Typography, Grid, Skeleton, Alert } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import AppButton from '../../components/common/Button/AppButton'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGoBack } from '../../hooks/useGoBack'
import { useEffect, useState } from 'react'
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

// ── Unified Speciality Visual & Content Configuration ──────────────────────────
interface SpecialityConfig {
	image: string
	objectPosition?: string
	description: string
}

const SPECIALITY_CONFIGS: Record<string, SpecialityConfig> = {
	heart: {
		image: cardiologistImage,
		description: 'Heart and blood vessel specialist care',
	},
	skin: {
		image: dermatologistImage,
		description: 'Skin, hair, nails and cosmetic treatments',
	},
	bone: {
		image: orthopedicsImage,
		description: 'Bone, joint, spine and musculoskeletal care',
	},
	brain: {
		image: neurologistImage,
		description: 'Brain, nerves, spine and neurological disorders',
	},
	stethoscope: {
		image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop&auto=format',
		description: 'General health checkup and primary care',
	},
	dentistry: {
		image: dentistImage,
		description: 'Dental care, oral hygiene and teeth treatment',
	},
	gynecology: {
		image: gynoCologistImage,
		description: "Women's health, pregnancy and fertility care",
	},
	nutrition: {
		image: nutritionImage,
		objectPosition: 'center center',
		description: 'Diet planning, healthy eating and nutrition guidance',
	},
	physiotherapy: {
		image: physiotherapistImage,
		description: 'Pain relief, movement rehab and physical therapy',
	},
	pediatrics: {
		image: pediatricianImage,
		description: 'Child health, growth and immunization care',
	},
	ophthalmology: {
		image: opthalmologistImage,
		description: 'Eye care, vision and eye disease treatment',
	},
	ent: {
		image: entImage,
		description: 'Ear, nose, throat and hearing care',
	},
	psychiatry: {
		image: psychiatristImage,
		description: 'Mental health, stress, anxiety and emotional well-being',
	},
	urology: {
		image: urologistImage,
		description: "Urinary tract, kidney and men's health care",
	},
	gastroenterology: {
		image: gastroenterologistImage,
		description: 'Digestive system, stomach, liver and gut health',
	},
	pulmonology: {
		image: pulmonologistImage,
		description: 'Lung and respiratory disorders treatment',
	},
	endocrinology: {
		image: endocrinologistImage,
		description: 'Hormone disorders, diabetes and thyroid care',
	},
	oncology: {
		image: oncologistImage,
		description: 'Cancer care, treatment and support',
	},
	nephrology: {
		image: nephrologistImage,
		objectPosition: 'center 30%',
		description: 'Kidney care, dialysis and renal diseases',
	},
	rheumatology: {
		image: rheumatologistImage,
		objectPosition: 'center 30%',
		description: 'Arthritis, joint pain and autoimmune disorders',
	},
}

function resolveSpecialityDetails(iconKey: string, label: string) {
	const cfg = SPECIALITY_CONFIGS[iconKey]
	if (cfg) {
		return {
			image: cfg.image,
			objectPosition: cfg.objectPosition ?? 'center top',
			description: cfg.description,
		}
	}
	// Fallback
	return {
		image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop&auto=format',
		objectPosition: 'center top',
		description: `Specialised care for ${label.toLowerCase()}`,
	}
}

// ── Enriched type ───────────────────────────────────────────────────────────────
interface EnrichedSpeciality extends SpecialityItem {
	image: string
	objectPosition: string
	description: string
}

function enrich(s: SpecialityItem): EnrichedSpeciality {
	const details = resolveSpecialityDetails(s.icon_key || '', s.label)
	return {
		...s,
		image: details.image,
		objectPosition: details.objectPosition,
		description: s.description || details.description,
	}
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
	const goBack = useGoBack()
	const [searchParams] = useSearchParams()
	const consultationType = searchParams.get('consultation_type')

	const [search, setSearch] = useState('')
	const [specialities, setSpecialities] = useState<EnrichedSpeciality[]>([])
	const [apiLoading, setApiLoading] = useState(true)
	const [apiError, setApiError] = useState<string | null>(null)

	useEffect(() => {
		let active = true
		const load = async () => {
			setApiLoading(true)
			try {
				const res = await getSpecialities()
				if (!active) return
				setSpecialities(res.data.map(enrich))
				setApiError(null)
			} catch (err) {
				// ApiService's shared axios interceptor already shows a global
				// error toast on failure -- this Alert is additional inline
				// context appropriate for a full page, not a duplicate toast.
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

	const handleConsult = (speciality: EnrichedSpeciality) => {
		const next = new URLSearchParams({
			speciality_id: speciality.id,
			speciality_label: speciality.label,
		})

		if (consultationType === 'video') {
			next.set('consultation_type', consultationType)
		}

		navigate(`/doctors/search?${next.toString()}`)
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', bgcolor: 'background.default' }}>
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
							onClick={() => goBack()}
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
							fullWidth
							placeholder="Search speciality..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							size="small"
							startIcon={<SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
							enableVoiceSearch
							onVoiceResult={(text) => setSearch(text)}
							sx={{
								minWidth: 220,
								maxWidth: 400,
								bgcolor: 'background.paper',
								borderRadius: '10px',
								'& .MuiOutlinedInput-root': {
									borderRadius: '10px',
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
										onConsult={() => handleConsult(s)}
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
