// src/features/Pharmacy/OrderList.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Typography, Avatar, CircularProgress, Chip, MenuItem, Pagination } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { useNavigate } from 'react-router-dom'
import AppInput from '../../components/common/Input/AppInput'
import AppTable from '../../components/common/Table/AppTable'
import { getPharmacyOrders, PharmacyOrder } from '../Pharmacy/pharmacyService'
import { formatINR } from '../../utils/Utils'
interface OrderRow extends Record<string, unknown> {
	id: string
	totalCost: number
	patientName: string
	patientAvatar: string
	pharmacyName: string
	date: string
	time: string
	rawDate: string
	status: string
}

interface OrderMeta {
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

const getStatusChipSx = (status: string) => {
	switch (status.toUpperCase()) {
		case 'PENDING':
			return { bgcolor: '#FFF3E0', color: '#ED6C02' }
		case 'APPROVED':
			return { bgcolor: '#E8F5E9', color: '#2E7D32' }
		case 'PROCESSING':
			return { bgcolor: '#E3F2FD', color: '#0288D1' }
		case 'DELIVERED':
			return { bgcolor: '#E8F5E9', color: '#2E7D32' }
		case 'REJECTED':
			return { bgcolor: '#FFEBEE', color: '#D32F2F' }
		default:
			return { bgcolor: '#F5F5F5', color: '#616161' }
	}
}

export default function OrderList() {
	const navigate = useNavigate()

	const [allOrders, setAllOrders] = useState<OrderRow[]>([])
	const [orders, setOrders] = useState<OrderRow[]>([])
	const [loading, setLoading] = useState(false)

	const [search, setSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')

	const [page, setPage] = useState(1)
	const [limit] = useState(10)

	const [dateFilter, setDateFilter] = useState('')

	const [meta, setMeta] = useState<OrderMeta>({
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

	const fetchOrders = useCallback(async () => {
		try {
			setLoading(true)
			const response = await getPharmacyOrders()
			const mappedOrders: OrderRow[] = response.data.map((order: PharmacyOrder) => {
				const { date, time } = formatDateTime(order.created_at)
				return {
					id: order.id,
					totalCost: order.bill_amount ?? 0,
					patientName: order.patient?.name ?? '-',
					patientAvatar: order.patient?.avatar_s3_key ?? '',
					pharmacyName: order.pharmacy?.name ?? '-',
					date,
					time,
					rawDate: order.created_at,
					status: order.status,
				}
			})
			setAllOrders(mappedOrders)
		} catch (error) {
			console.error('Failed to fetch orders', error)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchOrders()
	}, [fetchOrders])

	useEffect(() => {
		const filtered = allOrders.filter((row) => {
			const matchesSearch =
				!debouncedSearch ||
				row.patientName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				String(row.totalCost).includes(debouncedSearch)
			const matchesDate = !dateFilter || row.date === dateFilter
			return matchesSearch && matchesDate
		})

		const total = filtered.length
		const pages = Math.ceil(total / limit) || 1
		const start = (page - 1) * limit
		const paginated = filtered.slice(start, start + limit)

		setOrders(paginated)
		setMeta({ total, page, limit, pages })
	}, [allOrders, debouncedSearch, dateFilter, page, limit])

	// Derive available dates from all orders
	const availableDates = useMemo(() => {
		return [...new Set(allOrders.map((row) => row.date))]
	}, [allOrders])

	const columns = useMemo(
		() => [
			{
				field: 'patientName',
				label: 'Patient Name',
				render: (_: unknown, row: OrderRow) => (
					<Box
						onClick={() => navigate(`/pharmacy/orders/${row.id}`)}
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
							{row.patientName?.charAt(0)}
						</Avatar>
						<Typography fontSize={13} fontWeight={600}>
							{row.patientName}
						</Typography>
					</Box>
				),
			},
			{
				field: 'totalCost',
				label: 'Total Cost',
				render: (_: unknown, row: OrderRow) => (
					<Box onClick={() => navigate(`/pharmacy/orders/${row.id}`)} sx={{ cursor: 'pointer' }}>
						<Typography fontSize={13} fontWeight={600}>
							{formatINR(row.totalCost)}
						</Typography>
					</Box>
				),
			},
			{
				field: 'pharmacyName',
				label: 'Pharmacy',
				render: (_: unknown, row: OrderRow) => (
					<Box onClick={() => navigate(`/pharmacy/orders/${row.id}`)} sx={{ cursor: 'pointer' }}>
						<Typography fontSize={13}>{row.pharmacyName}</Typography>
					</Box>
				),
			},
			{
				field: 'date',
				label: 'Date & Time',
				render: (_: unknown, row: OrderRow) => (
					<Box onClick={() => navigate(`/pharmacy/orders/${row.id}`)} sx={{ cursor: 'pointer' }}>
						<Typography fontSize={13}>{row.date}</Typography>
						<Typography fontSize={11} color="text.secondary">
							{row.time}
						</Typography>
					</Box>
				),
			},
			{
				field: 'status',
				label: 'Status',
				render: (value: unknown, row: OrderRow) => (
					<Box
						onClick={() => navigate(`/pharmacy/orders/${row.id}`)}
						sx={{ cursor: 'pointer', display: 'inline-flex' }}
					>
						<Chip
							label={String(value)}
							size="small"
							sx={{ ...getStatusChipSx(String(value)), fontWeight: 600 }}
						/>
					</Box>
				),
			},
		],
		[navigate]
	)

	const rows = useMemo(() => orders, [orders])

	return (
		<Box sx={{ p: 3 }}>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 2,
					flexWrap: 'wrap',
					gap: 2,
				}}
			>
				<Typography fontSize={13} color="text.secondary">
					Showing {meta.total} medicine order{meta.total !== 1 ? 's' : ''}
				</Typography>

				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
					<AppInput
						select
						size="small"
						value={dateFilter}
						onChange={(e) => {
							setDateFilter(e.target.value)
							setPage(1)
						}}
						startIcon={<CalendarTodayIcon fontSize="small" />}
						sx={{ width: 180 }}
					>
						<MenuItem value="">All Dates</MenuItem>

						{availableDates.map((date) => (
							<MenuItem key={date} value={date}>
								{date}
							</MenuItem>
						))}
					</AppInput>

					<AppInput
						size="small"
						placeholder="Search Patient Name, Total Cost..."
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
						sx={{ width: 350 }}
					/>
				</Box>
			</Box>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
					<CircularProgress />
				</Box>
			) : (
				<>
					<AppTable<OrderRow>
						columns={columns}
						rows={rows}
						loading={loading}
						emptyMessage="No orders found"
					/>

					{meta.pages > 1 && (
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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
