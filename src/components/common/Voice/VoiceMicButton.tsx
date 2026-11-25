// src/components/common/Voice/VoiceMicButton.tsx
//
// The mic of a search field: tap to speak, tap again to stop. While it listens it turns red and pulses, so the user can see the browser is
// listening. `onResult` gets the final text. It is a real button (keyboard focus, label, pressed state). Put it in the field's end adornment.
import MicIcon from '@mui/icons-material/Mic'
import { IconButton, Tooltip, type SxProps, type Theme } from '@mui/material'
import { toast } from 'react-toastify'
import { useVoiceInput } from '../../../hooks/useVoiceInput'

const NOTICE_KEY = 'voice-search-notice-seen'

/** Browsers send the audio to their speech service (Google, Apple ...): said once, the first time the mic is used. */
function showSpeechNoticeOnce() {
	try {
		if (localStorage.getItem(NOTICE_KEY)) return
		localStorage.setItem(NOTICE_KEY, '1')
	} catch {
		// storage blocked: the notice shows each time, which is fine
	}
	toast.info("Your speech is processed by your browser's provider (for example Google or Apple) to turn it into text.", { autoClose: 7000 })
}

interface VoiceMicButtonProps {
	onResult: (text: string) => void
	/** What the mic is for, said by screen readers ("Search by voice"). */
	label?: string
	size?: 'small' | 'medium'
	iconSize?: number
	/** The idle colour of the icon. */
	color?: string
	sx?: SxProps<Theme>
}

export default function VoiceMicButton({ onResult, label = 'Search by voice', size = 'small', iconSize = 20, color = 'text.secondary', sx }: VoiceMicButtonProps) {
	const { listening, toggle } = useVoiceInput(onResult)
	return (
		<Tooltip title={listening ? 'Listening… tap to stop' : label}>
			<IconButton
				type="button"
				size={size}
				onClick={() => {
					if (!listening) showSpeechNoticeOnce()
					toggle()
				}}
				aria-label={listening ? 'Stop listening' : label}
				aria-pressed={listening}
				sx={{
					color: listening ? 'error.main' : color,
					'@keyframes voicePulse': { '0%': { boxShadow: '0 0 0 0 rgba(211,47,47,0.45)' }, '70%': { boxShadow: '0 0 0 9px rgba(211,47,47,0)' }, '100%': { boxShadow: '0 0 0 0 rgba(211,47,47,0)' } },
					animation: listening ? 'voicePulse 1.2s ease-out infinite' : 'none',
					...(sx as object),
				}}
			>
				<MicIcon sx={{ fontSize: iconSize }} />
			</IconButton>
		</Tooltip>
	)
}
