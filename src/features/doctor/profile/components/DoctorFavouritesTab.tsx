// src/features/doctor/profile/components/DoctorFavouritesTab.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import {
	Box,
	Typography,
	InputAdornment,
	Avatar,
	IconButton,
	Divider,
	Chip,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { customCardStyle, customScrollbar } from '../../../../styles/commonStyles'
import { getDoctors, getFavouriteDoctors, toggleFavouriteDoctor } from '../../doctorService'
import { FavouriteDoctor } from '../../doctorService'
import { DoctorSearchItem } from '../../../../types/doctor-search'
import { toast } from 'react-toastify'
import AppSkeleton from '../../../../components/common/Skeleton/AppSkeleton'
import AppInput from '../../../../components/common/Input/AppInput'

// ---------------------------------------------------------------------------
// Types & mappers
// ---------------------------------------------------------------------------

export type DoctorRow = {
	id: string
	name: string
	is_verified?: boolean
	avatar_s3_key: string | null
	location: string | null
	experience_years: number | null
	specialities: string[]
}

export type FavDoctorsListMode = 'bookmark' | 'refer'

export interface FavouriteDoctorsListProps {
	mode: FavDoctorsListMode
	favouriteIds?: Set<string>
	favourites?: DoctorRow[]
	favLoading?: boolean
	togglingIds?: Set<string>
	onToggle?: (id: string) => void
	onShare?: (doctor: DoctorRow) => void
}

export interface ReferModalProps {
	open: boolean
	onClose: () => void
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

// ---------------------------------------------------------------------------
// Shared Skeleton row
// ---------------------------------------------------------------------------

export function DoctorRowSkeleton() {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5, borderRadius: '12px' }}>
			<AppSkeleton variant="circular" width={52} height={52} sx={{ flexShrink: 0 }} />
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<AppSkeleton width="55%" height={18} sx={{ mb: 0.8 }} />
				<AppSkeleton width="35%" height={14} sx={{ mb: 0.8 }} />
				<Box sx={{ display: 'flex', gap: 1.5 }}>
					<AppSkeleton width={70} height={12} />
					<AppSkeleton width={80} height={12} />
				</Box>
			</Box>
			<AppSkeleton variant="circular" width={28} height={28} sx={{ flexShrink: 0 }} />
		</Box>
	)
}

// ---------------------------------------------------------------------------
// DoctorCard
// ---------------------------------------------------------------------------

function DoctorCard({
	doctor,
	mode,
	isFavourited,
	toggling,
	onToggle,
	onShare,
}: {
	doctor: DoctorRow
	mode: FavDoctorsListMode
	isFavourited: boolean
	toggling: boolean
	onToggle?: (id: string) => void
	onShare?: (d: DoctorRow) => void
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
			<Avatar
				src={doctor.avatar_s3_key || ''}
				alt={doctor.name}
				sx={{
					width: 52,
					height: 52,
					flexShrink: 0,
					borderRadius: '50%',
					transform: 'translateY(-4px)',
					boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
					'& img': { objectFit: 'cover', objectPosition: 'top center', width: '100%', height: '100%' },
				}}
			/>

			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography
					variant="body1"
					sx={{
						fontWeight: 700,
						fontSize: '15px',
						color: 'text.primary',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						mb: 0.2,
					}}
				>
					{doctor.name}
				</Typography>
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

			{mode === 'bookmark' ? (
				<IconButton
					size="small"
					onClick={() => onToggle?.(doctor.id)}
					disabled={toggling}
					sx={{ flexShrink: 0, color: isFavourited ? 'primary.main' : 'text.disabled' }}
				>
					{toggling ? (
						<AppSkeleton variant="circular" width={18} height={18} />
					) : isFavourited ? (
						<BookmarkIcon fontSize="small" />
					) : (
						<BookmarkBorderIcon fontSize="small" />
					)}
				</IconButton>
			) : (
				<Button
					size="small"
					variant="contained"
					onClick={() => onShare?.(doctor)}
					sx={{
						flexShrink: 0,
						minWidth: 82,
						borderRadius: '999px',
						bgcolor: '#0c7c7c',
						color: '#fff',
						px: 2,
						py: 0.7,
						fontWeight: 600,
						fontSize: '13px',
						textTransform: 'none',
						boxShadow: 'none',
						'&:hover': { bgcolor: '#0a6b6b', boxShadow: 'none' },
					}}
				>
					Share
				</Button>
			)}
		</Box>
	)
}

