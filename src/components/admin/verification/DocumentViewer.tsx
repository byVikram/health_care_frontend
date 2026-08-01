// src/components/admin/verification/DocumentViewer.tsx
import { useState } from 'react'
import {
	Box,
	Stack,
	Typography,
	IconButton,
	Tooltip,
	Dialog,
} from '@mui/material'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CloseIcon from '@mui/icons-material/Close'
import DescriptionIcon from '@mui/icons-material/Description'

import { buildS3Url } from '../../../utils/s3'
import { VerificationDocumentItem } from './DocumentRail'

interface DocumentViewerProps {
	documents?: VerificationDocumentItem[]
	activeDocument: VerificationDocumentItem | null
}

export default function DocumentViewer({ activeDocument }: DocumentViewerProps) {
	const [fullscreen, setFullscreen] = useState(false)

	const s3Url = activeDocument ? buildS3Url(activeDocument.url) : undefined
	const isImage = s3Url ? /\.(png|jpe?g|webp|gif)$/i.test(s3Url) : false

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0f172a' }}>
			{/* Top Header Bar */}
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ px: 2, py: 1.25, borderBottom: '1px solid #1e293b', bgcolor: '#1e293b' }}
			>
				<Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
					<DescriptionIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />
					<Typography variant="body2" fontWeight={800} color="#ffffff" noWrap>
						{activeDocument ? activeDocument.name : 'No Document Selected'}
					</Typography>
				</Stack>

				{/* Header Actions */}
				<Stack direction="row" spacing={1} alignItems="center">
					{s3Url && (
						<>
							<Tooltip title="Open in new window">
								<IconButton
									size="small"
									component="a"
									href={s3Url}
									target="_blank"
									rel="noreferrer"
									sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
								>
									<OpenInNewIcon fontSize="small" />
								</IconButton>
							</Tooltip>

							<Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen Inspector'}>
								<IconButton
									size="small"
									onClick={() => setFullscreen((prev) => !prev)}
									sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
								>
									{fullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
								</IconButton>
							</Tooltip>
						</>
					)}
				</Stack>
			</Stack>

			{/* Main Inspection Canvas */}
			<Box
				sx={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					position: 'relative',
					overflow: 'hidden',
					bgcolor: '#090d16',
				}}
			>
				{s3Url ? (
					isImage ? (
						<Box
							component="img"
							src={s3Url}
							alt={activeDocument?.name || 'Document'}
							sx={{
								maxWidth: '100%',
								maxHeight: '100%',
								objectFit: 'contain',
								p: 2,
								boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
								borderRadius: '4px',
							}}
						/>
					) : (
						<Box
							component="iframe"
							src={s3Url}
							title={activeDocument?.name || 'Document PDF Inspector'}
							sx={{
								width: '100%',
								height: '100%',
								border: 'none',
								bgcolor: '#ffffff',
							}}
						/>
					)
				) : (
					<Typography variant="body2" color="#64748b">
						No document available for inspection.
					</Typography>
				)}
			</Box>

			{/* Fullscreen Inspector Modal */}
			<Dialog open={fullscreen} onClose={() => setFullscreen(false)} maxWidth="xl" fullWidth fullScreen>
				<Box sx={{ height: '100vh', bgcolor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: '1px solid #1e293b', bgcolor: '#1e293b' }}>
						<Typography variant="h6" fontWeight={800} color="#ffffff">
							{activeDocument?.name}
						</Typography>
						<IconButton onClick={() => setFullscreen(false)} sx={{ color: '#ffffff' }}>
							<CloseIcon />
						</IconButton>
					</Stack>
					<Box sx={{ flex: 1, bgcolor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						{s3Url &&
							(isImage ? (
								<Box component="img" src={s3Url} alt={activeDocument?.name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
							) : (
								<Box component="iframe" src={s3Url} title="Fullscreen Document" sx={{ width: '100%', height: '100%', border: 'none' }} />
							))}
					</Box>
				</Box>
			</Dialog>
		</Box>
	)
}
