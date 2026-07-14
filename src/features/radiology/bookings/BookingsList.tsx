// src/features/radiology/bookings/BookingsList.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Typography, Avatar, CircularProgress, Chip, Pagination } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import FilterListIcon from '@mui/icons-material/FilterList'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useNavigate } from 'react-router-dom'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppTable from '../../../components/common/Table/AppTable'
import { getRadiologyBookings, RadiologyBooking } from '../radiologyService'
import { formatINR } from '../../../utils/Utils'
import { useAuth } from '../../../hooks/useAuth'
import { USER_ROLES } from '../../../constants/constants'

interface BookingRow extends Record<string, unknown> {
	id: string
	patientName: string
	patientAvatar: string
	radiologyName: string
	scansList: string
	date: string
	time: string
	rawDate: string
	totalCost: number | null
	prescriptionVerified: boolean
	status: string
}

interface BookingMeta {
	total: number
	page: number
	limit: number
	pages: number
}

const formatDateTime = (isoString: string) => {
	const dateObj = new Date(isoString)
	return {
		date: dateObj.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		}),
		time: dateObj.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		}),
	}
}

const getStatusLabel = (status: string) => {
	switch (status.toLowerCase()) {
		case 'pending_quote':
			return 'Pending Quote'
		case 'pending_payment':
			return 'Pending Payment'
		case 'confirmed':
			return 'Confirmed'
		case 'completed':
			return 'Completed'
		case 'cancelled':
			return 'Cancelled'
		default:
			return status
	}
}

const getStatusChipSx = (status: string) => {
	switch (status.toLowerCase()) {
		case 'pending_quote':
			return { bgcolor: '#FEF3C7', color: '#D97706' }
		case 'pending_payment':
			return { bgcolor: '#EEF2FF', color: '#4F46E5' }
		case 'confirmed':
			return { bgcolor: '#CCFBF1', color: '#0D9488' }
		case 'completed':
			return { bgcolor: '#DCFCE7', color: '#16A34A' }
		case 'cancelled':
			return { bgcolor: '#FEE2E2', color: '#DC2626' }
		default:
			return { bgcolor: '#F5F5F5', color: '#616161' }
	}
}