// ---------------------------------------------------------------------------
// FavouriteDoctorsList – reusable core UI
// ---------------------------------------------------------------------------

export function FavouriteDoctorsList({
	mode,
	favouriteIds = new Set(),
	favourites = [],
	favLoading = false,
	togglingIds = new Set(),
	onToggle,
	onShare,
}: FavouriteDoctorsListProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<DoctorRow[]>([])
	const [searchLoading, setSearchLoading] = useState(false)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Search when query is not empty (any length)
	const isSearching = searchQuery.trim().length > 0

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)

		const trimmed = searchQuery.trim()
		if (!trimmed) {
			setSearchResults([])
			setSearchLoading(false)
			return
		}

		debounceRef.current = setTimeout(async () => {
			setSearchLoading(true)
			try {
				const res = await getDoctors({ search: trimmed, limit: 20 })
				if (res.success) {
					setSearchResults(res.data.map(mapSearchToRow))
				} else {
					setSearchResults([])
				}
			} catch (error) {
				console.error('Search failed', error)
				toast.error('Search failed')
				setSearchResults([])
			} finally {
				setSearchLoading(false)
			}
		}, 400)

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [searchQuery])

	return (
		<>
			{/* Search bar */}
			<Box sx={{ px: 3, py: 2 }}>
				<AppInput
					fullWidth
					placeholder={mode === 'refer' ? 'Search doctor...' : 'Search and add doctor'}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					size="small"
					autoFocus={mode === 'refer'}
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
						...(mode === 'refer' && { mb: 2 }),
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

			{/* Search results – shown when user has typed something */}
			{isSearching && (
				<Box sx={{ px: 3, pb: 2 }}>
					<Typography
						variant="caption"
						sx={{
							color: 'text.secondary',
							fontWeight: 600,
							textTransform: 'uppercase',
							letterSpacing: 0.5,
							display: 'block',
							mb: 0.5,
						}}
					>
						Search Results
					</Typography>

					{searchLoading ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
							{[1, 2, 3].map((i) => (
								<DoctorRowSkeleton key={i} />
							))}
						</Box>
					) : searchResults.length === 0 ? (
						<Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 3 }}>
							No doctors found
						</Typography>
					) : (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
							{searchResults.map((doc) => (
								<DoctorCard
									key={doc.id}
									doctor={doc}
									mode={mode}
									isFavourited={favouriteIds.has(doc.id)}
									toggling={togglingIds.has(doc.id)}
									onToggle={onToggle}
									onShare={onShare}
								/>
							))}
						</Box>
					)}
				</Box>
			)}

			{/* Saved / Favourites section – hidden while searching to avoid duplication */}
			{!isSearching && (
				<>
					{favourites.length > 0 && <Divider sx={{ mx: 3 }} />}
					<Box sx={{ px: 3, pb: 3 }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1,
								mb: 1.5,
								pt: favourites.length > 0 ? 1 : 0,
							}}
						>
							<Typography
								variant="caption"
								sx={{
									color: 'text.secondary',
									fontWeight: 600,
									textTransform: 'uppercase',
									letterSpacing: 0.5,
								}}
							>
								{mode === 'refer' ? 'Favourite Doctors' : 'Saved'}
							</Typography>
							{mode === 'bookmark' && favourites.length > 0 && (
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
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
								{[1, 2].map((i) => (
									<DoctorRowSkeleton key={i} />
								))}
							</Box>
						) : favourites.length === 0 ? (
							<Box sx={{ textAlign: 'center', py: mode === 'refer' ? 4 : 5 }}>
								<BookmarkBorderIcon
									sx={{ fontSize: mode === 'refer' ? 36 : 40, color: 'text.disabled', mb: 1 }}
								/>
								<Typography variant="body2" sx={{ color: 'text.disabled' }}>
									No favourite doctors yet
								</Typography>
								<Typography variant="caption" sx={{ color: 'text.disabled' }}>
									{mode === 'refer'
										? 'Search above to find and refer a doctor'
										: 'Use the search bar above to find and save doctors'}
								</Typography>
							</Box>
						) : (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
								{favourites.map((doc) => (
									<DoctorCard
										key={doc.id}
										doctor={doc}
										mode={mode}
										isFavourited={favouriteIds.has(doc.id)}
										toggling={togglingIds.has(doc.id)}
										onToggle={onToggle}
										onShare={onShare}
									/>
								))}
							</Box>
						)}
					</Box>
				</>
			)}
		</>
	)
}

