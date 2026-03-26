// src/features/consultation/components/ConsultationNotes.tsx
import { useState } from 'react'
import { Box, Typography, Divider, IconButton, Tooltip } from '@mui/material'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import { ConsultationDoctor } from '../../../types/consultation'

interface ConsultationNotesProps {
	doctor: ConsultationDoctor
}

const TOOLBAR_ACTIONS = [
	{ icon: <UndoIcon fontSize="small" />, label: 'Undo' },
	{ icon: <RedoIcon fontSize="small" />, label: 'Redo' },
	{ icon: <TextFieldsIcon fontSize="small" />, label: 'Text' },
	{ icon: <EmojiEmotionsOutlinedIcon fontSize="small" />, label: 'Emoji' },
	{ icon: <CameraAltOutlinedIcon fontSize="small" />, label: 'Camera' },
	{ icon: <ImageOutlinedIcon fontSize="small" />, label: 'Image' },
	{ icon: <MicNoneOutlinedIcon fontSize="small" />, label: 'Voice' },
	{ icon: <FormatListBulletedIcon fontSize="small" />, label: 'List' },
]

export default function ConsultationNotes({ doctor }: ConsultationNotesProps) {
	const [notes, setNotes] = useState('')

	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '16px',
				overflow: 'hidden',
				height: '300px',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{/* Doctor + Clinic header */}
			<Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
				<Box>
					<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '14px' }}>
						{doctor.name}, {doctor.degree}
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
						{doctor.specialization}
					</Typography>
				</Box>
				<Box sx={{ textAlign: 'right' }}>
					<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '13px' }}>
						{doctor.clinicName}
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
						{doctor.clinicAddress}
					</Typography>
				</Box>
			</Box>

			<Divider />

			{/* Toolbar */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 0.5,
					px: 1.5,
					py: 1,
					borderBottom: '1px solid',
					borderColor: 'divider',
				}}
			>
				{TOOLBAR_ACTIONS.map((action, i) => (
					<Tooltip key={i} title={action.label} placement="top">
						<IconButton
							size="small"
							sx={{
								color: 'text.secondary',
								borderRadius: '6px',
								'&:hover': { bgcolor: 'rgba(43,111,113,0.08)', color: 'primary.main' },
								'&:focus': { outline: 'none' },
							}}
						>
							{action.icon}
						</IconButton>
					</Tooltip>
				))}
			</Box>

			{/* Notes editor area */}
			<Box
				component="textarea"
				value={notes}
				onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
				placeholder="Type consultation notes here..."
				sx={{
					// flex: 1,
					border: 'none',
					outline: 'none',
					resize: 'none',
					p: 2,
					fontFamily: 'Inter, sans-serif',
					fontSize: '13.5px',
					color: 'text.primary',
					bgcolor: 'background.paper',
					lineHeight: 1.7,
					// minHeight: 300,
					'&::placeholder': { color: 'text.disabled' },
				}}
			/>
		</Box>
	)
}
