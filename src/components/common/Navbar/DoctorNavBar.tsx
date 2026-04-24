// src/components/common/Navbar/DoctorNavBar.tsx
import { useEffect, useRef, useState } from 'react'
import { Box, Typography, IconButton, Avatar } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import drImage from '../../../assets/Services/doctors-service.png'
import { useAuth, LookupHospital } from '../../../hooks/useAuth'
import { USER_ROLES } from '../../../constants/constants'

interface DoctorNavBarProps {
	onProfileClick?: () => void
	onHospitalChange?: (hospital: LookupHospital | null) => void
}

export default function DoctorNavBar({ onProfileClick, onHospitalChange }: DoctorNavBarProps) {
	const { role, user, lookupData } = useAuth()

	const hospitals: LookupHospital[] = lookupData?.hospitals ?? []

	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const locationRef = useRef<HTMLDivElement>(null)

	const active = hospitals.find((h) => h.id === (selectedId ?? hospitals[0]?.id)) ?? hospitals[0] ?? null

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
				setDropdownOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<Box
			sx={{
				bgcolor: '#0c7c7c',
				px: 3,
				py: 1.5,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}
		>
			{/* Left: Logo only */}
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				<Typography sx={{ color: '#fff', fontWeight: 700, fontStyle: 'italic', fontSize: '18px' }}>
					Whisper ai
				</Typography>
			</Box>

			{/* Right: Location + Calendar + Bell + Divider + Profile */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				{/* Location dropdown — between bell and divider */}
				{role === USER_ROLES.DOCTOR && hospitals.length > 0 && active && (
					<Box ref={locationRef} sx={{ position: 'relative' }}>
						<Box
							onClick={() => setDropdownOpen((prev) => !prev)}
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 0.75,
								cursor: 'pointer',
								borderRadius: '8px',
								px: 1,
								py: 0.5,
								bgcolor: dropdownOpen ? 'rgba(255,255,255,0.12)' : 'transparent',
								'&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
								transition: 'background 0.15s',
								userSelect: 'none',
							}}
						>
							<LocationOnIcon sx={{ color: '#fff', fontSize: 16, flexShrink: 0 }} />
							<Box>
								<Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>
									{active.label}
									{active.address && `, ${active.address}`}
								</Typography>
							</Box>
							{hospitals.length > 1 && (
								<Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '10px', px: 0.8, py: 0.2, ml: 0.5 }}>
									<Typography sx={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>
										+{hospitals.length - 1}
									</Typography>
								</Box>
							)}
							<KeyboardArrowDownIcon
								sx={{
									color: '#fff',
									fontSize: 18,
									transition: 'transform 0.2s',
									transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
								}}
							/>
						</Box>

						{/* Dropdown panel */}
						{dropdownOpen && (
							<Box
								sx={{
									position: 'absolute',
									top: 'calc(100% + 8px)',
									right: 0,
									minWidth: 320,
									bgcolor: '#fff',
									borderRadius: '12px',
									boxShadow: '0px 8px 32px rgba(0,0,0,0.15)',
									zIndex: 9999,
									overflow: 'hidden',
									py: 0.75,
									animation: 'dropFadeIn 0.15s ease',
									'@keyframes dropFadeIn': {
										from: { opacity: 0, transform: 'translateY(-6px)' },
										to: { opacity: 1, transform: 'translateY(0)' },
									},
								}}
							>
								{hospitals.map((h) => {
									const isSelected = active.id === h.id
									return (
										<Box
											key={h.id}
											onClick={() => {
												setSelectedId(h.id)
												setDropdownOpen(false)
												onHospitalChange?.(h)
											}}
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												px: 2.5,
												py: 1.1,
												cursor: 'pointer',
												'&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
												transition: 'background 0.1s',
											}}
										>
											<Box>
												<Typography
													sx={{
														fontSize: '14px',
														fontWeight: isSelected ? 600 : 400,
														color: '#1a1a1a',
														lineHeight: 1.35,
													}}
												>
													{h.label}
												</Typography>
												{h.address && (
													<Typography
														sx={{
															fontSize: '12px',
															color: '#888',
															lineHeight: 1.3,
															mt: 0.15,
														}}
													>
														{h.address}
													</Typography>
												)}
											</Box>
											{isSelected && (
												<Box
													sx={{
														width: 10,
														height: 10,
														borderRadius: '50%',
														bgcolor: '#0c7c7c',
														flexShrink: 0,
														ml: 2,
													}}
												/>
											)}
										</Box>
									)
								})}
							</Box>
						)}
					</Box>
				)}

				<IconButton sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<CalendarTodayOutlinedIcon sx={{ fontSize: 22 }} />
				</IconButton>
				<IconButton sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<NotificationsNoneOutlinedIcon sx={{ fontSize: 24 }} />
				</IconButton>

				{/* Divider */}
				<Box sx={{ width: '1px', height: '22px', bgcolor: 'rgba(255,255,255,0.3)' }} />

				{/* Profile */}
				<Box
					sx={{
						display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
						borderRadius: '20px', px: 0.5, py: 0.25, transition: 'background 0.15s',
						'&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
					}}
					onClick={onProfileClick}
				>
					<Box sx={{ position: 'relative' }}>
						<Avatar
							src={user?.avatar || drImage}
							sx={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.5)' }}
						/>
						<Box
							sx={{
								position: 'absolute', bottom: 1, right: 1,
								width: 9, height: 9, borderRadius: '50%',
								bgcolor: '#4caf50', border: '1.5px solid #0c7c7c',
							}}
						/>
					</Box>
					<KeyboardArrowDownIcon sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 18 }} />
				</Box>
			</Box>
		</Box>
	)
}
