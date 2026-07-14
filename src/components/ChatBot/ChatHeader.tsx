// src/components/ChatBot/ChatHeader.tsx
import React from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import HistoryIcon from '@mui/icons-material/History'

interface ChatHeaderProps {
	onNewChat: () => void
	onClose: () => void
	onToggleHistory: () => void
	showHistoryButton: boolean
}

export default function ChatHeader({ onNewChat, onClose, onToggleHistory, showHistoryButton }: ChatHeaderProps) {
	return (
		<Box
			sx={{
				p: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				borderBottom: '1px solid',
				borderColor: 'divider',
				bgcolor: 'background.paper',
				borderTopLeftRadius: '20px',
				borderTopRightRadius: '20px',
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				{/* Avatar Container with rounded-square background and subtle gradient */}
				<Box
					sx={{
						width: 48,
						height: 48,
						borderRadius: '12px',
						background: 'linear-gradient(135deg, #eef5f6 0%, #fbeff5 100%)',
						boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<SmartToyIcon sx={{ color: 'primary.main', fontSize: 26 }} />
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Typography
							variant="subtitle1"
							sx={{
								fontWeight: 700,
								fontSize: '1rem',
								color: 'text.primary',
								lineHeight: 1.2,
							}}
						>
							CareAI
						</Typography>

						{/* Static Online Indicator */}
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Box
								sx={{
									width: 6,
									height: 6,
									borderRadius: '50%',
									bgcolor: '#13854E', // theme success green
								}}
							/>
							<Typography
								variant="caption"
								sx={{
									color: '#13854E',
									fontWeight: 600,
									fontSize: '11px',
								}}
							>
								Online
							</Typography>
						</Box>
					</Box>

					<Typography
						variant="caption"
						sx={{
							color: 'text.secondary',
							fontSize: '12px',
							display: 'block',
							mt: 0.25,
						}}
					>
						Your AI Healthcare Assistant
					</Typography>
				</Box>
			</Box>

			{/* Control actions */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
				{showHistoryButton && (
					<IconButton
						onClick={onToggleHistory}
						size="small"
						sx={{
							color: 'text.secondary',
							p: 0.75,
							'&:hover': { bgcolor: 'action.hover' },
						}}
						title="Chat History"
					>
						<HistoryIcon fontSize="small" />
					</IconButton>
				)}
				<IconButton
					onClick={onNewChat}
					size="small"
					sx={{
						color: 'text.secondary',
						p: 0.75,
						'&:hover': { bgcolor: 'action.hover' },
					}}
					title="New Chat"
				>
					<RefreshIcon fontSize="small" />
				</IconButton>
				<IconButton
					onClick={onClose}
					size="small"
					sx={{
						color: 'text.secondary',
						p: 0.75,
						'&:hover': { bgcolor: 'action.hover' },
					}}
					title="Close"
				>
					<CloseIcon fontSize="small" />
				</IconButton>
			</Box>
		</Box>
	)
}
