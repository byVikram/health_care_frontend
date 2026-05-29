// src/features/Pharmacy/OrderList.tsx

import React, { useCallback, useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Avatar,
	InputAdornment,
	// OutlinedInput,
	CircularProgress,
	Chip,
	TextField,
	MenuItem,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
// import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import AppInput from '../../components/common/Input/AppInput'
import { useNavigate } from 'react-router-dom'
import AppTable from '../appointments/components/AppTable'

interface OrderRow extends Record<string, unknown> {
	id: string
	orderId: string
	patientName: string
	patientAvatar: string
	prescribedBy: string
	date: string
	time: string
	status: string
}

interface OrderMeta {
	total: number
	page: number
	limit: number
	pages: number
}

interface OrdersResponse {
	success: boolean
	message: string
	data: {
		id: string
		order_id: string
		patient: { id: string; name: string; avatar_s3_key?: string | null }
		prescribed_by: string
		date: string
		time: string
		status: string
	}[]
	meta: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

// ─── Mock Data (from the image) ───────────────────────────────────────────

const MOCK_ORDERS: OrderRow[] = [
	{
		id: '1',
		orderId: 'ID012341',
		patientName: 'Nitin S H',
		patientAvatar: '',
		prescribedBy: 'Dr Ashish Rao - Dentist at Akoya Clinic',
		date: '27 Feb 2025',
		time: '10:00 AM',
		status: 'Pending',
	},
	{
		id: '2',
		orderId: 'ID012340',
		patientName: 'Aditi',
		patientAvatar: '',
		prescribedBy: 'Dr Ashish Rao - Dentist at Akoya Clinic',
		date: '22 Feb 2025',
		time: '10:30 AM',
		status: 'Collected',
	},
	{
		id: '3',
		orderId: 'ID012334',
		patientName: 'Rakesh',
		patientAvatar: '',
		prescribedBy: 'Dr Ashish Rao - Dentist at Akoya Clinic',
		date: '20 Jan 2025',
		time: '12:00 AM',
		status: 'Collected',
	},
	{
		id: '4',
		orderId: 'ID012334',
		patientName: 'Aditi',
		patientAvatar: '',
		prescribedBy: 'Dr Ashish Rao - Dentist at Akoya Clinic',
		date: '22 Feb 2025',
		time: '10:30 AM',
		status: 'Rejected',
	},
	{
		id: '5',
		orderId: 'ID012341',
		patientName: 'Narasappa',
		patientAvatar: '',
		prescribedBy: 'Dr Ashish Rao - Dentist at Akoya Clinic',
		date: '22 Feb 2025',
		time: '10:00 AM',
		status: 'Packed',
	},
	{
		id: '6',
		orderId: 'ID012341',
		patientName: 'Avinash',
		patientAvatar: '',
		prescribedBy: 'Dr Ashish Rao - Dentist at Akoya Clinic',
		date: '22 Feb 2025',
		time: '12:00 AM',
		status: 'Packed',
	},
	{
		id: '7',
		orderId: 'ID012340',
		patientName: 'Shashant',
		patientAvatar: '',
		prescribedBy: 'Dr Ashish Rao - Dentist at Akoya Clinic',
		date: '22 Feb 2025',
		time: '10:30 AM',
		status: 'Pending',
	},
	{
		id: '8',
		orderId: 'ID012340',
		patientName: 'Shashant',
		patientAvatar: '',
		prescribedBy: 'Dr Ashish Rao - Dentist at Akoya Clinic',
		date: '22 Feb 2025',
		time: '10:30 AM',
		status: 'Pending',
	},
]

const getStatusChipSx = (status: string) => {
	switch (status.toLowerCase()) {
		case 'pending':
			return {
				bgcolor: '#fff3e0',
				color: '#ed6c02',
				'& .MuiChip-label': { color: 'inherit', fontWeight: 600 },
			}
		case 'collected':
			return {
				bgcolor: '#e8f5e9',
				color: '#2e7d32',
				'& .MuiChip-label': { color: 'inherit', fontWeight: 600 },
			}
		case 'rejected':
			return {
				bgcolor: '#ffebee',
				color: '#d32f2f',
				'& .MuiChip-label': { color: 'inherit', fontWeight: 600 },
			}
		case 'packed':
			return {
				bgcolor: '#e3f2fd',
				color: '#0288d1',
				'& .MuiChip-label': { color: 'inherit', fontWeight: 600 },
			}
		default:
			return {
				bgcolor: '#f5f5f5',
				color: '#757575',
				'& .MuiChip-label': { color: 'inherit', fontWeight: 600 },
			}
	}
}

// Simulate API call with filtering, pagination, and sorting
const fetchOrdersApi = async (
	page: number,
	limit: number,
	search: string,
	dateFilter: string
): Promise<OrdersResponse> => {
	await new Promise((resolve) => setTimeout(resolve, 500))

	let filteredOrders = [...MOCK_ORDERS]

	if (search) {
		const lowerSearch = search.toLowerCase()
		filteredOrders = filteredOrders.filter(
			(order) =>
				order.orderId.toLowerCase().includes(lowerSearch) ||
				order.patientName.toLowerCase().includes(lowerSearch)
		)
	}

	if (dateFilter) {
		filteredOrders = filteredOrders.filter((order) => order.date === dateFilter)
	}

	const sortByDate = (a: OrderRow, b: OrderRow) => {
		const dateA = new Date(a.date)
		const dateB = new Date(b.date)
		return dateB.getTime() - dateA.getTime()
	}
	filteredOrders.sort(sortByDate)

	const total = filteredOrders.length
	const startIndex = (page - 1) * limit
	const endIndex = startIndex + limit
	const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

	const mappedData = paginatedOrders.map((order) => ({
		id: order.id,
		order_id: order.orderId,
		patient: {
			id: order.id,
			name: order.patientName,
			avatar_s3_key: order.patientAvatar || null,
		},
		prescribed_by: order.prescribedBy,
		date: order.date,
		time: order.time,
		status: order.status,
	}))

	return {
		success: true,
		message: 'Orders fetched successfully',
		data: mappedData,
		meta: {
			total,
			page,
			limit,
			pages: Math.ceil(total / limit),
		},
	}
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function OrderList() {
	const navigate = useNavigate() // ← ADDED for navigation
	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(10)
	const [dateFilter, setDateFilter] = useState('')
	const [rows, setRows] = useState<OrderRow[]>([])
	const [meta, setMeta] = useState<OrderMeta>({
		total: 0,
		page: 1,
		limit: 10,
		pages: 0,
	})
	const [loading, setLoading] = useState(false)

	const uniqueDates = Array.from(new Set(MOCK_ORDERS.map((order) => order.date)))

	const fetchOrders = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetchOrdersApi(page, size, search, dateFilter)

			const mappedRows: OrderRow[] = res.data.map((order) => ({
				id: order.id,
				orderId: order.order_id,
				patientName: order.patient.name,
				patientAvatar: order.patient.avatar_s3_key ?? '',
				prescribedBy: order.prescribed_by,
				date: order.date,
				time: order.time,
				status: order.status,
			}))

			setRows(mappedRows)
			setMeta({
				total: res.meta.total,
				page: res.meta.page,
				limit: res.meta.limit,
				pages: res.meta.pages,
			})
		} catch (error) {
			console.error('Failed to fetch orders', error)
		} finally {
			setLoading(false)
		}
	}, [page, size, search, dateFilter])

	useEffect(() => {
		const timer = setTimeout(() => {
			void fetchOrders()
		}, 300)
		return () => clearTimeout(timer)
	}, [fetchOrders])

	const handleRowClick = useCallback(
		(row: OrderRow) => {
			navigate(`/pharmacy/orders/${row.orderId}`)
		},
		[navigate]
	)

	const columns: {
		id: keyof OrderRow
		label: string
		sortable?: boolean
		width?: string
		format?: (value: OrderRow[keyof OrderRow], row: OrderRow) => React.ReactNode
	}[] = [
		{
			id: 'patientName',
			label: 'Patient Name',
			width: '200px',
			sortable: true,
			format: (_, row) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
					<Avatar
						src={row.patientAvatar}
						alt={row.patientName}
						sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}
					>
						{row.patientName.charAt(0)}
					</Avatar>
					<Typography fontSize={13} fontWeight={600} color="text.primary" lineHeight={1.3}>
						{row.patientName}
					</Typography>
				</Box>
			),
		},
		{
			id: 'orderId',
			label: 'Order ID',
			width: '120px',
			sortable: true,
			format: (value) => (
				<Typography fontSize={13} fontWeight={500} color="text.primary">
					{value as string}
				</Typography>
			),
		},
		{
			id: 'prescribedBy',
			label: 'Doctor & Clinic',
			width: '250px',
			sortable: true,
			format: (value) => (
				<Typography fontSize={13} color="text.secondary" fontWeight={500}>
					{value as string}
				</Typography>
			),
		},
		{
			id: 'date',
			label: 'Date',
			width: '120px',
			sortable: true,
			format: (value, row) => (
				<Box>
					<Typography fontSize={13} color="text.primary" fontWeight={500}>
						{value as string}
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
						<AccessTimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
						<Typography fontSize={11} color="text.secondary">
							{row.time}
						</Typography>
					</Box>
				</Box>
			),
		},
		{
			id: 'status',
			label: 'Status',
			width: '130px',
			sortable: true,
			format: (value, row) => (
				<Chip label={value as string} size="small" sx={getStatusChipSx(row.status)} variant="filled" />
			),
		},
	]

	return (
		<Box sx={{ p: 3 }}>
			{/* top bar */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 2,
					flexWrap: 'wrap',
					gap: 1.5,
				}}
			>
				<Typography fontSize={13} fontWeight={400} color="text.secondary">
					Showing all medicine orders
				</Typography>

				<Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
					<TextField
						select
						size="small"
						placeholder="Select date"
						value={dateFilter}
						onChange={(e) => {
							setDateFilter(e.target.value)
							setPage(1)
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
								</InputAdornment>
							),
						}}
						sx={{
							width: 180,
							'& .MuiSelect-select': { fontSize: 13, py: 1 },
						}}
					>
						<MenuItem value="">All Dates</MenuItem>
						{uniqueDates.map((date) => (
							<MenuItem key={date} value={date}>
								{date}
							</MenuItem>
						))}
					</TextField>

					{/* <OutlinedInput
						size="small"
						placeholder="Search Order ID, Patient Name..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						startAdornment={
							<InputAdornment position="start">
								<SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
							</InputAdornment>
						}
						endAdornment={
							<InputAdornment position="end">
								<MicNoneOutlinedIcon sx={{ color: 'text.disabled', fontSize: 20, cursor: 'pointer' }} />
							</InputAdornment>
						}
						sx={{
							fontSize: 14,
							width: 350,
							height: 44,
							borderRadius: '10px',
							bgcolor: 'background.paper',
							'& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
						}}
					/> */}
					<AppInput
						size="small"
						placeholder="Search Order ID, Patient Name..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						startIcon={<SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
						enableVoiceSearch
						onVoiceResult={(text) => {
							setSearch(text)
							setPage(1)
						}}
						sx={{
							width: 350,
							height: 44,
							borderRadius: '10px',
							bgcolor: 'background.paper',
							'& .MuiOutlinedInput-notchedOutline': {
								borderColor: 'divider',
							},
						}}
					/>
				</Box>
			</Box>

			{/* table */}
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
					<CircularProgress size={32} />
				</Box>
			) : (
				<AppTable<OrderRow>
					columns={columns}
					data={rows}
					totalRows={meta.total}
					defaultPage={meta.page}
					defaultPageSize={meta.limit}
					defaultSortBy="date"
					defaultSortDirection="desc"
					showPagination={meta.total > meta.limit}
					rowPadding="10px 14px"
					emptyMessage="No orders found"
					onPageChange={(newPage: number, newSize: number) => {
						setPage(newPage)
						setSize(newSize)
					}}
					onRowClick={handleRowClick} // ← ADDED: navigates when row clicked
				/>
			)}
		</Box>
	)
}
