import React, {  useEffect, useState } from 'react'
import { Box, Typography, Avatar, InputAdornment,  Card } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AppTable from './components/AppTable'
import { customCardStyle } from '../../styles/commonStyles'
// import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import AppSelect from '../../components/common/Select/AppSelect'
import Grid from '@mui/material/Grid'
import AppInput from '../../components/common/Input/AppInput'

// Types
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
	meta: { total: number; page: number; limit: number; pages: number }
}

type ColDef = {
	id: keyof AppointmentRow
	label: string
	sortable?: boolean
	width?: string
	format?: (value: AppointmentRow[keyof AppointmentRow], row: AppointmentRow) => React.ReactNode
}

export default function AppointmentList() {
	const [searchParams] = useSearchParams()
	const { role } = useAuth()
	const queryView = searchParams.get('view')
	const viewAs: 'doctor' | 'patient' =
		queryView === 'doctor' || queryView === 'patient' ? 
		queryView : role === 'patient' ? 'patient' : 'doctor'

	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(10)
	const [rows, setRows] = useState<AppointmentRow[]>([])
	const [meta, setMeta] = useState<AppointmentMeta>({ total: 0, page: 1, limit: 10, pages: 0 })
	const [loading, setLoading] = useState(true)

	const [filterHospital, setFilterHospital] = useState('all')
	const [filterMode, setFilterMode] = useState('all')
	const [filterDate, setFilterDate] = useState('all')
	const [filterStatus, setFilterStatus] = useState('all')
	const patientId = localStorage.getItem('patient_id')

	useEffect(() => {
		const fetchAppointments = async () => {
			setLoading(true)

			try {
				const params: Record<string, unknown> = {
					page,
					limit: size,
					patient_id: patientId,
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
	}, [page, search, size,  patientId])

	// ── Name column — shown once, based on viewAs ───────────────────────────
	const patientNameColumn: ColDef = {
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

	const doctorNameColumn: ColDef = {
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

	const baseColumns: ColDef[] = [
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
					{row.hospitalName ?? '\u2014'}
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

	const hospitalOptions = [
		{ value: 'all', label: 'All' },
		{ value: 'manipal', label: 'Manipal Hospital' },
		{ value: 'apollo', label: 'Apollo Hospital' },
	]

	const modeOptions = [
		{ value: 'all', label: 'All' },
		{ value: 'clinic', label: 'Clinic Visit' },
		{ value: 'video', label: 'Video Call' },
	]

	const dateOptions = [
		{ value: 'all', label: 'All' },
		{ value: 'today', label: 'Today' },
		{ value: 'yesterday', label: 'Yesterday' },
		{ value: 'last7', label: 'Last 7 days' },
		{ value: 'last30', label: 'Last 30 days' },
	]

	const statusOptions = [
		{ value: 'all', label: 'All' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'reschedule', label: 'Reschedule' },
		{ value: 'cancelled', label: 'Cancelled' },
	]

	const getFilterSelectProps = (options: { value: string; label: string }[]) => ({
		displayEmpty: true,
		renderValue: (selected: unknown) => {
			const selectedOption = options.find((option) => option.value === selected)
			return selectedOption && selectedOption.value !== 'all' ? selectedOption.label : ''
		},
		MenuProps: {
			PaperProps: {
				sx: { mt: 1, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' },
			},
		},
	})

	const columns = viewAs === 'doctor' ? [patientNameColumn, ...baseColumns] : [doctorNameColumn, ...baseColumns]
	return (
		<Box sx={{ p: 3 }}>
			{/* Filter bar */}
			{loading ? (
				<Grid container spacing={2} sx={{ mb: 2.5, alignItems: 'center' }}>
					<Grid size={{ xs: 12, lg: 8 }}>
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSkeleton variant="rounded" width="100%" height={44} />
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSkeleton variant="rounded" width="100%" height={44} />
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSkeleton variant="rounded" width="100%" height={44} />
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSkeleton variant="rounded" width="100%" height={44} />
							</Grid>
						</Grid>
					</Grid>
					<Grid size={{ xs: 12, lg: 4 }}>
						<AppSkeleton variant="rounded" width="100%" height={44} />
					</Grid>
				</Grid>
			) : (
				<Grid container spacing={2} sx={{ mb: 2.5, alignItems: 'center' }}>
					<Grid size={{ xs: 12, lg: 8 }}>
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSelect
									label="Hospital"
									value={filterHospital}
									onChange={(e) => {
										setFilterHospital(e.target.value)
										setPage(1)
									}}
									options={hospitalOptions}
									slotProps={{
										select: getFilterSelectProps(hospitalOptions),
									}}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSelect
									label="Mode"
									value={filterMode}
									onChange={(e) => {
										setFilterMode(e.target.value)
										setPage(1)
									}}
									options={modeOptions}
									slotProps={{
										select: getFilterSelectProps(modeOptions),
									}}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSelect
									label="Date"
									value={filterDate}
									onChange={(e) => {
										setFilterDate(e.target.value)
										setPage(1)
									}}
									options={dateOptions}
									slotProps={{
										select: getFilterSelectProps(dateOptions),
									}}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6, md: 3 }}>
								<AppSelect
									label="Status"
									value={filterStatus}
									onChange={(e) => {
										setFilterStatus(e.target.value)
										setPage(1)
									}}
									options={statusOptions}
									slotProps={{
										select: getFilterSelectProps(statusOptions),
									}}
								/>
							</Grid>
						</Grid>
					</Grid>
					<Grid size={{ xs: 12, lg: 4 }}>
						<AppInput
							fullWidth
							size="small"
							placeholder={
								viewAs === 'doctor' ? 'Search Patient ID, Name...' : 'Search Doctor ID, Name...'
							}
							value={search}
							onChange={(e) => {
								setSearch(e.target.value)
								setPage(1)
							}}
							enableVoiceSearch
							onVoiceResult={(text) => {
								setSearch(text)
								setPage(1)
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
									</InputAdornment>
								),
							}}
							sx={{
								fontSize: 14,
								height: 44,
								borderRadius: '10px',
								bgcolor: 'background.paper',
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: 'divider',
								},
							}}
						/>
					</Grid>
				</Grid>
			)}
			{loading ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{Array.from({ length: 7 }).map((_, i) => (
						<AppSkeleton key={i} variant="rounded" width="100%" height={70} />
					))}
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
