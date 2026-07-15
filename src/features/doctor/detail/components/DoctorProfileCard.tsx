// src/features/doctor/components/DoctorProfileCard.tsx
import { useState, Fragment } from 'react'
import { customCardStyle } from '../../../../styles/commonStyles'
import { Box, Typography, Avatar, Divider, IconButton, Snackbar, Tooltip } from '@mui/material'
import { LuMapPin } from 'react-icons/lu'
import { BsBriefcase, BsCalendarCheck } from 'react-icons/bs'

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShareIcon from '@mui/icons-material/Share'
import { DoctorDetailData } from '../../../../types/doctor-detail'
import { FaInstagram, FaFacebookF, FaXTwitter } from 'react-icons/fa6'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { togglePatientFavouriteDoctor, getPatientFavouriteDoctors } from '../../doctorService'
import { useAuth } from '../../../../hooks/useAuth'

interface StatItemProps {
	icon: React.ReactNode
	value: string | number
	label: string
}

function StatItem({ icon, value, label }: StatItemProps) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
			<Box
				sx={{
					width: 42,
					height: 42,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: 'primary.main',
				}}
			>
				{icon}
			</Box>
			<Typography variant="body1" sx={{ fontWeight: 600, fontSize: '14px' }}>
				{value}
			</Typography>
			<Typography variant="body2">{label}</Typography>
		</Box>
	)
}

interface DoctorProfileCardProps {
	doctor: DoctorDetailData
}

/** Converts a raw handle like "dr_anjali" or "https://instagram.com/dr_anjali" into "@dr_anjali" */
function formatHandle(raw: string): string {
	try {
		const url = new URL(raw)
		const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/')
		const handle = parts[parts.length - 1] || raw
		return handle.startsWith('@') ? handle : `@${handle}`
	} catch {
		const clean = raw.replace(/^@/, '')
		return `@${clean}`
	}
}

