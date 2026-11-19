// src/features/dashboard/AllSymptomsPage.tsx
//
// "All Symptoms" (the dashboard's "Consult top doctors online for any health concern" → View All). Built like AllSpecialitiesPage (same
// sticky header, search, scrolling body and click-through to doctor search) and fed like the mobile app's Symptoms page: every symptom
// from GET /api/specialities/symptoms, drawn as the dashboard's symptom card. A card opens doctor search for the speciality the backend
// linked the symptom to (speciality_symptoms).
//
// The A-Z order is made HERE, on what the API returned: the backend's order is not relied on and is not changed.
import { useEffect, useMemo, useState } from 'react'
import { Box, Container, Typography, Grid, Skeleton, Alert } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppButton from '../../components/common/Button/AppButton'
import AppInput from '../../components/common/Input/AppInput'
import { useGoBack } from '../../hooks/useGoBack'
import { ROUTES } from '../../constants/routes'
import { getSymptoms } from '../doctor/doctorService'
import type { SymptomItem } from '../../types/speciality'
import SpecialityCard from '../../components/common/Card/SpecialityCard'
import { symptomCardProps, symptomSearchText } from './symptomCardData'

const BATCH = 12

/** A-Z by label, case and accents ignored. */
const byLabel = (a: SymptomItem, b: SymptomItem) =>
	a.label.localeCompare(b.label, undefined, { sensitivity: 'base', numeric: true })

// ── Card skeleton (the dashboard row's: a 120px tile and a title line) ───────────────────────────────
function CardSkeleton() {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
			<Skeleton variant="rounded" width={120} height={120} sx={{ borderRadius: '16px' }} />
			<Skeleton variant="text" width={90} />
		</Box>
	)
}

export default function AllSymptomsPage() {
	const navigate = useNavigate()
	const goBack = useGoBack()
	const [searchParams] = useSearchParams()
	const consultationType = searchParams.get('consultation_type')

	const [search, setSearch] = useState('')
	const [symptoms, setSymptoms] = useState<SymptomItem[]>([])
	const [apiLoading, setApiLoading] = useState(true)
	const [apiError, setApiError] = useState<string | null>(null)

	useEffect(() => {
		let active = true
		const load = async () => {
			setApiLoading(true)
			try {
				const res = await getSymptoms()
				if (!active) return
				setSymptoms(res.data)
				setApiError(null)
			} catch (err) {
				// ApiService's shared axios interceptor already shows a global error toast on failure -- this Alert is additional
				// inline context appropriate for a full page, not a duplicate toast.
				console.error('Failed to load symptoms:', err)
				if (!active) return
				setApiError('Failed to load symptoms. Please try again.')
			} finally {
				if (active) setApiLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [])

	const sorted = useMemo(() => [...symptoms].sort(byLabel), [symptoms])
	const q = search.trim().toLowerCase()
	const filtered = useMemo(() => (q ? sorted.filter((s) => symptomSearchText(s).includes(q)) : sorted), [sorted, q])

	const handleConsult = (symptom: SymptomItem) => {
		// The symptom -> speciality link comes from the backend. A symptom with none yet opens the plain doctor list, not a guess.
		if (!symptom.speciality_id) {
			navigate(ROUTES.DOCTORS.SEARCH)
			return
		}
		const next = new URLSearchParams({
			speciality_id: symptom.speciality_id,
			speciality_label: symptom.speciality_label ?? '',
		})
		if (consultationType === 'video') next.set('consultation_type', consultationType)
		navigate(`${ROUTES.DOCTORS.SEARCH}?${next.toString()}`)
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: 'calc(100vh - 64px)',
				overflow: 'hidden',
				bgcolor: 'background.default',
			}}
		>
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
								All Symptoms
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{apiLoading
									? 'Loading…'
									: `${filtered.length} symptom${filtered.length === 1 ? '' : 's'} found`}
							</Typography>
						</Box>
						<AppInput
							fullWidth
							placeholder="Search symptoms, e.g. knee pain"
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
								<Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={i}>
									<CardSkeleton />
								</Grid>
							))}
						</Grid>
					) : filtered.length === 0 ? (
						<Box sx={{ textAlign: 'center', py: 10 }}>
							<Typography variant="h6" color="text.secondary">
								{search ? `No symptoms match "${search}"` : 'No symptoms available'}
							</Typography>
							{search && (
								<AppButton
									variant="outlined"
									label="Browse specialities"
									borderRadius="30px"
									sx={{ mt: 2 }}
									onClick={() => navigate(ROUTES.SPECIALITIES)}
								/>
							)}
						</Box>
					) : (
						<Grid container spacing={3}>
							{filtered.map((s) => (
								<Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={s.id}>
									<Box sx={{ display: 'flex', justifyContent: 'center' }}>
										<SpecialityCard {...symptomCardProps(s)} onConsult={() => handleConsult(s)} />
									</Box>
								</Grid>
							))}
						</Grid>
					)}
				</Container>
			</Box>
		</Box>
	)
}
