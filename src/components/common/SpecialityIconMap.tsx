// src/components/common/SpecialityIconMap.tsx
import { ReactNode } from 'react'
// import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
// import FavoriteIcon from '@mui/icons-material/Favorite'
// import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
// import PsychologyIcon from '@mui/icons-material/Psychology'
// import WaterDropIcon from '@mui/icons-material/WaterDrop'
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural'

// import { LiaToothSolid } from 'react-icons/lia'
import { PiHeartbeat } from 'react-icons/pi'
import { LuBone } from 'react-icons/lu'
import { PiBrainLight } from 'react-icons/pi'
import { MdOutlineLocalHospital } from 'react-icons/md'

export function getSpecialityIcon(iconKey: string, color: string = 'primary.main'): ReactNode {
	const props = { sx: { fontSize: 28, color } }
	switch (iconKey) {
		case 'dentistry':
			return <MdOutlineLocalHospital fontSize={'28px'} />
		case 'heart':
			return <PiHeartbeat fontSize={'28px'} />
		case 'bone':
			return <LuBone fontSize={'28px'} />
		case 'brain':
			return <PiBrainLight fontSize={'28px'} />
		// case 'kidney':
		// 	return <WaterDropIcon {...props} />
		case 'skin':
			return <FaceRetouchingNaturalIcon {...props} />
		default:
			return <MdOutlineLocalHospital fontSize={'28px'} />
	}
}
