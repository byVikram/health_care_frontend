// src/features/doctor/profile/components/DoctorFavouritesTab.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import {Box,Typography,TextField,InputAdornment,Avatar,IconButton,CircularProgress,Divider,Chip} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VerifiedIcon from '@mui/icons-material/Verified'
import { customCardStyle } from '../../../../styles/commonStyles'
import { getDoctors, getFavouriteDoctors, toggleFavouriteDoctor, FavouriteDoctor } from '../../doctorService'
import { DoctorSearchItem } from '../../../../types/doctor-search'
import { toast } from 'react-toastify'

// ─── unified shape shared between search results and favourites ───────────────
type DoctorRow = {
	id: string
	name: string
	is_verified: boolean
	avatar_s3_key: string | null
	location: string | null
	experience_years: number | null
	specialities: string[]
}

function mapFavToRow(f: FavouriteDoctor): DoctorRow {
	return {
		id: f.id,
		name: f.name,
		is_verified: f.is_verified,
		avatar_s3_key: f.avatar_s3_key,
		location: f.location,
		experience_years: f.experience_years,
		specialities: f.specialities,
	}
}

function mapSearchToRow(s: DoctorSearchItem): DoctorRow {
	return {
		id: s.id,
		name: s.name,
		is_verified: s.is_verified,
		avatar_s3_key: s.avatar_s3_key,
		location: s.location,
		experience_years: s.experience_years,
		specialities: s.specialities,
	}
}

