// src/features/admin/pages/AdminReviewsPage.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	Box,
	Grid,
	Stack,
	Typography,
	Avatar,
	Tabs,
	Tab,
	Button,
	CircularProgress,
	Rating,
	InputAdornment,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
// import StarIcon from '@mui/icons-material/Star'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import RateReviewIcon from '@mui/icons-material/RateReview'

import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AdminStatCard from '../../../components/admin/AdminStatCard'
import AdminEmptyState from '../../../components/admin/AdminEmptyState'
import StatusBadge from '../../../components/admin/StatusBadge'
import PaginationBar from '../../../pagination/Pagination'
import { toast } from 'react-toastify'
import {
	listReviews,
	updateReviewStatus,
	AdminReviewItem,
	ReviewStatus,
} from '../adminService'

const STATUS_TABS: { label: string; value: ReviewStatus | '' }[] = [
	{ label: 'All', value: '' },
	{ label: 'Pending', value: 'pending' },
	{ label: 'Approved', value: 'approved' },
	{ label: 'Rejected', value: 'hidden' },
]

const SORT_OPTIONS = [
	{ value: 'newest', label: 'Newest First' },
	{ value: 'oldest', label: 'Oldest First' },
]

function ReviewCard({
	review,
	onUpdateStatus,
}: {
	review: AdminReviewItem
	onUpdateStatus: (id: string, status: ReviewStatus) => Promise<void>
}) {
	const [actingStatus, setActingStatus] = useState<ReviewStatus | null>(null)

	const handleAction = async (status: ReviewStatus) => {
		setActingStatus(status)
		try {
			await onUpdateStatus(review.id, status)
		} finally {
			setActingStatus(null)
		}
	}

	const isRejected = review.status === 'hidden' || review.status === 'deleted'

	return (
		<Box
			sx={{
				bgcolor: '#ffffff',
				borderRadius: '14px',
				border: '1px solid #e2e8f0',
				p: 2.5,
				opacity: isRejected ? 0.75 : 1,
			}}
		>
			<Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
				<Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
					<Avatar sx={{ width: 38, height: 38, bgcolor: '#f1f5f9', color: '#94a3b8' }}>
						<PersonIcon />
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
							<Typography variant="subtitle2" fontWeight={800} color="#0f172a">
								{review.patient_name || 'Patient'}
							</Typography>
							<StatusBadge
								status={isRejected ? 'rejected' : review.status}
								label={isRejected ? 'REJECTED' : undefined}
							/>
						</Stack>
						<Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
							Reviewing: Dr. {review.doctor_name || 'Doctor'}
							{review.hospital_name ? ` (${review.hospital_name})` : ''}
						</Typography>
					</Box>
				</Stack>
				<Box sx={{ textAlign: 'right', flexShrink: 0 }}>
					<Rating value={review.rating} readOnly size="small" />
					<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
						{review.review_date ? new Date(review.review_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
					</Typography>
				</Box>
			</Stack>

			{review.comment && (
				<Typography
					variant="body2"
					sx={{ mt: 1.75, color: '#334155', fontStyle: 'italic', lineHeight: 1.6, fontSize: 13.5 }}
				>
					"{review.comment}"
				</Typography>
			)}

			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={{ mt: 2, pt: 1.75, borderTop: '1px solid #f1f5f9' }}
			>
				<Typography
					variant="caption"
					sx={{ fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.65rem' }}
				>
					Moderation Actions
				</Typography>
				<Stack direction="row" spacing={1}>
					<Button
						size="small"
						onClick={() => handleAction('approved')}
						disabled={review.status === 'approved' || actingStatus !== null}
						startIcon={actingStatus === 'approved' ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />}
						sx={{
							textTransform: 'none',
							fontSize: 12,
							fontWeight: 700,
							borderRadius: '8px',
							px: 2,
							color: '#15803d',
							bgcolor: '#f0fdf4',
							border: '1px solid #bbf7d0',
							'&:hover': { bgcolor: '#dcfce7' },
						}}
					>
						Approve
					</Button>
					<Button
						size="small"
						onClick={() => handleAction('hidden')}
						disabled={isRejected || actingStatus !== null}
						startIcon={actingStatus === 'hidden' ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <HighlightOffIcon sx={{ fontSize: 15 }} />}
						sx={{
							textTransform: 'none',
							fontSize: 12,
							fontWeight: 700,
							borderRadius: '8px',
							px: 2,
							color: '#dc2626',
							bgcolor: '#fff1f2',
							border: '1px solid #fecaca',
							'&:hover': { bgcolor: '#fee2e2' },
						}}
					>
						Reject
					</Button>
				</Stack>
			</Stack>
		</Box>
	)
}

export default function AdminReviewsPage() {
	const [reviews, setReviews] = useState<AdminReviewItem[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [statusFilter, setStatusFilter] = useState<ReviewStatus | ''>('pending')
	const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
	const [searchInput, setSearchInput] = useState('')
	const [searchQuery, setSearchQuery] = useState('')
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)

	const fetchReviews = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await listReviews({
				page,
				pageSize,
				search: searchQuery || undefined,
				status: statusFilter || undefined,
				sortOrder,
			})
			if (res.success && res.data) {
				setReviews(res.data.items)
				setTotal(res.data.total)
			}
		} catch (err) {
			console.error('Error fetching reviews:', err)
			setError('Failed to load reviews. Please try again.')
		} finally {
			setLoading(false)
		}
	}, [page, pageSize, searchQuery, statusFilter, sortOrder])

	useEffect(() => {
		fetchReviews()
	}, [fetchReviews])

	// Debounced search - resets to page 1 on new query
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			setPage(1)
			setSearchQuery(searchInput)
		}, 400)
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
		
	}, [searchInput])

	const handleUpdateStatus = async (id: string, status: ReviewStatus) => {
		try {
			await updateReviewStatus(id, status)
			toast.success(
				status === 'approved' ? 'Review approved & published!' : 'Review rejected (removed from public view).'
			)
			setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
		} catch (err) {
			console.error('Error updating review status:', err)
		}
	}

	const pendingCount = reviews.filter((r) => r.status === 'pending').length
	const approvedCount = reviews.filter((r) => r.status === 'approved').length

	const pageCount = Math.max(1, Math.ceil(total / pageSize))

	return (
		<Box>
			<AdminPageHeader
				title="Patient Reviews"
				subtitle="Moderate patient reviews submitted for doctors across the platform. Only approved reviews are visible to the public."
				count={total}
				countLabel="reviews"
				actions={
					<Button
						onClick={fetchReviews}
						startIcon={<RefreshIcon sx={{ fontSize: 17 }} />}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							fontSize: 13,
							color: '#0d9488',
							border: '1px solid #e2e8f0',
							borderRadius: '8px',
							'&:hover': { bgcolor: 'rgba(13,148,136,0.08)' },
						}}
					>
						Refresh
					</Button>
				}
			/>

			<Grid container spacing={2.5} sx={{ mb: 3.5 }}>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard
						label="Total Reviews"
						value={total.toLocaleString()}
						icon={<RateReviewIcon />}
						iconColor="#0d9488"
						iconBg="rgba(13,148,136,0.12)"
						description="Across the current filter"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard
						label="Awaiting Review"
						value={pendingCount.toLocaleString()}
						icon={<HourglassEmptyIcon />}
						iconColor="#b45309"
						iconBg="rgba(180,83,9,0.12)"
						description="On this page - need moderation"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard
						label="Approved Reviews"
						value={approvedCount.toLocaleString()}
						icon={<CheckCircleOutlineIcon />}
						iconColor="#15803d"
						iconBg="rgba(21,128,61,0.12)"
						description="On this page - approved"
					/>
				</Grid>
			</Grid>

			<Stack spacing={2} sx={{ mb: 2.5 }}>
				<Tabs
					value={statusFilter}
					onChange={(_, v) => {
						setStatusFilter(v)
						setPage(1)
					}}
					sx={{
						minHeight: 38,
						'& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13, minHeight: 38, py: 0 },
						'& .Mui-selected': { color: '#0d9488 !important' },
						'& .MuiTabs-indicator': { bgcolor: '#0d9488', height: 2 },
					}}
				>
					{STATUS_TABS.map((t) => (
						<Tab key={t.label} value={t.value} label={t.label} />
					))}
				</Tabs>

				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
					<Box sx={{ maxWidth: 360, width: '100%' }}>
						<AppInput
							fullWidth
							size="small"
							placeholder="Search patient, doctor, hospital..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
									</InputAdornment>
								),
							}}
							sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
						/>
					</Box>
					<AppSelect
						fullWidth={false}
						size="small"
						value={sortOrder}
						onChange={(e) => {
							setSortOrder(e.target.value as 'newest' | 'oldest')
							setPage(1)
						}}
						options={SORT_OPTIONS}
						sx={{
							width: { xs: '100%', sm: 180 },
							ml: { sm: 'auto' },
							flexShrink: 0,
						}}
					/>
				</Stack>
			</Stack>

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
						Loading reviews...
					</Typography>
				</Stack>
			) : error ? (
				<AdminEmptyState
					icon={<RateReviewIcon />}
					title="Something went wrong"
					description={error}
					action={
						<Button
							onClick={fetchReviews}
							sx={{ textTransform: 'none', fontWeight: 700, color: '#0d9488' }}
						>
							Try again
						</Button>
					}
				/>
			) : reviews.length === 0 ? (
				<AdminEmptyState
					icon={<RateReviewIcon />}
					title="No reviews found"
					description={
						searchQuery || statusFilter
							? 'No reviews match the current search or filter.'
							: 'No patient reviews have been submitted yet.'
					}
				/>
			) : (
				<>
					<Stack spacing={2}>
						{reviews.map((review) => (
							<ReviewCard key={review.id} review={review} onUpdateStatus={handleUpdateStatus} />
						))}
					</Stack>

					{total > 0 && (
						<Box sx={{ mt: 2.5 }}>
							<PaginationBar
								page={page}
								pageSize={pageSize}
								totalRows={total}
								pageSizeOptions={[10, 20, 50]}
								onPageChange={setPage}
								onPageSizeChange={(size) => {
									setPageSize(size)
									setPage(1)
								}}
							/>
						</Box>
					)}
				</>
			)}
		</Box>
	)
}
