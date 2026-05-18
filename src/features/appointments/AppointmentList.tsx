import React, {  useEffect, useState } from 'react'
import { Box, Typography, Avatar, InputAdornment, OutlinedInput, Card, CircularProgress } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AppTable from './components/AppTable'
import { customCardStyle } from '../../styles/commonStyles'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AppointmentRow extends Record<string, unknown> {
	id: string
	patientName: string
	patientAvatar: string
	appointmentDate: string
	startTime: string
	endTime: string | null
	appointmentMode: string
	status: string
	doctorName: string
	doctorAvatar: string
	hospitalName: string | null
	hospitalAddress: string | null
}

interface AppointmentMeta {
	total: number
	page: number
	limit: number
	pages: number
}

interface AppointmentsResponse {
	success: boolean
	message: string
	data: {
		id: string
		appointment_mode: string
		appointment_date: string
		start_time: string
		end_time: string | null
		status: string
		doctor: { id: string; name: string; avatar_s3_key?: string | null }
		patient: { id: string; name: string; avatar_s3_key: string | null; gender: string | null; age: number | null }
		hospital: { id: string; name: string; address: string } | null
	}[]
	meta: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export default function AppointmentList() {
	const [searchParams] = useSearchParams()
	// 'doctor' view → show Patient Name column
	// 'patient' view → show Doctor Name column
	// default to 'doctor' if not specified
	const { role } = useAuth()
	const queryView = searchParams.get('view')
	const viewAs: 'doctor' | 'patient' =
		queryView === 'doctor' || queryView === 'patient' ? queryView : role === 'patient' ? 'patient' : 'doctor'

	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(10)
	const [rows, setRows] = useState<AppointmentRow[]>([])
	const [meta, setMeta] = useState<AppointmentMeta>({ total: 0, page: 1, limit: 10, pages: 0 })
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const fetchAppointments = async () => {
			setLoading(true)

			try {
				const params: Record<string, unknown> = {
					page,
					limit: size,
				}

				if (search) params.search = search

				const res = await ApiService.getWithParams<AppointmentsResponse>(API_ENDPOINTS.APPOINTMENTS.GET, params)

				const mapped: AppointmentRow[] = res.data.data.map((appt) => ({
					id: appt.id,
					patientName: appt.patient.name,
					patientAvatar: appt.patient.avatar_s3_key ?? '',
					appointmentDate: appt.appointment_date,
					startTime: appt.start_time,
					endTime: appt.end_time,
					appointmentMode: appt.appointment_mode,
					status: appt.status,
					doctorName: appt.doctor.name,
					doctorAvatar: appt.doctor.avatar_s3_key ?? '',
					hospitalName: appt.hospital?.name ?? null,
					hospitalAddress: appt.hospital?.address ?? null,
				}))

				setRows(mapped)

				setMeta({
					total: res.data.meta.total,
					page: res.data.meta.page,
					limit: res.data.meta.limit,
					pages: res.data.meta.pages,
				})
			} finally {
				setLoading(false)
			}
		}

		fetchAppointments()
	}, [page, search, size])

	// ── Name column — shown once, based on viewAs ───────────────────────────
	const patientNameColumn: {
		id: keyof AppointmentRow
		label: string
		sortable?: boolean
		width?: string
		format?: (value: AppointmentRow[keyof AppointmentRow], row: AppointmentRow) => React.ReactNode
	} = {
		id: 'patientName',
		label: 'Patient name',
		width: '220px',
		sortable: true,
		format: (_value, row) => (
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
	}

	const doctorNameColumn: {
		id: keyof AppointmentRow
		label: string
		sortable?: boolean
		width?: string
		format?: (value: AppointmentRow[keyof AppointmentRow], row: AppointmentRow) => React.ReactNode
	} = {
		id: 'doctorName',
		label: 'Doctor name',
		width: '220px',
		sortable: true,
		format: (_value, row) => (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
				<Avatar
					src={row.doctorAvatar}
					alt={row.doctorName}
					sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}
				>
					{row.doctorName.charAt(0)}
				</Avatar>
				<Typography fontSize={13} fontWeight={600} color="text.primary" lineHeight={1.3}>
					{row.doctorName}
				</Typography>
			</Box>
		),
	}

	const baseColumns: {
		id: keyof AppointmentRow
		label: string
		sortable?: boolean
		width?: string
		format?: (value: AppointmentRow[keyof AppointmentRow], row: AppointmentRow) => React.ReactNode
	}[] = [
		{
			id: 'appointmentDate',
			label: 'Date and time',
			width: '170px',
			format: (_value, row) => (
				<Box>
					<Typography fontSize={13} color="text.primary" fontWeight={500}>
						{row.appointmentDate}
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
						<AccessTimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
						<Typography fontSize={11} color="text.secondary">
							{row.startTime}
							{row.endTime ? ` - ${row.endTime}` : ''}
						</Typography>
					</Box>
				</Box>
			),
		},
		{
			id: 'appointmentMode',
			label: 'Mode',
			width: '120px',
			format: (_value, row) => (
				<Typography fontSize={13} color="text.primary" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
					{row.appointmentMode}
				</Typography>
			),
		},
		{
			id: 'hospitalName',
			label: 'Hospital',
			width: '180px',
			format: (_value, row) => (
				<Typography fontSize={13} color="text.primary" fontWeight={500}>
					{row.hospitalName ?? '—'}
				</Typography>
			),
		},
		{
			id: 'status',
			label: 'Status',
			width: '130px',
			format: (_value, row) => (
				<Typography fontSize={13} fontWeight={600} sx={{ textTransform: 'capitalize' }}>
					{row.status}
				</Typography>
			),
		},
	]

	const columns = viewAs === 'doctor' ? [patientNameColumn, ...baseColumns] : [doctorNameColumn, ...baseColumns]

	const searchPlaceholder = viewAs === 'doctor' ? 'Search Patient ID, Name...' : 'Search Doctor ID, Name...'

	return (
		<Box sx={{ p: 3 }}>
			{/* ── top bar ── */}
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
					{viewAs === 'doctor' ? (
						<>
							Showing all patients listed under{' '}
							<Typography component="span" fontSize={13} fontWeight={600} color="text.primary">
								Manipal Hospital, Old Airport Road, Bangalore
							</Typography>
						</>
					) : (
						<>Showing all your upcoming appointments</>
					)}
				</Typography>

				<OutlinedInput
					size="small"
					placeholder={searchPlaceholder}
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
						width: 650,
						height: 44,
						borderRadius: '10px',
						bgcolor: 'background.paper',
						'& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
					}}
				/>
			</Box>

			{/* ── table ── */}
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
					<CircularProgress size={32} />
				</Box>
			) : (
				<Card
					sx={{
						...customCardStyle,
						p: 0,
						overflow: 'visible',
						bgcolor: 'transparent',
						border: 'none',
						boxShadow: 'none',
					}}
				>
					<AppTable<AppointmentRow>
						key={viewAs}
						columns={columns}
						data={rows}
						totalRows={meta.total}
						defaultPage={meta.page}
						defaultPageSize={meta.limit}
						defaultSortBy={viewAs === 'doctor' ? 'patientName' : 'doctorName'}
						defaultSortDirection="asc"
						showPagination={meta.total > meta.limit}
						rowPadding="10px 14px"
						emptyMessage="No appointments found"
						onPageChange={(newPage, newSize) => {
							setPage(newPage)
							setSize(newSize)
						}}
					/>
				</Card>
			)}
		</Box>
	)
}
