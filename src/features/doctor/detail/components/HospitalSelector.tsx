// src/features/doctor/components/HospitalSelector.tsx
import { Box, Typography } from '@mui/material'
// import LocationOnIcon from '@mui/icons-material/LocationOn'
import { DoctorDetailHospital } from '../../../../types/doctor-detail'
import { LuMapPin } from 'react-icons/lu'

interface HospitalSelectorProps {
	hospitals: DoctorDetailHospital[]
	selected: string
	onChange: (id: string) => void
}

export default function HospitalSelector({ hospitals, selected, onChange }: HospitalSelectorProps) {
	return (
		<Box>
			<Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
				Choose Hospital
			</Typography>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				{hospitals.map((hospital, index) => {
					const isSelected = selected === hospital.hospital.id
					return (
						<Box
							key={hospital.id}
							onClick={() => onChange(hospital.hospital.id)}
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 2,
								p: 2,
								border: '1.5px solid',
								borderColor: isSelected ? 'primary.main' : 'divider',
								borderRadius: '12px',
								cursor: 'pointer',
								bgcolor: isSelected ? 'rgba(43,111,113,0.05)' : 'background.paper',
								transition: 'all 0.15s',
								'&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(43,111,113,0.04)' },
							}}
						>
							{/* Number Badge */}
							<Box
								sx={{
									width: 28,
									height: 28,
									borderRadius: '50%',
									bgcolor: isSelected ? 'primary.main' : 'divider',
									color: isSelected ? '#fff' : 'text.secondary',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 700,
									fontSize: '13px',
									flexShrink: 0,
									transition: 'all 0.15s',
								}}
							>
								{index + 1}
							</Box>

							{/* Info */}
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography variant="body1" sx={{ fontWeight: 600 }}>
									{hospital.hospital.name}
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
									<LuMapPin style={{ width: 12, height: 12, color: 'text.secondary' }} />
									<Typography variant="body2">{hospital.hospital.address}</Typography>
								</Box>
							</Box>

							{/* Distance */}
							<Typography
								variant="caption"
								sx={{
									color: 'primary.main',
									fontWeight: 600,
									fontSize: '12px',
									bgcolor: 'rgba(43,111,113,0.08)',
									px: 1,
									py: 0.4,
									borderRadius: '6px',
									flexShrink: 0,
								}}
							>
								{hospital.hospital.distance}
							</Typography>

							{/* Radio dot */}
							<Box
								sx={{
									width: 18,
									height: 18,
									borderRadius: '50%',
									border: '2px solid',
									borderColor: isSelected ? 'primary.main' : 'divider',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
								}}
							>
								{isSelected && (
									<Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: 'primary.main' }} />
								)}
							</Box>
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}