// ─── Single doctor row card ───────────────────────────────────────────────────
function DoctorRowCard({
	doctor,
	isFavourited,
	toggling,
	onToggle,
}: {
	doctor: DoctorRow
	isFavourited: boolean
	toggling: boolean
	onToggle: (id: string) => void
}) {
	const specialization = doctor.specialities?.[0] || 'General Physician'

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				px: 2,
				py: 1.5,
				borderRadius: '12px',
				transition: 'background 0.15s',
				'&:hover': { bgcolor: 'action.hover' },
			}}
		>
			{/* Avatar */}
			<Avatar
				src={doctor.avatar_s3_key || ''}
				alt={doctor.name}
				sx={{ width: 48, height: 48, flexShrink: 0, border: '2px solid', borderColor: 'divider' }}
			/>

			{/* Info */}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
					<Typography
						variant="body2"
						sx={{
							fontWeight: 700,
							color: 'text.primary',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						{doctor.name}
					</Typography>
					{doctor.is_verified && <VerifiedIcon sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} />}
				</Box>

				<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
					{specialization}
				</Typography>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
					{doctor.experience_years != null && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
							<WorkOutlineIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
							<Typography variant="caption" sx={{ color: 'text.disabled' }}>
								{doctor.experience_years} yrs exp
							</Typography>
						</Box>
					)}
					{doctor.location && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
							<LocationOnOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
							<Typography
								variant="caption"
								sx={{
									color: 'text.disabled',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									maxWidth: 160,
								}}
							>
								{doctor.location}
							</Typography>
						</Box>
					)}
				</Box>
			</Box>

			{/* Bookmark toggle */}
			<IconButton
				size="small"
				onClick={() => onToggle(doctor.id)}
				disabled={toggling}
				sx={{ flexShrink: 0, color: isFavourited ? 'primary.main' : 'text.disabled' }}
			>
				{toggling ? (
					<CircularProgress size={18} sx={{ color: 'primary.main' }} />
				) : isFavourited ? (
					<BookmarkIcon fontSize="small" />
				) : (
					<BookmarkBorderIcon fontSize="small" />
				)}
			</IconButton>
		</Box>
	)
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DoctorFavouritesTab() {
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<DoctorRow[]>([])
	const [searchLoading, setSearchLoading] = useState(false)

	const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set())
	const [favourites, setFavourites] = useState<DoctorRow[]>([])
	const [favLoading, setFavLoading] = useState(true)

	const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isSearching = searchQuery.trim().length > 0

	// ── Load favourites on mount ───────────────────────────────────────────────
	useEffect(() => {
		getFavouriteDoctors()
			.then((res) => {
				if (res.success) {
					setFavouriteIds(new Set(res.data.favourite_ids))
					setFavourites(res.data.favourites.map(mapFavToRow))
				}
			})
			.catch(() => toast.error('Failed to load favourites'))
			.finally(() => setFavLoading(false))
	}, [])

	// ── Debounced search ───────────────────────────────────────────────────────
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)

		if (!searchQuery.trim()) {
			setSearchResults([])
			setSearchLoading(false)
			return
		}

		setSearchLoading(true)
		debounceRef.current = setTimeout(async () => {
			try {
				const res = await getDoctors({ search: searchQuery.trim(), limit: 20 })
				if (res.success) {
					setSearchResults(res.data.map(mapSearchToRow))
				}
			} catch {
				toast.error('Search failed')
			} finally {
				setSearchLoading(false)
			}
		}, 400)

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [searchQuery])

	// ── Toggle favourite ───────────────────────────────────────────────────────
	const handleToggle = useCallback(
		async (publicId: string) => {
			if (togglingIds.has(publicId)) return
			setTogglingIds((prev) => new Set(prev).add(publicId))

			try {
				const res = await toggleFavouriteDoctor(publicId)
				if (res.success) {
					const newIds = new Set(res.data.favourite_ids)
					setFavouriteIds(newIds)

					if (res.data.action === 'added') {
						// Find the doctor from search results or favourites and add to list
						const found =
							searchResults.find((d) => d.id === publicId) || favourites.find((d) => d.id === publicId)
						if (found) {
							setFavourites((prev) => [...prev, found])
						}
						toast.success(`${res.data.action === 'added' ? 'Added to' : 'Removed from'} favourites`)
					} else {
						setFavourites((prev) => prev.filter((d) => d.id !== publicId))
						toast.success('Removed from favourites')
					}
				}
			} catch {
				toast.error('Failed to update favourites')
			} finally {
				setTogglingIds((prev) => {
					const next = new Set(prev)
					next.delete(publicId)
					return next
				})
			}
		},
		[togglingIds, searchResults, favourites]
	)

	// ── Filter out already-favourited doctors from search results ──────────────
	const filteredSearchResults = searchResults.filter((doc) => !favouriteIds.has(doc.id))

	// ─── Render ────────────────────────────────────────────────────────────────
	return (
		<Box sx={{ ...customCardStyle, p: 0, overflow: 'hidden' }}>
			{/* Header */}
			<Box sx={{ px: 3, pt: 3, pb: 2 }}>
				<Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
					Favourite Doctors
				</Typography>
			</Box>

			<Divider />

			{/* Search bar */}
			<Box sx={{ px: 3, py: 2 }}>
				<TextField
					fullWidth
					placeholder="Search and add doctor"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					size="small"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								<MicNoneOutlinedIcon sx={{ color: 'text.disabled', fontSize: 20, cursor: 'pointer' }} />
							</InputAdornment>
						),
					}}
					sx={{
						'& .MuiOutlinedInput-root': {
							borderRadius: '12px',
							bgcolor: 'background.default',
							'& fieldset': { borderColor: 'divider' },
							'&:hover fieldset': { borderColor: 'primary.main' },
							'&.Mui-focused fieldset': { borderColor: 'primary.main' },
						},
					}}
				/>
			</Box>

			{/* ── Search results panel ── */}
			{isSearching && (
				<Box sx={{ px: 3, pb: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
						<Typography
							variant="caption"
							sx={{
								color: 'text.secondary',
								fontWeight: 600,
								textTransform: 'uppercase',
								letterSpacing: 0.5,
							}}
						>
							Search Results
						</Typography>
						{searchLoading && <CircularProgress size={12} />}
					</Box>

					{!searchLoading && filteredSearchResults.length === 0 && (
						<Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 3 }}>
							No doctors found
						</Typography>
					)}

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
						{filteredSearchResults.map((doc) => (
							<DoctorRowCard
								key={doc.id}
								doctor={doc}
								isFavourited={favouriteIds.has(doc.id)}
								toggling={togglingIds.has(doc.id)}
								onToggle={handleToggle}
							/>
						))}
					</Box>
				</Box>
			)}

			{/* Divider between search results and saved favourites */}
			{isSearching && favourites.length > 0 && <Divider sx={{ mx: 3 }} />}

			{/* ── Saved favourites ── */}
			<Box sx={{ px: 3, pb: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pt: 1 }}>
					<Typography
						variant="caption"
						sx={{
							color: 'text.secondary',
							fontWeight: 600,
							textTransform: 'uppercase',
							letterSpacing: 0.5,
						}}
					>
						Saved
					</Typography>
					{favourites.length > 0 && (
						<Chip
							label={favourites.length}
							size="small"
							sx={{
								height: 18,
								fontSize: '11px',
								bgcolor: 'primary.main',
								color: '#fff',
								'& .MuiChip-label': { px: 1 },
							}}
						/>
					)}
				</Box>

				{favLoading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
						<CircularProgress size={28} sx={{ color: 'primary.main' }} />
					</Box>
				) : favourites.length === 0 ? (
					<Box sx={{ textAlign: 'center', py: 5 }}>
						<BookmarkBorderIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
						<Typography variant="body2" sx={{ color: 'text.disabled' }}>
							No favourite doctors yet
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.disabled' }}>
							Use the search bar above to find and save doctors
						</Typography>
					</Box>
				) : (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
						{favourites.map((doc) => (
							<DoctorRowCard
								key={doc.id}
								doctor={doc}
								isFavourited={favouriteIds.has(doc.id)}
								toggling={togglingIds.has(doc.id)}
								onToggle={handleToggle}
							/>
						))}
					</Box>
				)}
			</Box>
		</Box>
	)
}
