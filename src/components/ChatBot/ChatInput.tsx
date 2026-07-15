import React, { useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AppInput from '../common/Input/AppInput'

interface ChatInputProps {
	onSend: (text: string) => void
	disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
	const [text, setText] = useState('')

	const handleSend = () => {
		if (text.trim() && !disabled) {
			onSend(text.trim())
			setText('')
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleSend()
		}
	}

	return (
		<Box
			sx={{
				p: 2.5,
				pt: 1.5,
				bgcolor: 'background.paper',
				borderBottomLeftRadius: '20px',
				borderBottomRightRadius: '20px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 1.25,
			}}
		>
			<Box
				sx={{
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					gap: 1.75,
				}}
			>
				{/* Reusing AppInput with custom styling overrides to match Find Doctors page */}
				<AppInput
					placeholder="Ask CareAI anything..."
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					fullWidth
					disabled={disabled}
					enableVoiceSearch
					onVoiceResult={(voiceText) => setText(voiceText)}
					size="small"
					sx={{
						flex: 1,
						bgcolor: 'background.paper',
						borderRadius: '10px',
						'& .MuiOutlinedInput-root': { borderRadius: '10px' },
					}}
				/>

				{/* Send button */}
				<IconButton
					onClick={handleSend}
					disabled={disabled || !text.trim()}
					sx={{
						width: 46,
						height: 46,
						borderRadius: '50%',
						bgcolor: (text.trim() && !disabled) ? 'primary.main' : '#e0e7ef', // Lighter grey/blue when inactive
						color: (text.trim() && !disabled) ? 'primary.contrastText' : 'text.secondary',
						boxShadow: (text.trim() && !disabled) ? '0 4px 10px rgba(43, 111, 113, 0.2)' : 'none',
						transition: 'all 0.2s ease',
						flexShrink: 0,
						'&:hover': {
							bgcolor: (text.trim() && !disabled) ? 'primary.dark' : '#e0e7ef',
							transform: (text.trim() && !disabled) ? 'scale(1.05)' : 'none',
						},
						'&:active': {
							transform: 'scale(0.95)',
						},
					}}
				>
					<ArrowForwardIcon sx={{ fontSize: 20 }} />
				</IconButton>
			</Box>

			{/* Brand attribution footer */}
			<Typography
				variant="caption"
				sx={{
					color: 'text.secondary',
					fontSize: '11.5px',
					fontWeight: 600,
					mt: 0.5,
					letterSpacing: '0.01em',
				}}
			>
				Powered by Whisper AI
			</Typography>
		</Box>
	)
}
