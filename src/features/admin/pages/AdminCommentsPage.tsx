// src/features/admin/pages/AdminCommentsPage.tsx
import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Card,
	CardContent,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	IconButton,
	Tooltip,
	CircularProgress,
	Stack,
	Chip,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FlagIcon from '@mui/icons-material/Flag'
import BlockIcon from '@mui/icons-material/Block'
import RefreshIcon from '@mui/icons-material/Refresh'

import { listPendingComments, approveComment, moderateComment, AdminCommentItem } from '../adminService'
import { toast } from 'react-toastify'

export default function AdminCommentsPage() {
	const [comments, setComments] = useState<AdminCommentItem[]>([])
	const [loading, setLoading] = useState(true)

	const fetchComments = async () => {
		setLoading(true)
		try {
			const res = await listPendingComments()
			setComments(res.data)
		} catch (err) {
			console.error('Error fetching comments moderation queue:', err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchComments()
	}, [])

	const handleApprove = async (id: string) => {
		try {
			await approveComment(id)
			toast.success('Comment approved & published!')
			setComments((prev) => prev.filter((c) => c.id !== id))
		} catch (err) {
			console.error('Error approving comment:', err)
		}
	}

	const handleModerate = async (id: string, status: 'approved' | 'flagged' | 'hidden') => {
		try {
			await moderateComment(id, status)
			toast.success(`Comment marked as ${status}`)
			setComments((prev) => prev.filter((c) => c.id !== id))
		} catch (err) {
			console.error('Error moderating comment:', err)
		}
	}

	return (
		<Box sx={{ p: 1 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
				<Box>
					<Typography variant="h5" fontWeight={800} color="#0f172a">
						Comment Moderation Queue
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Review and approve patient blog comments to maintain medical safety and compliance guidelines.
					</Typography>
				</Box>
				<IconButton onClick={fetchComments} sx={{ color: '#0d9488' }}>
					<RefreshIcon />
				</IconButton>
			</Stack>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
				</Box>
			) : comments.length === 0 ? (
				<Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', py: 8, textAlign: 'center' }}>
					<Typography variant="body1" color="text.secondary" fontWeight={600}>
						No comments pending moderation
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						All user comments have been processed.
					</Typography>
				</Card>
			) : (
				<TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
					<Table sx={{ minWidth: 650 }}>
						<TableHead sx={{ bgcolor: '#f8fafc' }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>User Info</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Comment Content</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Blog Post</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Submitted At</TableCell>
								<TableCell align="right" sx={{ fontWeight: 700, color: '#475569', pr: 3 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{comments.map((comment) => (
								<TableRow key={comment.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell>
										<Typography variant="subtitle2" fontWeight={700}>
											{comment.user_name}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{comment.user_email}
										</Typography>
									</TableCell>
									<TableCell sx={{ maxWidth: 300 }}>
										<Typography variant="body2" sx={{ color: '#334155', wordBreak: 'break-word' }}>
											{comment.content}
										</Typography>
									</TableCell>
									<TableCell>
										<Chip
											label={comment.post_title}
											size="small"
											sx={{ bgcolor: 'rgba(13, 148, 136, 0.08)', color: '#0d9488', fontWeight: 600, maxWidth: 200 }}
										/>
									</TableCell>
									<TableCell>
										<Typography variant="caption" color="text.secondary">
											{new Date(comment.created_at).toLocaleString()}
										</Typography>
									</TableCell>
									<TableCell align="right" sx={{ pr: 3 }}>
										<Stack direction="row" spacing={1} justifyContent="flex-end">
											<Tooltip title="Approve & Publish">
												<Button
													variant="contained"
													color="success"
													size="small"
													onClick={() => handleApprove(comment.id)}
													startIcon={<CheckCircleIcon />}
													sx={{ textTransform: 'none', borderRadius: 2 }}
												>
													Approve
												</Button>
											</Tooltip>
											<Tooltip title="Flag Comment">
												<IconButton
													color="warning"
													size="small"
													onClick={() => handleModerate(comment.id, 'flagged')}
													sx={{ border: '1px solid', borderColor: 'warning.light', borderRadius: 2 }}
												>
													<FlagIcon fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title="Hide Comment">
												<IconButton
													color="error"
													size="small"
													onClick={() => handleModerate(comment.id, 'hidden')}
													sx={{ border: '1px solid', borderColor: 'error.light', borderRadius: 2 }}
												>
													<BlockIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Stack>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Box>
	)
}
