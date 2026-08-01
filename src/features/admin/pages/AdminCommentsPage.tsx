// src/features/admin/pages/AdminCommentsPage.tsx
import { useEffect, useState } from 'react'
import { Box, Typography, Stack, Chip, Tooltip, IconButton, Avatar, CircularProgress } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FlagIcon from '@mui/icons-material/Flag'
import BlockIcon from '@mui/icons-material/Block'
import RefreshIcon from '@mui/icons-material/Refresh'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'

import AppTable, { Column } from '../../../components/common/Table/AppTable'
import StatusBadge from '../../../components/admin/StatusBadge'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import SectionCard from '../../../components/common/Card/SectionCard'
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

	const columns: Column<AdminCommentItem>[] = [
		{
			field: 'user_name',
			label: 'Author',
			render: (_, comment) => (
				<Stack direction="row" spacing={1.25} alignItems="center">
					<Avatar
						sx={{ width: 32, height: 32, bgcolor: 'rgba(13,148,136,0.12)', color: '#0d9488', fontSize: 12, fontWeight: 800, flexShrink: 0 }}
					>
						{(comment.user_name || 'U').substring(0, 1).toUpperCase()}
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
							{comment.user_name}
						</Typography>
						<Typography variant="caption" color="text.secondary" noWrap>
							{comment.user_email}
						</Typography>
					</Box>
				</Stack>
			),
		},
		{
			field: 'content',
			label: 'Comment',
			render: (_, comment) => (
				<Tooltip title={comment.content} placement="top" arrow>
					<Typography
						variant="body2"
						sx={{
							color: '#334155',
							maxWidth: 300,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							cursor: 'help',
						}}
					>
						{comment.content}
					</Typography>
				</Tooltip>
			),
		},
		{
			field: 'post_title',
			label: 'Blog Post',
			render: (_, comment) => (
				<Chip
					label={comment.post_title}
					size="small"
					sx={{
						bgcolor: 'rgba(13,148,136,0.08)',
						color: '#0d9488',
						fontWeight: 600,
						fontSize: '0.68rem',
						maxWidth: 180,
						borderRadius: '6px',
					}}
				/>
			),
		},
		{
			field: 'created_at',
			label: 'Submitted',
			render: (_, comment) => (
				<Typography variant="caption" color="text.secondary">
					{new Date(comment.created_at).toLocaleDateString('en-IN', {
						day: 'numeric',
						month: 'short',
						year: 'numeric',
					})}
				</Typography>
			),
		},
		{
			field: 'actions',
			label: 'Moderation',
			align: 'right',
			render: (_, comment) => (
				<Stack direction="row" spacing={0.75} justifyContent="flex-end">
					<Tooltip title="Approve & Publish">
						<IconButton
							size="small"
							onClick={() => handleApprove(comment.id)}
							sx={{
								border: '1px solid #bbf7d0',
								borderRadius: 1.5,
								color: '#16a34a',
								bgcolor: '#f0fdf4',
								'&:hover': { bgcolor: '#dcfce7' },
							}}
						>
							<CheckCircleIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Flag Comment">
						<IconButton
							size="small"
							onClick={() => handleModerate(comment.id, 'flagged')}
							sx={{
								border: '1px solid #fed7aa',
								borderRadius: 1.5,
								color: '#ea580c',
								bgcolor: '#fff7ed',
								'&:hover': { bgcolor: '#ffedd5' },
							}}
						>
							<FlagIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Hide Comment">
						<IconButton
							size="small"
							onClick={() => handleModerate(comment.id, 'hidden')}
							sx={{
								border: '1px solid #fecaca',
								borderRadius: 1.5,
								color: '#dc2626',
								bgcolor: '#fff1f2',
								'&:hover': { bgcolor: '#fee2e2' },
							}}
						>
							<BlockIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
				</Stack>
			),
		},
	]

	return (
		<Box>
			<AdminPageHeader
				title="Comment Moderation"
				subtitle="Review and approve patient blog comments to maintain medical safety and compliance guidelines."
				count={comments.length}
				countLabel="pending"
				actions={
					<Tooltip title="Refresh queue">
						<IconButton
							onClick={fetchComments}
							sx={{
								border: '1px solid #e2e8f0',
								borderRadius: 1.5,
								color: '#0d9488',
								'&:hover': { bgcolor: 'rgba(13,148,136,0.08)' },
							}}
						>
							<RefreshIcon />
						</IconButton>
					</Tooltip>
				}
			/>

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading moderation queue...
					</Typography>
				</Stack>
			) : comments.length === 0 ? (
				<AdminEmptyState
					icon={<ChatBubbleIcon />}
					title="Comment queue is clear"
					description="All user comments have been processed. No pending reviews at this time."
				/>
			) : (
				<AppTable<AdminCommentItem>
					columns={columns}
					rows={comments}
					emptyMessage="No comments pending moderation"
				/>
			)}
		</Box>
	)
}
