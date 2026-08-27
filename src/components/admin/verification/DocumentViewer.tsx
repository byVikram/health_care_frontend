// src/components/admin/verification/DocumentViewer.tsx
import { useState } from 'react'
import {
	Box,
	Stack,
	Typography,
	IconButton,
	Tooltip,
	Dialog,
	Divider,
} from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description'
import SearchIcon from '@mui/icons-material/Search'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CloseIcon from '@mui/icons-material/Close'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'

import { buildS3Url } from '../../../utils/s3'
import { VerificationDocumentItem } from './DocumentRail'

interface DocumentViewerProps {
	documents?: VerificationDocumentItem[]
	activeDocument: VerificationDocumentItem | null
}

export default function DocumentViewer({ activeDocument }: DocumentViewerProps) {
	const [fullscreen, setFullscreen] = useState(false)
	const [zoom, setZoom] = useState(100)
	const [page, setPage] = useState(1)

	const s3Url = activeDocument ? buildS3Url(activeDocument.url) : undefined
	const isImage = s3Url ? /\.(png|jpe?g|webp|gif)$/i.test(s3Url) : false

	const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250))
	const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
	const handleResetZoom = () => setZoom(100)

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff', p: 2 }}>
			{/* Document Title Header - Compact */}
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, minWidth: 0 }}>
				<Box
					sx={{
						width: 24,
						height: 24,
						borderRadius: '5px',
						bgcolor: '#0d9488',
						color: '#ffffff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<DescriptionIcon sx={{ fontSize: 15 }} />
				</Box>
				<Typography variant="body2" fontWeight={800} color="#0f172a" noWrap sx={{ fontSize: '13.5px' }}>
					{activeDocument ? activeDocument.name : 'No Document Selected'}
				</Typography>
			</Stack>

			{/* Main Document Inspection Canvas with Dashed Rounded Container */}
			<Box
				sx={{
					flex: 1,
					minHeight: 280,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					position: 'relative',
					overflow: 'hidden',
					bgcolor: '#f8fafc',
					borderRadius: '12px',
					border: '1.5px dashed #cbd5e1',
					p: 2,
					mb: 1.5,
				}}
			>
				{s3Url ? (
					isImage ? (
						<Box
							sx={{
								width: '100%',
								height: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								overflow: 'auto',
								p: 1,
							}}
						>
							<Box
								component="img"
								src={s3Url}
								alt={activeDocument?.name || 'Document'}
								sx={{
									maxWidth: '100%',
									maxHeight: '100%',
									objectFit: 'contain',
									borderRadius: '6px',
									boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
									bgcolor: '#ffffff',
									border: '1px solid #e2e8f0',
									transform: `scale(${zoom / 100})`,
									transformOrigin: 'center center',
									transition: 'transform 0.15s ease',
								}}
							/>
						</Box>
					) : (
						<Box
							sx={{
								width: '100%',
								height: '100%',
								borderRadius: '6px',
								overflow: 'hidden',
								bgcolor: '#ffffff',
								boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
								border: '1px solid #e2e8f0',
							}}
						>
							<Box
								component="iframe"
								src={s3Url}
								title={activeDocument?.name || 'Document Inspector'}
								sx={{
									width: '100%',
									height: '100%',
									border: 'none',
									bgcolor: '#ffffff',
								}}
							/>
						</Box>
					)
				) : (
					/* Centered Empty State */
					<Stack alignItems="center" justifyContent="center" spacing={1} sx={{ textAlign: 'center', maxWidth: 320, p: 1.5 }}>
						<Box
							sx={{
								width: 52,
								height: 58,
								borderRadius: '12px',
								bgcolor: '#f0fdfa',
								border: '1.5px solid #99f6e4',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: '#0d9488',
								mb: 0.25,
							}}
						>
							<InsertDriveFileOutlinedIcon sx={{ fontSize: 28 }} />
						</Box>
						<Typography variant="body2" fontWeight={800} color="#0f172a" sx={{ fontSize: '13.5px' }}>
							No document available for inspection.
						</Typography>
						<Typography variant="caption" color="#64748b" sx={{ fontSize: '11.5px', lineHeight: 1.35 }}>
							The uploaded document will appear here once available.
						</Typography>
					</Stack>
				)}
			</Box>

			{/* Bottom Segmented Toolbar - Compact */}
			<Stack direction="row" justifyContent="center" alignItems="center">
				<Box
					sx={{
						display: 'inline-flex',
						alignItems: 'center',
						bgcolor: '#ffffff',
						border: '1px solid #e2e8f0',
						borderRadius: '8px',
						p: 0.25,
						gap: 0.25,
						boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
					}}
				>
					<Tooltip title="Search / Zoom In">
						<span>
							<IconButton size="small" onClick={handleZoomIn} sx={{ color: '#64748b', p: 0.5 }}>
								<SearchIcon sx={{ fontSize: 14 }} />
							</IconButton>
						</span>
					</Tooltip>
					<Tooltip title="Reset Zoom">
						<span>
							<IconButton size="small" onClick={handleResetZoom} sx={{ color: '#64748b', p: 0.5 }}>
								<ZoomInIcon sx={{ fontSize: 14 }} />
							</IconButton>
						</span>
					</Tooltip>

					<Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5, borderColor: '#e2e8f0' }} />

					<Tooltip title="Previous Page">
						<span>
							<IconButton size="small" disabled={page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))} sx={{ color: '#64748b', p: 0.5 }}>
								<NavigateBeforeIcon sx={{ fontSize: 16 }} />
							</IconButton>
						</span>
					</Tooltip>

					<Typography variant="caption" fontWeight={700} color="#0f172a" sx={{ px: 0.75, fontSize: '11px' }}>
						{page} / 1
					</Typography>

					<Tooltip title="Next Page">
						<span>
							<IconButton size="small" disabled={page >= 1} onClick={() => setPage((p) => p + 1)} sx={{ color: '#64748b', p: 0.5 }}>
								<NavigateNextIcon sx={{ fontSize: 16 }} />
							</IconButton>
						</span>
					</Tooltip>

					<Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5, borderColor: '#e2e8f0' }} />

					<Tooltip title="Zoom Out">
						<span>
							<IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50} sx={{ color: '#64748b', p: 0.5 }}>
								<RemoveIcon sx={{ fontSize: 14 }} />
							</IconButton>
						</span>
					</Tooltip>
					<Tooltip title="Zoom In">
						<span>
							<IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 250} sx={{ color: '#64748b', p: 0.5 }}>
								<AddIcon sx={{ fontSize: 14 }} />
							</IconButton>
						</span>
					</Tooltip>

					<Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5, borderColor: '#e2e8f0' }} />

					{s3Url ? (
						<Tooltip title="Open Original Document">
							<IconButton
								size="small"
								component="a"
								href={s3Url}
								target="_blank"
								rel="noreferrer"
								sx={{ color: '#0d9488', p: 0.5 }}
							>
								<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
							</IconButton>
						</Tooltip>
					) : (
						<Tooltip title="Download Document">
							<span>
								<IconButton size="small" disabled sx={{ color: '#cbd5e1', p: 0.5 }}>
									<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
								</IconButton>
							</span>
						</Tooltip>
					)}
				</Box>
			</Stack>

			{/* Fullscreen Inspector Modal */}
			<Dialog open={fullscreen} onClose={() => setFullscreen(false)} maxWidth="xl" fullWidth fullScreen>
				<Box sx={{ height: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
						sx={{ px: 2, py: 1.25, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}
					>
						<Stack direction="row" spacing={1.25} alignItems="center">
							<DescriptionIcon sx={{ color: '#0d9488', fontSize: 18 }} />
							<Typography variant="subtitle2" fontWeight={800} color="#0f172a">
								{activeDocument?.name}
							</Typography>
						</Stack>
						<IconButton onClick={() => setFullscreen(false)} sx={{ color: '#64748b', '&:hover': { color: '#0f172a' } }}>
							<CloseIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Stack>
					<Box sx={{ flex: 1, bgcolor: '#f1f5f9', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
						{s3Url &&
							(isImage ? (
								<Box
									component="img"
									src={s3Url}
									alt={activeDocument?.name}
									sx={{
										maxWidth: '100%',
										maxHeight: '100%',
										objectFit: 'contain',
										borderRadius: '8px',
										boxShadow: '0 4px 20px rgba(15,23,42,0.1)',
										border: '1px solid #e2e8f0',
										bgcolor: '#ffffff',
										p: 1.5,
									}}
								/>
							) : (
								<Box
									component="iframe"
									src={s3Url}
									title="Fullscreen Document"
									sx={{
										width: '100%',
										height: '100%',
										border: 'none',
										borderRadius: '8px',
										boxShadow: '0 4px 20px rgba(15,23,42,0.1)',
										bgcolor: '#ffffff',
									}}
								/>
							))}
					</Box>
				</Box>
			</Dialog>
		</Box>
	)
}
