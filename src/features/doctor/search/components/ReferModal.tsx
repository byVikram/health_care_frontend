// src/features/doctor/components/ReferPage.tsx
import { useState, useEffect, useRef } from 'react'
import {
	Box,
	Typography,
	TextField,
	InputAdornment,
	Avatar,
	Button,
	ClickAwayListener,
	Divider,
	Popper,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import { getDoctors, getFavouriteDoctors, FavouriteDoctor } from '../../doctorService'
import { DoctorSearchItem } from '../../../../types/doctor-search'
import { toast } from 'react-toastify'
import AppSkeleton from '../../../../components/common/Skeleton/AppSkeleton'

type ReferDoctorRow = {
	id: string
	name: string
	avatar_s3_key: string | null
	location: string | null
	experience_years: number | null
	specialities: string[]
}

function mapFav(f: FavouriteDoctor): ReferDoctorRow {
	return { id: f.id, name: f.name, avatar_s3_key: f.avatar_s3_key, location: f.location, experience_years: f.experience_years, specialities: f.specialities }
}

function mapSearch(s: DoctorSearchItem): ReferDoctorRow {
	return { id: s.id, name: s.name, avatar_s3_key: s.avatar_s3_key, location: s.location, experience_years: s.experience_years, specialities: s.specialities }
}

function DoctorSkeleton() {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1, py: 1.5 }}>
			<AppSkeleton variant="circular" width={48} height={48} sx={{ flexShrink: 0 }} />
			<Box sx={{ flex: 1 }}>
				<AppSkeleton width="55%" height={16} sx={{ mb: 0.8 }} />
				<AppSkeleton width="35%" height={13} sx={{ mb: 0.6 }} />
				<Box sx={{ display: 'flex', gap: 1.5 }}>
					<AppSkeleton width={70} height={12} />
					<AppSkeleton width={80} height={12} />
				</Box>
			</Box>
			<AppSkeleton variant="circular" width={32} height={32} sx={{ flexShrink: 0 }} />
		</Box>
	)
}

function DoctorCard({ doctor, onShare }: { doctor: ReferDoctorRow; onShare: (d: ReferDoctorRow) => void }) {
	const specialization = doctor.specialities?.[0] || 'General Physician'
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1, py: 1.5, borderRadius: '12px', transition: 'background 0.15s', '&:hover': { bgcolor: 'action.hover' } }}>
			<Avatar
				src={doctor.avatar_s3_key || ''}
				alt={doctor.name}
				sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: '50%', transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', '& img': { objectFit: 'cover', objectPosition: 'top center', width: '100%', height: '100%' } }}
			/>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px', color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
					{doctor.name}
				</Typography>
				<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.4 }}>
					{specialization}
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
					{doctor.experience_years != null && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
							<WorkOutlineIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
							<Typography variant="caption" sx={{ color: 'text.disabled' }}>{doctor.experience_years} yrs exp</Typography>
						</Box>
					)}
					{doctor.location && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
							<LocationOnOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
							<Typography variant="caption" sx={{ color: 'text.disabled', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{doctor.location}</Typography>
						</Box>
					)}
				</Box>
			</Box>
			<Button
				size="small"
				variant="contained"
				onClick={() => onShare(doctor)}
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
					'&:hover': {
						bgcolor: '#0a6b6b',
						boxShadow: 'none',
					},
				}}
			>
				Share
			</Button>
		</Box>
	)
}

type Props = { open: boolean; anchorEl: HTMLElement | null; onClose: () => void }

