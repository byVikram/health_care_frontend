// src/features/laboratory/bookings/LaboratoryOrdersList.tsx
//
// Mirrors ../../radiology/bookings/BookingsList.tsx exactly, adapted for laboratory bookings.
// Role-aware: laboratory-staff users see the incoming booking queue (all patients), patient
// users see only their own lab bookings (backend scopes /api/laboratory/bookings by token),
// mirroring mobile's OrderListLaboratoryPage isLabViewer pattern.

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
import { getLaboratoryBookings, LaboratoryBooking } from '../laboratoryService'
import { formatINR } from '../../../utils/Utils'
import { useAuth } from '../../../hooks/useAuth'
import { USER_ROLES } from '../../../constants/constants'

interface BookingRow extends Record<string, unknown> {
	id: string
	patientName: string
	patientAvatar: string
	laboratoryName: string
	testsList: string
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
		case 'sample_collected':
			return 'Sample Collected'
		case 'report_ready':
			return 'Report Ready'
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
		case 'sample_collected':
			return { bgcolor: '#EDE7F6', color: '#673AB7' }
		case 'report_ready':
			return { bgcolor: '#E0F7FA', color: '#0097A7' }
		case 'completed':
			return { bgcolor: '#DCFCE7', color: '#16A34A' }
		case 'cancelled':
			return { bgcolor: '#FEE2E2', color: '#DC2626' }
		default:
			return { bgcolor: '#F5F5F5', color: '#616161' }
	}
}

export default function LaboratoryOrdersList() {
	const navigate = useNavigate()
	const { role } = useAuth()
	const isLabViewer = role === USER_ROLES.LABORATORY

	const [allBookings, setAllBookings] = useState<BookingRow[]>([])
	const [bookings, setBookings] = useState<BookingRow[]>([])
	const [loading, setLoading] = useState(false)

	const [search, setSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')

	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)

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
			const response = await getLaboratoryBookings()
			const mappedBookings: BookingRow[] = response.data.map((booking: LaboratoryBooking) => {
				const { date, time } = formatDateTime(booking.created_at)
				const testNames = booking.booking_items
					.map((item) => item.custom_test_name || item.laboratory_test.test_type.name)
					.join(', ')

				return {
					id: booking.public_id,
					patientName: booking.patient_name || '-',
					patientAvatar: '',
					laboratoryName: booking.laboratory_name || '-',
					testsList: testNames || 'No Tests Configured',
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
			console.error('Failed to fetch laboratory bookings', error)
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
				row.laboratoryName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				row.testsList.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
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

	const availableDates = useMemo(() => {
		const dates = [...new Set(allBookings.map((row) => row.date))]
		return dates.map((d) => ({ value: d, label: d }))
	}, [allBookings])

	const statusOptions = [
		{ value: '', label: 'All Statuses' },
		{ value: 'pending_quote', label: 'Pending Quote' },
		{ value: 'pending_payment', label: 'Pending Payment' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'sample_collected', label: 'Sample Collected' },
		{ value: 'report_ready', label: 'Report Ready' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' },
	]

	const columns = useMemo(
		() => [
			{
				field: 'patientName',
				label: isLabViewer ? 'Patient Name' : 'Laboratory',
				render: (_: unknown, row: BookingRow) => (
					<Box
						onClick={() => navigate(`/laboratory/orders/${row.id}`)}
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
							{(isLabViewer ? row.patientName : row.laboratoryName)?.charAt(0)}
						</Avatar>
						<Typography fontSize={13} fontWeight={600}>
							{isLabViewer ? row.patientName : row.laboratoryName}
						</Typography>
					</Box>
				),
			},
			{
				field: 'testsList',
				label: 'Tests Requested',
				render: (_: unknown, row: BookingRow) => (
					<Box onClick={() => navigate(`/laboratory/orders/${row.id}`)} sx={{ cursor: 'pointer', maxWidth: 250 }}>
						<Typography fontSize={13} noWrap color="text.primary" fontWeight={500}>
							{row.testsList}
						</Typography>
					</Box>
				),
			},
			{
				field: 'totalCost',
				label: 'Total Cost',
				render: (_: unknown, row: BookingRow) => (
					<Box onClick={() => navigate(`/laboratory/orders/${row.id}`)} sx={{ cursor: 'pointer' }}>
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
					<Box onClick={() => navigate(`/laboratory/orders/${row.id}`)} sx={{ cursor: 'pointer' }}>
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
						onClick={() => navigate(`/laboratory/orders/${row.id}`)}
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
						onClick={() => navigate(`/laboratory/orders/${row.id}`)}
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
		[navigate, isLabViewer]
	)

	const rows = useMemo(() => bookings, [bookings])

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ mb: 3 }}>
				<Typography variant="h5" fontWeight={700} color="primary.dark">
					{isLabViewer ? 'Bookings Queue' : 'My Lab Bookings'}
				</Typography>
				<Typography fontSize={13} color="text.secondary">
					{isLabViewer
						? 'Manage incoming laboratory booking requests, submit price quotes, verify prescriptions, and upload reports.'
						: 'Track your lab test bookings, quotes, and reports.'}
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
						placeholder={isLabViewer ? 'Search Patient, Tests...' : 'Search Lab, Tests...'}
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
						emptyMessage="No bookings found"
						page={page}
						pageSize={limit}
						totalRows={meta.total}
						onPageChange={(value) => setPage(value)}
						onPageSizeChange={(value) => {
							setLimit(value)
							setPage(1)
						}}
					/>
				</>
			)}
		</Box>
	)
}