export default function BookingsList() {
	const navigate = useNavigate()
	const { role } = useAuth()
	const isRadiologyViewer = role === USER_ROLES.RADIOLOGY

	const [allBookings, setAllBookings] = useState<BookingRow[]>([])
	const [bookings, setBookings] = useState<BookingRow[]>([])
	const [loading, setLoading] = useState(false)

	const [search, setSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')

	const [page, setPage] = useState(1)
	const [limit] = useState(10)

	const [dateFilter, setDateFilter] = useState('')
	const [statusFilter, setStatusFilter] = useState('')

	const [meta, setMeta] = useState<BookingMeta>({
		total: 0,
		page: 1,
		limit: 10,
		pages: 0,
	})

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search)
		}, 500)
		return () => clearTimeout(timer)
	}, [search])

	const fetchBookings = useCallback(async () => {
		try {
			setLoading(true)
			const response = await getRadiologyBookings()
			const mappedBookings: BookingRow[] = response.data.map((booking: RadiologyBooking) => {
				const { date, time } = formatDateTime(booking.created_at)
				const scanNames = booking.booking_items
					.map((item) => item.custom_scan_name || item.radiology_scan.scan_type.name)
					.join(', ')

				return {
					id: booking.public_id,
					patientName: booking.patient_name || '-',
					patientAvatar: '', // Backend patient model has avatar_s3_key if needed
					radiologyName: booking.radiology_name || '-',
					scansList: scanNames || 'No Scans Configured',
					date,
					time,
					rawDate: booking.created_at,
					totalCost: booking.total_price,
					prescriptionVerified: booking.prescription_verified,
					status: booking.status,
				}
			})
			setAllBookings(mappedBookings)
		} catch (error) {
			console.error('Failed to fetch bookings', error)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchBookings()
	}, [fetchBookings])

	useEffect(() => {
		const filtered = allBookings.filter((row) => {
			const matchesSearch =
				!debouncedSearch ||
				row.patientName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				row.radiologyName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				row.scansList.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				(row.totalCost && String(row.totalCost).includes(debouncedSearch))
			const matchesDate = !dateFilter || row.date === dateFilter
			const matchesStatus = !statusFilter || row.status.toLowerCase() === statusFilter.toLowerCase()
			return matchesSearch && matchesDate && matchesStatus
		})

		const total = filtered.length
		const pages = Math.ceil(total / limit) || 1
		const start = (page - 1) * limit
		const paginated = filtered.slice(start, start + limit)

		setBookings(paginated)
		setMeta({ total, page, limit, pages })
	}, [allBookings, debouncedSearch, dateFilter, statusFilter, page, limit])

	// Derive available dates from all bookings
	const availableDates = useMemo(() => {
		const dates = [...new Set(allBookings.map((row) => row.date))]
		return dates.map((d) => ({ value: d, label: d }))
	}, [allBookings])

	const statusOptions = [
		{ value: '', label: 'All Statuses' },
		{ value: 'pending_quote', label: 'Pending Quote' },
		{ value: 'pending_payment', label: 'Pending Payment' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' },
	]

	const columns = useMemo(
		() => [
			{
				field: 'patientName',
				label: isRadiologyViewer ? 'Patient Name' : 'Radiology Center',
				render: (_: unknown, row: BookingRow) => (
					<Box
						onClick={() => navigate(`/radiology/bookings/${row.id}`)}
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
							cursor: 'pointer',
							mx: -2,
							px: 2,
							py: 1,
						}}
					>
						<Avatar src={row.patientAvatar} sx={{ width: 36, height: 36, fontSize: 14 }}>
							{(isRadiologyViewer ? row.patientName : row.radiologyName)?.charAt(0)}
						</Avatar>
						<Typography fontSize={13} fontWeight={600}>
							{isRadiologyViewer ? row.patientName : row.radiologyName}
						</Typography>
					</Box>
				),
			},
			{
				field: 'scansList',
				label: 'Scans Requested',
				render: (_: unknown, row: BookingRow) => (
					<Box onClick={() => navigate(`/radiology/bookings/${row.id}`)} sx={{ cursor: 'pointer', maxWidth: 250 }}>
						<Typography fontSize={13} noWrap color="text.primary" fontWeight={500}>
							{row.scansList}
						</Typography>
					</Box>
				),
			},
			{
				field: 'totalCost',
				label: 'Total Cost',
				render: (_: unknown, row: BookingRow) => (
					<Box onClick={() => navigate(`/radiology/bookings/${row.id}`)} sx={{ cursor: 'pointer' }}>
						<Typography fontSize={13} fontWeight={600}>
							{row.totalCost !== null ? formatINR(row.totalCost) : 'Quote Required'}
						</Typography>
					</Box>
				),
			},
			{
				field: 'date',
				label: 'Booking Date & Time',
				render: (_: unknown, row: BookingRow) => (
					<Box onClick={() => navigate(`/radiology/bookings/${row.id}`)} sx={{ cursor: 'pointer' }}>
						<Typography fontSize={13}>{row.date}</Typography>
						<Typography fontSize={11} color="text.secondary">
							{row.time}
						</Typography>
					</Box>
				),
			},
			{
				field: 'prescriptionVerified',
				label: 'Prescription',
				render: (value: unknown, row: BookingRow) => (
					<Box
						onClick={() => navigate(`/radiology/bookings/${row.id}`)}
						sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
					>
						{value ? (
							<Chip
								icon={<CheckCircleIcon sx={{ '&&': { color: '#2E7D32' } }} fontSize="small" />}
								label="Verified"
								size="small"
								sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: 11 }}
							/>
						) : (
							<Chip
								icon={<CancelIcon sx={{ '&&': { color: '#C62828' } }} fontSize="small" />}
								label="Unverified"
								size="small"
								sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 600, fontSize: 11 }}
							/>
						)}
					</Box>
				),
			},
			{
				field: 'status',
				label: 'Status',
				render: (value: unknown, row: BookingRow) => (
					<Box
						onClick={() => navigate(`/radiology/bookings/${row.id}`)}
						sx={{ cursor: 'pointer', display: 'inline-flex' }}
					>
						<Chip
							label={getStatusLabel(String(value))}
							size="small"
							sx={{ ...getStatusChipSx(String(value)), fontWeight: 600 }}
						/>
					</Box>
				),
			},
		],
		[navigate, isRadiologyViewer]
	)

	const rows = useMemo(() => bookings, [bookings])

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ mb: 3 }}>
				<Typography variant="h5" fontWeight={700} color="primary.dark">
					{isRadiologyViewer ? 'Bookings Queue' : 'My Radiology Bookings'}
				</Typography>
				<Typography fontSize={13} color="text.secondary">
					{isRadiologyViewer
						? 'Manage incoming radiology booking requests, submit price quotes, verify prescriptions, and upload reports.'
						: 'Track your radiology scan bookings, quotes, and reports.'}
				</Typography>
			</Box>

			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 2.5,
					flexWrap: 'wrap',
					gap: 2,
				}}
			>
				<Typography fontSize={13} color="text.secondary" fontWeight={500}>
					Showing {meta.total} booking{meta.total !== 1 ? 's' : ''}
				</Typography>

				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
					<AppSelect
						placeholder="All Statuses"
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value as string)
							setPage(1)
						}}
						options={statusOptions}
						startIcon={<FilterListIcon fontSize="small" />}
						sx={{ width: 180 }}
					/>

					<AppSelect
						placeholder="All Dates"
						value={dateFilter}
						onChange={(e) => {
							setDateFilter(e.target.value as string)
							setPage(1)
						}}
						options={[{ value: '', label: 'All Dates' }, ...availableDates]}
						startIcon={<CalendarTodayIcon fontSize="small" />}
						sx={{ width: 180 }}
					/>

					<AppInput
						size="small"
						placeholder={isRadiologyViewer ? 'Search Patient, Scans...' : 'Search Center, Scans...'}
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						startIcon={<SearchIcon />}
						enableVoiceSearch
						onVoiceResult={(text) => {
							setSearch(text)
							setPage(1)
						}}
						sx={{ width: 280 }}
					/>
				</Box>
			</Box>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress color="primary" />
				</Box>
			) : (
				<>
					<AppTable<BookingRow>
						columns={columns}
						rows={rows}
						loading={loading}
						emptyMessage="No bookings found in queue"
					/>

					{meta.pages > 1 && (
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
							<Pagination
								page={page}
								count={meta.pages}
								color="primary"
								shape="rounded"
								onChange={(_, value) => setPage(value)}
							/>
						</Box>
					)}
				</>
			)}
		</Box>
	)
}