export default function ReferModal({ open, anchorEl, onClose }: Props) {
	const [search, setSearch] = useState('')
	const [searchResults, setSearchResults] = useState<ReferDoctorRow[]>([])
	const [searchLoading, setSearchLoading] = useState(false)
	const [favourites, setFavourites] = useState<ReferDoctorRow[]>([])
	const [favLoading, setFavLoading] = useState(false)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isSearching = search.trim().length >= 3

	useEffect(() => {
		if (!open) return
		setFavLoading(true)
		getFavouriteDoctors()
			.then((res) => { if (res.success) setFavourites(res.data.favourites.map(mapFav)) })
			.catch(() => toast.error('Failed to load favourites'))
			.finally(() => setFavLoading(false))
	}, [open])

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		if (search.trim().length < 3) { setSearchResults([]); setSearchLoading(false); return }
		setSearchLoading(true)
		debounceRef.current = setTimeout(async () => {
			try {
				const res = await getDoctors({ search: search.trim(), limit: 20 })
				if (res.success) setSearchResults(res.data.map(mapSearch))
			} catch { toast.error('Search failed') }
			finally { setSearchLoading(false) }
		}, 400)
		return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
	}, [search])

	const handleClose = () => { setSearch(''); setSearchResults([]); onClose() }
	const handleShare = (doctor: ReferDoctorRow) => { toast.success(`Referred to ${doctor.name}`); handleClose() }

	const favIds = new Set(favourites.map((f) => f.id))
	const filteredSearch = searchResults.filter((d) => !favIds.has(d.id))

	return (
		<Popper
			open={open}
			anchorEl={anchorEl}
			placement="bottom"
			modifiers={[
				{ name: 'offset', options: { offset: [0, 24] } },
				{ name: 'flip', enabled: false },
			]}
			sx={{ zIndex: 1300 }}
		>
			<ClickAwayListener onClickAway={handleClose}>
				<Box
					sx={{
						width: 360,
						maxWidth: 'calc(100vw - 32px)',
						maxHeight: '70vh',
						borderRadius: '16px',
						boxShadow: '0px 10px 40px rgba(0,0,0,0.16)',
						overflow: 'visible',
						bgcolor: '#fff',
						'&::before': {
							content: '""',
							position: 'absolute',
							top: -8,
							left: '50%',
							transform: 'translateX(-50%) rotate(45deg)',
							width: 16,
							height: 16,
							bgcolor: '#fff',
							borderTop: '1px solid rgba(12,124,124,0.18)',
							borderLeft: '1px solid rgba(12,124,124,0.18)',
						},
					}}
				>
					<Box sx={{ px: 2, py: 2, overflowY: 'auto' }}>
						<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px', mb: 1.5 }}>
							Refer to Doctor
						</Typography>
						<TextField
							fullWidth
							placeholder="Search doctor..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							size="small"
							autoFocus
							InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>) }}
							sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'background.default', '& fieldset': { borderColor: '#0c7c7c80' }, '&:hover fieldset': { borderColor: '#0c7c7c' }, '&.Mui-focused fieldset': { borderColor: '#0c7c7c' } } }}
						/>

						{isSearching && (
							<Box sx={{ mb: 2 }}>
								<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, px: 1, display: 'block', mb: 0.5 }}>
									Search Results
								</Typography>
								{searchLoading ? (
									<Box>{[1, 2, 3].map((i) => <DoctorSkeleton key={i} />)}</Box>
								) : filteredSearch.length === 0 ? (
									<Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 3 }}>No doctors found</Typography>
								) : (
									<Box>{filteredSearch.map((doc) => <DoctorCard key={doc.id} doctor={doc} onShare={handleShare} />)}</Box>
								)}
							</Box>
						)}

						{isSearching && favourites.length > 0 && <Divider sx={{ mb: 2 }} />}

						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, px: 1, display: 'block', mb: 0.5 }}>
								Favourite Doctors
							</Typography>
							{favLoading ? (
								<Box>{[1, 2].map((i) => <DoctorSkeleton key={i} />)}</Box>
							) : favourites.length === 0 ? (
								<Box sx={{ textAlign: 'center', py: 4 }}>
									<BookmarkBorderIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
									<Typography variant="body2" sx={{ color: 'text.disabled' }}>No favourite doctors yet</Typography>
									<Typography variant="caption" sx={{ color: 'text.disabled' }}>Search above to find and refer a doctor</Typography>
								</Box>
							) : (
								<Box>{favourites.map((doc) => <DoctorCard key={doc.id} doctor={doc} onShare={handleShare} />)}</Box>
							)}
						</Box>
					</Box>
				</Box>
			</ClickAwayListener>
		</Popper>
	)
}
