// src/components/common/Navbar/DoctorNavBar.tsx
import { Box, Typography, IconButton, Avatar } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import drImage from '../../../assets/Services/doctors-service.png'
import { useNavigate } from 'react-router-dom'

export default function DoctorNavBar() {
	const navigate = useNavigate()
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
			{/* Left: Logo + Location */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				{/* Logo */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<Typography sx={{ color: '#fff', fontWeight: 700, fontStyle: 'italic', fontSize: '18px' }}>
						Whisper ai
					</Typography>
				</Box>

				{/* Divider */}
				<Box sx={{ width: '1px', height: '22px', bgcolor: 'rgba(255,255,255,0.3)' }} />

				{/* Location */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
					<LocationOnIcon sx={{ color: '#fff', fontSize: 16 }} />
					<Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>
						Arogya Clinic, K R Market
					</Typography>
					<Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '10px', px: 0.8, py: 0.2, ml: 0.5 }}>
						<Typography sx={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>+2</Typography>
					</Box>
					<KeyboardArrowDownIcon sx={{ color: '#fff', fontSize: 18 }} />
				</Box>
			</Box>

			{/* Right: Calendar + Bell + Profile */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				<IconButton sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<CalendarTodayOutlinedIcon sx={{ fontSize: 22 }} />
				</IconButton>

				<IconButton sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<NotificationsNoneOutlinedIcon sx={{ fontSize: 24 }} />
				</IconButton>

				{/* Divider */}
				<Box sx={{ width: '1px', height: '22px', bgcolor: 'rgba(255,255,255,0.3)' }} />

				{/* Profile Avatar with green dot */}
				<Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
					<Avatar src={drImage} sx={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.5)' }} />
					<Box
						sx={{
							position: 'absolute',
							bottom: 1,
							right: 1,
							width: 9,
							height: 9,
							borderRadius: '50%',
							bgcolor: '#4caf50',
							border: '1.5px solid #0c7c7c',
						}}
					/>
				</Box>
			</Box>
		</Box>
	)
}