// ---------------------------------------------------------------------------
// ReferModal
// ---------------------------------------------------------------------------

export function ReferModal({ open, onClose }: ReferModalProps) {
	const [favourites, setFavourites] = useState<DoctorRow[]>([])
	const [favLoading, setFavLoading] = useState(false)

	useEffect(() => {
		if (!open) return

		const load = async () => {
			setFavLoading(true)
			try {
				const res = await getFavouriteDoctors()
				if (res.success) setFavourites(res.data.favourites.map(mapFavToRow))
			} catch {
				toast.error('Failed to load favourites')
			} finally {
				setFavLoading(false)
			}
		}

		load()
	}, [open])

	const handleShare = (doctor: DoctorRow) => {
		toast.success(`Referred to ${doctor.name}`)
		onClose()
	}

	const favIds = new Set(favourites.map((f) => f.id))

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xs"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '20px',
					boxShadow: '0px 16px 56px rgba(0,0,0,0.18)',
					overflow: 'hidden',
				},
			}}
		>
			<DialogTitle
				sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 1 }}
			>
				<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '17px' }}>
					Refer to Doctor
				</Typography>
				<IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>
			<Divider />
			<DialogContent sx={{ px: 2, pt: 0, pb: 2, maxHeight: '60vh', overflowY: 'auto', ...customScrollbar }}>
				<FavouriteDoctorsList
					mode="refer"
					favouriteIds={favIds}
					favourites={favourites}
					favLoading={favLoading}
					onShare={handleShare}
				/>
			</DialogContent>
		</Dialog>
	)
}

// ---------------------------------------------------------------------------
// DoctorFavouritesTab – Profile page tab (bookmark mode)
// ---------------------------------------------------------------------------

export default function DoctorFavouritesTab({
	mode = 'bookmark',
	onShare,
	title = 'Favourite Doctors',
}: {
	mode?: FavDoctorsListMode
	onShare?: (doctor: DoctorRow) => void
	title?: string
} = {}) {
	const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set())
	const [favourites, setFavourites] = useState<DoctorRow[]>([])
	const [favLoading, setFavLoading] = useState(true)
	const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

	useEffect(() => {
		const load = async () => {
			try {
				const res = await getFavouriteDoctors()
				if (res.success) {
					setFavouriteIds(new Set(res.data.favourite_ids))
					setFavourites(res.data.favourites.map(mapFavToRow))
				}
			} catch {
				toast.error('Failed to load favourites')
			} finally {
				setFavLoading(false)
			}
		}
		load()
	}, [])

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
						const found = favourites.find((d) => d.id === publicId)
						if (found) setFavourites((prev) => [...prev, found])
						toast.success('Added to favourites')
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
		[togglingIds, favourites]
	)

	return (
		<Box sx={{ ...customCardStyle, p: 0, overflow: 'hidden' }}>
			<Box sx={{ px: 3, pt: 3, pb: 2 }}>
				<Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
					{title}
				</Typography>
			</Box>
			<Divider />
			<FavouriteDoctorsList
				mode={mode}
				favouriteIds={favouriteIds}
				favourites={favourites}
				favLoading={favLoading}
				togglingIds={togglingIds}
				onToggle={mode === 'bookmark' ? handleToggle : undefined}
				onShare={onShare}
			/>
		</Box>
	)
}
