// src/components/common/SpecialityIconMap.tsx
import { ReactNode } from 'react'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import FavoriteIcon from '@mui/icons-material/Favorite'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import PsychologyIcon from '@mui/icons-material/Psychology'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural'

export function getSpecialityIcon(iconKey: string, color: string = 'primary.main'): ReactNode {
	const props = { sx: { fontSize: 28, color } }
	switch (iconKey) {
		case 'dentistry':
			return <LocalHospitalIcon {...props} />
		case 'cardiology':
			return <FavoriteIcon {...props} />
		case 'orthopedic':
			return <AccessibilityNewIcon {...props} />
		case 'neurology':
			return <PsychologyIcon {...props} />
		case 'kidney':
			return <WaterDropIcon {...props} />
		case 'skin':
			return <FaceRetouchingNaturalIcon {...props} />
		default:
			return <LocalHospitalIcon {...props} />
	}
}