export default function DoctorProfileCard({ doctor }: DoctorProfileCardProps) {
	const { role, accessToken } = useAuth()
	const [isFavourited, setIsFavourited] = useState(doctor.is_favourited || false)
	const [snackbarOpen, setSnackbarOpen] = useState(false)
	const [snackbarMsg, setSnackbarMsg] = useState('')
	
	useEffect(() => {
		// Only fetch favourites if logged in as a patient and the status isn't already true
		if (role === 'patient' && accessToken && !doctor.is_favourited) {
			let active = true
			const checkFavouriteStatus = async () => {
				try {
					const res = await getPatientFavouriteDoctors()
					if (active && res?.data?.favourite_ids) {
						if (res.data.favourite_ids.includes(doctor.id)) {
							setIsFavourited(true)
						}
					}
				} catch (error) {
					// Ignore errors silently (e.g. not authenticated)
				}
			}
			checkFavouriteStatus()
			return () => { active = false }
		}
	}, [doctor.id, doctor.is_favourited, role, accessToken])
	
	const specialization = doctor.specialities?.[0] || 'General'
	const primaryHospital =
		doctor.hospitals.find((h) => h.is_primary) || (doctor.hospitals.length > 0 ? doctor.hospitals[0] : null)
	const secondaryHospital = doctor.hospitals.find((h) => h.id !== primaryHospital?.id) || null

	const social = doctor.details.social_media_handles ?? {}

	const handleFavourite = async () => {
		const newStatus = !isFavourited
		// Optimistic update
		setIsFavourited(newStatus)
		try {
			await togglePatientFavouriteDoctor(doctor.id)
			toast.success(newStatus ? 'Doctor added to favourites.' : 'Doctor removed from favourites.')
		} catch (error) {
			// Revert on failure
			setIsFavourited(!newStatus)
			toast.error('Failed to update favourites')
			console.error('Failed to toggle favourite', error)
		}
	}

	const handleShare = () => {
		const url = `${window.location.origin}/doctors/${doctor.id}`
		navigator.clipboard.writeText(url).then(() => {
			setSnackbarMsg('Link copied to clipboard!')
			setSnackbarOpen(true)
		})
	}

	const socialItems = [
		{
			key: 'instagram',
			raw: social.instagram,
			icon: <FaInstagram style={{ width: 24, height: 24, color: '#0F7C7C' }} />,
			label: 'Instagram',
		},
		{
			key: 'facebook',
			raw: social.facebook,
			icon: <FaFacebookF style={{ width: 22, height: 22, color: '#0F7C7C' }} />,
			label: 'Facebook',
		},
		{
			key: 'twitter',
			raw: social.twitter,
			icon: <FaXTwitter style={{ width: 22, height: 22, color: '#0F7C7C' }} />,
			label: 'Twitter',
		},
	].filter((s) => !!s.raw)

	const allItems = [
		{
			key: 'available',
			content: (
				<StatItem
					icon={<BsCalendarCheck style={{ width: 24, height: 24, color: '#0F7C7C' }} />}
					value="Today"
					label="Available"
				/>
			),
			clickable: false,
		},
		{
			key: 'experience',
			content: (
				<StatItem
					icon={<BsBriefcase style={{ width: 24, height: 24, color: '#0F7C7C' }} />}
					value={`${doctor.details.experience_years || 0}+`}
					label="Experience"
				/>
			),
			clickable: false,
		},
		...socialItems.map((s) => ({
			key: s.key,
			content: (
				<StatItem
					icon={s.icon}
					value={s.label}
					label={formatHandle(s.raw!)}
				/>
			),
			clickable: true,
		})),
	]

	return (
		<>
			<Box sx={{ ...customCardStyle, overflow: 'hidden' }}>
				{/* Top: Avatar + Info */}
				<Box sx={{ display: 'flex', gap: 2.5, p: 1, alignItems: 'flex-start' }}>
					<Avatar
						src={doctor.details.avatar_s3_key || ''}
						alt={doctor.name}
						sx={{ width: 88, height: 88, borderRadius: '50%', flexShrink: 0 }}
						variant="rounded"
					/>

					<Box sx={{ flex: 1, minWidth: 0 }}>
						{/* Name row */}
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
							<Typography variant="h5" sx={{ fontWeight: 700 }}>
								{doctor.name}
							</Typography>

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Tooltip title={isFavourited ? 'Remove from favourites' : 'Add to favourites'}>
									<IconButton
										size="small"
										onClick={handleFavourite}
										sx={{
											color: isFavourited ? 'error.main' : 'text.secondary',
											transition: 'color 0.2s, transform 0.15s',
											'&:hover': { transform: 'scale(1.15)' },
											'&:focus': { outline: 'none' },
											p: 0.5,
										}}
									>
										{isFavourited ? (
											<FavoriteIcon sx={{ fontSize: 20 }} />
										) : (
											<FavoriteBorderIcon sx={{ fontSize: 20 }} />
										)}
									</IconButton>
								</Tooltip>

								<Tooltip title="Copy profile link">
									<IconButton
										size="small"
										onClick={handleShare}
										sx={{
											color: 'text.secondary',
											transition: 'color 0.2s, transform 0.15s',
											'&:hover': { color: 'primary.main', transform: 'scale(1.15)' },
											'&:focus': { outline: 'none' },
											p: 0.5,
										}}
									>
										<ShareIcon sx={{ fontSize: 20 }} />
									</IconButton>
								</Tooltip>
							</Box>
						</Box>

						<Typography variant="body2" sx={{ mb: 1 }}>
							{specialization}
						</Typography>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<LuMapPin style={{ fontSize: 14, color: 'primary.main' }} />
								<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
									{primaryHospital?.hospital.name || doctor.details.location || 'Clinic'}
								</Typography>
								<Typography
									variant="caption"
									sx={{ color: 'primary.main', fontWeight: 600, fontSize: '11px', ml: 0.5 }}
								>
									&lt;{primaryHospital?.hospital.distance || '0 km'}
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<LuMapPin style={{ fontSize: 14, color: 'primary.main' }} />
								<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
									{secondaryHospital?.hospital.name || ''}
								</Typography>
								<Typography
									variant="caption"
									sx={{ color: 'primary.main', fontWeight: 600, fontSize: '11px', ml: 0.5 }}
								>
									{secondaryHospital ? `<${secondaryHospital.hospital.distance}` : ''}
								</Typography>
							</Box>
						</Box>
					</Box>
				</Box>

				<Divider />

				{/* Stats + Social Row */}
				<Box sx={{ display: 'flex', py: 2.5 }}>
					{allItems.map((item, idx) => (
						<Fragment key={item.key}>
							{idx > 0 && <Divider orientation="vertical" flexItem />}
							<Box
								sx={{
									flex: 1,
									cursor: item.clickable ? 'pointer' : 'default',
									'&:hover': item.clickable
										? { opacity: 0.75, '& .MuiTypography-root': { color: 'primary.main' } }
										: {},
									transition: 'opacity 0.15s',
								}}
							>
								{item.content}
							</Box>
						</Fragment>
					))}
				</Box>
			</Box>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={2000}
				onClose={() => setSnackbarOpen(false)}
				message={snackbarMsg}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			/>
		</>
	)
}
