import { Box, Typography, TextField, InputAdornment, Divider, Chip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import HomeIcon from '@mui/icons-material/Home'
import { Appointment } from '../../types/appointment'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import ConfirmIcon from '../../assets/icons/confirm.svg'
import RejectIcon from '../../assets/icons/reject.svg'
import RescheduleIcon from '../../assets/icons/reschedule.svg'
import ReferIcon from '../../assets/icons/refer.svg'

const actionButtons = [
	{
		icon: ConfirmIcon,
		label: 'Confirm',
		bg: '#e8f5e9',
		color: '#4caf50',
	},
	{
		icon: RejectIcon,
		label: 'Reject',
		bg: '#ffeeee',
		color: '#e53935',
	},
	{
		icon: RescheduleIcon,
		label: 'Reschedule',
		bg: '#fff8e8',
		color: '#f59e0b',
	},
	{
		icon: ReferIcon,
		label: 'Refer',
		bg: '#e8f4f8',
		color: '#0c7c7c',
	},
]

export function DoctorAppointments({
	selectedDate,
	setSelectedDate,
	appointments,
	apptLoading,
	apptError,
	weekDays,
	selectedDateObj,
}: {
	selectedDate: number
	setSelectedDate: (i: number) => void
	appointments: Appointment[]
	apptLoading: boolean
	apptError: string
	weekDays: { day: string; date: string; red: boolean; dateObj: Date }[]
	selectedDateObj: Date
}) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
			<Box>
				<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary', mb: 1.5 }}>
					Search Patient
				</Typography>
				<TextField
					fullWidth
					placeholder="Search Patient ID, Name..."
					size="small"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
									<MicNoneOutlinedIcon sx={{ fontSize: 20, color: '#0c7c7c', cursor: 'pointer' }} />
									<Box sx={{ width: '1px', height: '18px', bgcolor: '#e0e0e0' }} />
									<QrCodeScannerIcon sx={{ fontSize: 20, color: '#0c7c7c', cursor: 'pointer' }} />
								</Box>
							</InputAdornment>
						),
					}}
					sx={{ '& fieldset': { borderRadius: '10px' } }}
				/>
			</Box>
			<Box sx={{ overflowY: 'auto', flex: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Typography sx={{ fontWeight: 700, fontSize: '17px', color: 'text.primary' }}>
						Today's Appointments
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<Typography sx={{ fontSize: '13px', color: '#0c7c7c', fontWeight: 600 }}>
							{selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
						</Typography>
						<ChevronRightIcon sx={{ fontSize: 18, color: '#0c7c7c' }} />
					</Box>
				</Box>
				<Box sx={{ display: 'flex', gap: 0.8, mb: 2, alignItems: 'center' }}>
					<ChevronLeftIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }} />
					{weekDays.map((d, i) => (
						<Box
							key={i}
							onClick={() => setSelectedDate(i)}
							sx={{
								flex: 1,
								textAlign: 'center',
								py: 0.8,
								borderRadius: '10px',
								bgcolor: selectedDate === i ? '#0c7c7c' : 'transparent',
								cursor: 'pointer',
								transition: 'background 0.2s',
								'&:hover': { bgcolor: selectedDate === i ? '#0c7c7c' : 'rgba(12,124,124,0.08)' },
							}}
						>
							<Typography
								sx={{
									fontSize: '9px',
									color: selectedDate === i ? 'rgba(255,255,255,0.8)' : 'text.secondary',
								}}
							>
								{d.day}
							</Typography>
							<Typography
								sx={{
									fontSize: '14px',
									fontWeight: 700,
									color: selectedDate === i ? '#fff' : d.red ? '#e53935' : 'text.primary',
								}}
							>
								{d.date}
							</Typography>
						</Box>
					))}
					<ChevronRightIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }} />
				</Box>
				<Divider sx={{ mb: 2 }} />
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{apptLoading && Array.from({ length: 5 }).map((_, i) => <AppSkeleton key={i} height={90} />)}
					{!apptLoading && apptError && (
						<Typography sx={{ color: 'error.main', fontSize: '13px' }}>{apptError}</Typography>
					)}
					{appointments.map((apt) => (
						<Box
							key={apt.id}
							sx={{
								p: 1.5,
								borderRadius: '12px',
								border: apt.status === 'cancelled' ? '1px solid #f5c6c6' : '1px solid #e0e0e0',
								bgcolor: apt.status === 'cancelled' ? '#fff5f5' : '#fff',
								display: 'flex',
								alignItems: 'center',
								gap: 1.5,
							}}
						>
							<Box
								sx={{
									width: 30,
									height: 30,
									borderRadius: '6px',
									bgcolor: apt.status === 'cancelled' ? '#f5c6c6' : '#e8f5e9',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
								}}
							>
								<HomeIcon
									sx={{ fontSize: 17, color: apt.status === 'cancelled' ? '#b0b0b0' : '#0c7c7c' }}
								/>
							</Box>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Box
									sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3, flexWrap: 'wrap' }}
								>
									<Typography
										sx={{
											fontWeight: 600,
											fontSize: '13px',
											color: apt.status === 'cancelled' ? 'text.secondary' : 'text.primary',
										}}
									>
										{apt.patient.name}
									</Typography>
									<Chip
										label={apt.status}
										size="small"
										sx={{
											fontSize: '9px',
											height: 16,
											bgcolor: apt.status === 'cancelled' ? '#ffeeee' : '#fff8e8',
											color: apt.status === 'cancelled' ? '#e53935' : '#f59e0b',
											fontWeight: 600,
										}}
									/>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
									<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
										{apt.appointment_mode}
									</Typography>
									<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>|</Typography>
									<AccessTimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
									<Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
										{apt.appointment_time}
									</Typography>
								</Box>
							</Box>
							{apt.status === 'cancelled' ? (
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 1,
										bgcolor: '#ffe0e0',
										borderRadius: '8px',
										px: 1.5,
										py: 0.8,
									}}
								>
									<CancelOutlinedIcon sx={{ fontSize: 16, color: '#e53935' }} />
									<Typography sx={{ fontSize: '10px', color: '#e53935', fontWeight: 600 }}>
										Patient has canceled the appointment
									</Typography>
								</Box>
							) : (
								<Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
									{actionButtons.map((action, i) => (
										<Box key={i}>
											<Box
												sx={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													gap: 0.4,
													cursor: 'pointer',
													bgcolor: action.bg,
													borderRadius: '8px',
													px: 1,
													py: 1,
													minWidth: 28,
													transition: 'opacity 0.2s',
													'&:hover': { opacity: 0.75 },
												}}
											>
												<img src={action.icon} width={16} height={16} alt={action.label} />
											</Box>
											<Typography
												sx={{ mt: 0.4, fontSize: '10px', fontWeight: 400, textAlign: 'center' }}
											>
												{action.label}
											</Typography>
										</Box>
									))}
								</Box>
							)}
							<ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	)
}
