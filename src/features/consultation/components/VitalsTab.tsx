// src/features/consultation/components/VitalsTab.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import {
	Box,
	Typography,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	IconButton,
	Fab,
	Divider,
	Tooltip,
	useTheme,
	Alert,
} from '@mui/material'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined'
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined'
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined'
import AirOutlinedIcon from '@mui/icons-material/AirOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import AddIcon from '@mui/icons-material/Add'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import { customCardStyle } from '../../../styles/commonStyles'
import { VitalStat, VitalHistoryRow } from '../../../types/consultation'
import AppModal from '../../../components/common/Modal/AppModal'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import AddVitals from './AddVitals'
import { toast } from 'react-toastify'
import { useAuth } from '../../../hooks/useAuth'
import {
	getLatestVitals,
	getVitalsHistory,
	getPatientReports,
	createPatientReport,
	type VitalRecord,
	type ReportRecord,
} from '../consultationService'

// -- Types -------------------------------------------------------------------

interface VitalsTabProps {
	patientPublicId: string
}

interface TabColumn {
	key: string
	label: string
	refRange?: string
	showDot?: boolean
}

interface TabConfig {
	id: string
	label: string
	columns: TabColumn[]
	showDownload?: boolean
}

// -- Constants ---------------------------------------------------------------

const TAB_VITAL_TYPE: Record<string, string> = {
	bp: 'blood_pressure',
	glucose: 'glucose_level',
	weight: 'weight',
	others: 'others',
	ecg: 'ecg',
}

const PERIOD_DAYS: Record<string, number | undefined> = {
	all: undefined,
	today: 1,
	yesterday: 2,
	'7days': 7,
	'30days': 30,
	'90days': 90,
	custom: undefined,
}

const TAB_CONFIGS: TabConfig[] = [
	{
		id: 'bp',
		label: 'Blood Pressure',
		columns: [
			{ key: 'morning', label: 'Morning', refRange: '90/60 - 120/80 mmHg', showDot: true },
			{ key: 'evening', label: 'Evening', refRange: '90/60 - 120/80 mmHg', showDot: true },
		],
	},
	{
		id: 'glucose',
		label: 'Glucose Level',
		columns: [
			{ key: 'fasting', label: 'Fasting Sugar', refRange: '70 - 99 mg/dL', showDot: true },
			{ key: 'random', label: 'Random Sugar', refRange: '< 140 mg/dL', showDot: true },
		],
	},
	{
		id: 'weight',
		label: 'Weight',
		columns: [{ key: 'weight', label: 'Weight in Kg', refRange: 'Ideal range: 58-70 kg', showDot: true }],
	},
	{
		id: 'others',
		label: 'Others',
		columns: [
			{ key: 'waist', label: 'Waist' },
			{ key: 'hba1c', label: 'HbA1C' },
			{ key: 'ldl', label: 'LDL' },
			{ key: 'hdl', label: 'HDL' },
			{ key: 'tgl', label: 'TGL' },
			{ key: 'respRate', label: 'Respiration rate' },
			{ key: 'pulseRate', label: 'Pulse rate' },
			{ key: 'spo2', label: 'SpO2' },
			{ key: 'temp', label: 'Temperature' },
		],
	},
	{
		id: 'ecg',
		label: 'ECG',
		showDownload: true,
		// ECG tab shows report metadata, not a vital reading
		columns: [
			{ key: 'reportType', label: 'Report Type' },
			{ key: 'notes', label: 'Notes' },
		],
	},
]

const PERIOD_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'today', label: 'Today' },
	{ value: 'yesterday', label: 'Yesterday' },
	{ value: '7days', label: '7 Days' },
	{ value: '30days', label: '30 Days' },
	{ value: '90days', label: '90 Days' },
	{ value: 'custom', label: 'Custom' },
]

const VITAL_ICONS: Record<string, React.ReactNode> = {
	temp: <ThermostatIcon sx={{ fontSize: 28, color: '#e53935' }} />,
	bp: <FavoriteOutlinedIcon sx={{ fontSize: 28, color: '#e53935' }} />,
	glucose: <WaterDropOutlinedIcon sx={{ fontSize: 28, color: '#e53935' }} />,
	weight: <FitnessCenterOutlinedIcon sx={{ fontSize: 28, color: '#5c6bc0' }} />,
	spo2: <AirOutlinedIcon sx={{ fontSize: 28, color: '#29b6f6' }} />,
}

// -- Helpers -----------------------------------------------------------------

function formatRecordedAt(dateStr: string): string {
	const d = new Date(dateStr)
	return (
		d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
		' ' +
		d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
	)
}

function formatShortDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
	})
}

function hasValue(value: unknown): boolean {
	return value !== null && value !== undefined && value !== ''
}

function formatValueWithUnit(value: unknown, unit: string): string {
	return hasValue(value) ? `${value} ${unit}` : '—'
}

type VitalValue = Record<string, unknown>

interface SummaryConfig {
	unit: string
	getValue: (v: VitalValue) => string
}

const SUMMARY_CONFIG: Record<string, SummaryConfig> = {
	temperature: {
		unit: 'F',
		getValue: (v) => String(v.temperature ?? v.value ?? '—'),
	},

	blood_pressure: {
		unit: 'mm/Hg',
		getValue: (v) => {
			const sys = v.systolic ?? v.morning_systolic
			const dia = v.diastolic ?? v.morning_diastolic

			if (sys && dia) {
				return `${sys}/${dia}`
			}

			return String(v.morning ?? '—')
		},
	},

	glucose_level: {
		unit: 'mg/dL',
		getValue: (v) => String(v.fasting ?? v.random ?? v.post_meal ?? v.value ?? '—'),
	},

	spo2: {
		unit: '%',
		getValue: (v) => String(v.spo2 ?? v.value ?? '—'),
	},
}

function getLatestSummary(record: VitalRecord | null, type: string): { value: string; unit: string; date: string } {
	if (!record) {
		return {
			value: '—',
			unit: '',
			date: '',
		}
	}

	const config = SUMMARY_CONFIG[type as keyof typeof SUMMARY_CONFIG]

	if (!config) {
		return {
			value: '—',
			unit: '',
			date: '',
		}
	}

	return {
		value: config.getValue(record.value),
		unit: config.unit,
		date: formatShortDate(record.recorded_at),
	}
}

const ROW_MAPPERS: Record<string, (v: VitalValue) => Record<string, string>> = {
	bp: (v) => ({
		morning:
			hasValue(v.systolic) && hasValue(v.diastolic)
				? `${v.systolic}/${v.diastolic} mmHg`
				: hasValue(v.morning)
					? String(v.morning)
					: '—',
		evening: hasValue(v.evening) ? String(v.evening) : '—',
	}),


	glucose: (v) => ({
		fasting: formatValueWithUnit(v.fasting, 'mg/dL'),
		random: formatValueWithUnit(v.random ?? v.post_meal, 'mg/dL'),
	}),
	weight: (v) => ({
		weight: formatValueWithUnit(v.weight ?? v.value, 'Kg'),
	}),

	others: (v) => ({
		waist: hasValue(v.waist) ? String(v.waist) : '—',
		hba1c: hasValue(v.hba1c) ? String(v.hba1c) : '—',
		ldl: hasValue(v.ldl) ? String(v.ldl) : '—',
		hdl: hasValue(v.hdl) ? String(v.hdl) : '—',
		tgl: hasValue(v.tgl) ? String(v.tgl) : '—',
		respRate: hasValue(v.resp_rate) ? String(v.resp_rate) : '—',
		pulseRate: hasValue(v.pulse_rate) ? String(v.pulse_rate) : '—',
		spo2: hasValue(v.spo2) ? String(v.spo2) : '—',
		temp: hasValue(v.temperature) ? String(v.temperature) : '—',
	}),
}
function mapVitalToRow(vital: VitalRecord, tabId: string, idx: number): VitalHistoryRow {
	const mapper = ROW_MAPPERS[tabId]

	return {
		id: String(idx),
		date: formatRecordedAt(vital.recorded_at),
		cells: mapper ? mapper(vital.value) : {},
	}
}

function getBmiCategory(bmi: number): { label: string; color: string } {
	if (bmi < 18.5) return { label: 'Underweight', color: '#f57c00' }
	if (bmi < 25) return { label: 'Normal', color: '#388e3c' }
	if (bmi < 30) return { label: 'Overweight', color: '#f57c00' }
	return { label: 'Obese', color: '#d32f2f' }
}

// -- Sub-components ----------------------------------------------------------

function VitalStatCard({ stat }: { stat: VitalStat }) {
	return (
		<Box
			sx={{
				...customCardStyle,
				p: 1.5,
				display: 'flex',
				alignItems: 'center',
				gap: 1.5,
				height: '100%',
				boxSizing: 'border-box',
			}}
		>
			<Box sx={{ flexShrink: 0 }}>{VITAL_ICONS[stat.id]}</Box>
			<Box sx={{ flex: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
					<Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary' }}>
						{stat.value}
					</Typography>
					<Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary' }}>
						{stat.unit}
					</Typography>
				</Box>
				<Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary', display: 'block' }}>
					{stat.label}
				</Typography>
			</Box>
			<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.disabled', alignSelf: 'flex-start' }}>
				{stat.date}
			</Typography>
		</Box>
	)
}

function WeightBmiCard({
	weightKg,
	heightCm,
	bmi,
	date,
}: {
	weightKg: number
	heightCm: number
	bmi: number
	date: string
}) {
	const { label: bmiLabel, color: bmiColor } = getBmiCategory(bmi)
	return (
		<Box
			sx={{
				...customCardStyle,
				p: 1.5,
				height: '100%',
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
				<FitnessCenterOutlinedIcon sx={{ fontSize: 22, color: '#5c6bc0' }} />
				<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.disabled' }}>
					{date}
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
				<Box sx={{ flex: 1, textAlign: 'center' }}>
					<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.3 }}>
						<Typography sx={{ fontWeight: 700, fontSize: '15px', color: 'text.primary' }}>
							{weightKg || '\u2014'}
						</Typography>
						{!!weightKg && (
							<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
								Kg
							</Typography>
						)}
					</Box>
					<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary', display: 'block' }}>
						Weight
					</Typography>
				</Box>
				<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
				<Box sx={{ flex: 1, textAlign: 'center' }}>
					<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.3 }}>
						<Typography sx={{ fontWeight: 700, fontSize: '15px', color: 'text.primary' }}>
							{heightCm || '\u2014'}
						</Typography>
						{!!heightCm && (
							<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
								cm
							</Typography>
						)}
					</Box>
					<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary', display: 'block' }}>
						Height
					</Typography>
				</Box>
				<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
				<Box sx={{ flex: 1, textAlign: 'center' }}>
					<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.3 }}>
						<Typography sx={{ fontWeight: 700, fontSize: '15px', color: bmi ? bmiColor : 'text.disabled' }}>
							{bmi || '\u2014'}
						</Typography>
					</Box>
					<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary', display: 'block' }}>
						BMI
					</Typography>
					{!!bmi && (
						<Typography
							variant="caption"
							sx={{ fontSize: '9px', color: bmiColor, fontWeight: 600, display: 'block' }}
						>
							{bmiLabel}
						</Typography>
					)}
				</Box>
			</Box>
		</Box>
	)
}

function DataCell({ value, status, showDot }: { value: string; status?: 'normal' | 'abnormal'; showDot?: boolean }) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
			<Typography variant="body2" sx={{ fontSize: '13px', color: 'text.primary' }}>
				{value}
			</Typography>
			{showDot && status && (
				<Box
					sx={{
						width: 7,
						height: 7,
						borderRadius: '50%',
						flexShrink: 0,
						bgcolor: status === 'normal' ? 'success.main' : 'error.main',
					}}
				/>
			)}
		</Box>
	)
}

// -- Main component ----------------------------------------------------------

export default function VitalsTab({ patientPublicId }: VitalsTabProps) {
	const { role } = useAuth()
	const [activeTabId, setActiveTabId] = useState('bp')
	const [period, setPeriod] = useState('30days')
	const [openVitalsModal, setOpenVitalsModal] = useState(false)
	const theme = useTheme()

	const [latestVitals, setLatestVitals] = useState<Record<string, VitalRecord | null>>({})
	const [historyVitals, setHistoryVitals] = useState<VitalRecord[]>([])
	const [reports, setReports] = useState<ReportRecord[]>([])
	const [summaryLoading, setSummaryLoading] = useState(true)
	const [historyLoading, setHistoryLoading] = useState(false)
	const [summaryError, setSummaryError] = useState(false)
	const [historyError, setHistoryError] = useState(false)
	const historyCacheRef = useRef<Record<string, VitalRecord[]>>({})

	// Fetch latest vitals for summary cards
	const fetchLatestVitals = useCallback(async () => {
		if (!patientPublicId) return	
		try {
			setSummaryLoading(true)
			setSummaryError(false)

			const data = await getLatestVitals(patientPublicId, role)
			setLatestVitals(data)
		} catch {
			setSummaryError(true)
		} finally {
			setSummaryLoading(false)
		}
	}, [patientPublicId, role])

	useEffect(() => {
		void fetchLatestVitals()
	}, [fetchLatestVitals])

	// Fetch vitals history when tab or period changes
	const fetchHistory = useCallback(async () => {
		if (!patientPublicId || activeTabId === 'ecg') return

		try {
			setHistoryLoading(true)
			setHistoryError(false)

			const vitalType = TAB_VITAL_TYPE[activeTabId]
			const days = PERIOD_DAYS[period]

			const cacheKey = `${activeTabId}-${period}`

			if (historyCacheRef.current[cacheKey]) {
				setHistoryVitals(historyCacheRef.current[cacheKey])
				setHistoryLoading(false)
				return
			}

			const data = await getVitalsHistory(patientPublicId, { vital_type: vitalType, ...(days !== undefined ? { days } : {}) }, role)

			setHistoryVitals(data)

			historyCacheRef.current = { ...historyCacheRef.current, [cacheKey]: data }



		} catch {
			setHistoryError(true)
		} finally {
			setHistoryLoading(false)
		}
	}, [patientPublicId, activeTabId, period, role])

	useEffect(() => {
		void fetchHistory()
	}, [fetchHistory])

	// Fetch ECG reports when ECG tab is active
	// useEffect(() => {
	// 	if (!patientPublicId || activeTabId !== 'ecg') return
	// 	ApiService.get<{ success: boolean; data: ReportRecord[] }>(API_ENDPOINTS.PATIENT.REPORTS(patientPublicId))
	// 		.then((res) => setReports(res.data.data ?? []))
	// 		.catch(() => toast.error('Failed to load ECG reports'))
	// }, [patientPublicId, activeTabId])

	const fetchReports = useCallback(async () => {
		if (!patientPublicId) return

		try {
			const data = await getPatientReports(patientPublicId)
			setReports(data)
		} catch {
			toast.error('Failed to load ECG reports')
		}
	}, [patientPublicId])

	useEffect(() => {
		if (activeTabId === 'ecg') {
			void fetchReports()
		}
	}, [activeTabId, fetchReports])


	// Refresh after a vital is saved — clear cache so new data is fetched
	const handleVitalSaved = useCallback(() => {
		historyCacheRef.current = {}
		void fetchLatestVitals()
		void fetchHistory()
	}, [fetchLatestVitals, fetchHistory])

	// Derive summary card values
	const tempSummary = getLatestSummary(latestVitals['temperature'] ?? null, 'temperature')
	const bpSummary = getLatestSummary(latestVitals['blood_pressure'] ?? null, 'blood_pressure')
	const glucoseSummary = getLatestSummary(latestVitals['glucose_level'] ?? null, 'glucose_level')
	const spo2Summary = getLatestSummary(latestVitals['spo2'] ?? null, 'spo2')

	const vitalsStats: VitalStat[] = [
		{
			id: 'temp',
			label: 'Body Temperature',
			value: tempSummary.value,
			unit: tempSummary.unit,
			date: tempSummary.date,
		},
		{ id: 'bp', label: 'Blood Pressure', value: bpSummary.value, unit: bpSummary.unit, date: bpSummary.date },
		{
			id: 'glucose',
			label: 'Blood Glucose Level',
			value: glucoseSummary.value,
			unit: glucoseSummary.unit,
			date: glucoseSummary.date,
		},
		{
			id: 'spo2',
			label: 'Oxygen Saturation (spO2)',
			value: spo2Summary.value,
			unit: spo2Summary.unit,
			date: spo2Summary.date,
		},
	]

	const weightRecord = latestVitals['weight'] ?? null
	const weightValue = weightRecord?.value ?? {}
	const weightKg = Number(weightValue.value ?? weightValue.weight ?? 0)
	const heightCm = Number(weightValue.height ?? 0)
	const bmiFromRecord = Number(weightValue.bmi ?? 0)
	const bmiVal = bmiFromRecord || (weightKg && heightCm ? parseFloat((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1)) : 0)
	const bmiDate = weightRecord ? formatShortDate(weightRecord.recorded_at) : ''

	const activeTab = TAB_CONFIGS.find((t) => t.id === activeTabId)!

	const tableRows: VitalHistoryRow[] =
		activeTabId === 'ecg'
			? reports.map((r, i) => ({
					id: String(i),
					date: new Date(r.report_date).toLocaleDateString('en-GB'),
					cells: { reportType: r.report_type, notes: r.notes ?? '\u2014' },
				}))
			: historyVitals.map((v, i) => mapVitalToRow(v, activeTabId, i))

	// ECG upload: posts filename as the s3 key.
	// In production, upload file to S3 first, then record the returned key here.
	const handleEcgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		try {
			await createPatientReport({ patient_public_id: patientPublicId, report_type: 'ecg', report_date: new Date().toISOString().split('T')[0], file_s3_key: file.name, notes: null })
			toast.success('ECG report uploaded!')
			const refreshed = await getPatientReports(patientPublicId)
			setReports(refreshed)
		} catch {
			// handled globally by apiService interceptor
		}
		e.target.value = ''
	}

	return (
		<Box sx={{ position: 'relative' }}>
			{/* Summary cards */}
			<Grid container spacing={1.5} sx={{ mb: 3 }} alignItems="stretch">
				{summaryLoading ? (
					Array.from({ length: 5 }).map((_, i) => (
						<Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
							<AppSkeleton variant="rounded" width="100%" height={80} />
						</Grid>
					))
				) : summaryError ? (
					<Grid size={{ xs: 12 }}>
						<Alert severity="error" sx={{ borderRadius: 2 }}>
							Failed to load vitals summary. Please refresh the page.
						</Alert>
					</Grid>
				) : (
					<>
						{vitalsStats.map((stat) => (
							<Grid key={stat.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
								<VitalStatCard stat={stat} />
							</Grid>
						))}
						<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
							<WeightBmiCard weightKg={weightKg} heightCm={heightCm} bmi={bmiVal} date={bmiDate} />
						</Grid>
					</>
				)}
			</Grid>

			{/* History card */}
			<Box sx={{ ...customCardStyle, p: 0, overflow: 'hidden' }}>
				<Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
					<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
						Vitals History
					</Typography>
				</Box>

				<Box
					sx={{
						px: 2.5,
						pb: 1.5,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 2,
						flexWrap: 'wrap',
					}}
				>
					{/* Tab pills */}
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						{TAB_CONFIGS.map((tab, index) => {
							const isActive = activeTabId === tab.id
							return (
								<Box key={tab.id} sx={{ display: 'flex', alignItems: 'center' }}>
									<Box
										onClick={() => setActiveTabId(tab.id)}
										sx={{
											px: 2,
											py: 0.8,
											borderRadius: '6px',
											cursor: 'pointer',
											bgcolor: isActive ? 'primary.main' : 'transparent',
											transition: 'all 0.15s',
											'&:hover': { bgcolor: isActive ? 'primary.main' : 'rgba(43,111,113,0.06)' },
										}}
									>
										<Typography
											variant="body2"
											sx={{
												fontSize: '13px',
												fontWeight: isActive ? 600 : 400,
												color: isActive ? '#fff' : 'text.secondary',
												whiteSpace: 'nowrap',
											}}
										>
											{tab.label}
										</Typography>
									</Box>
									{index < TAB_CONFIGS.length - 1 && (
										<Typography sx={{ color: 'text.disabled', mx: 0.5 }}>|</Typography>
									)}
								</Box>
							)
						})}
					</Box>

					{/* Period filters + ECG upload */}
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							width: '100%',
							mt: 2,
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
							{PERIOD_OPTIONS.map((option) => {
								const isSelected = period === option.value
								return (
									<Box
										key={option.value}
										onClick={() => setPeriod(option.value)}
										sx={{
											px: 2.5,
											py: 0.7,
											borderRadius: '999px',
											cursor: 'pointer',
											fontSize: '12px',
											fontWeight: isSelected ? 600 : 400,
											transition: 'all 0.2s ease',
											backgroundColor: isSelected ? theme.palette.primary.main : '#F3F4F6',
											color: isSelected ? '#FFFFFF' : theme.palette.text.secondary,
											border: '1.5px solid',
											borderColor: isSelected ? theme.palette.primary.main : '#EAECF0',
											userSelect: 'none',
											'&:hover': {
												backgroundColor: isSelected
													? theme.palette.primary.dark
													: 'rgba(43,111,113,0.08)',
												borderColor: isSelected
													? theme.palette.primary.dark
													: theme.palette.primary.light,
												color: isSelected ? '#FFFFFF' : theme.palette.primary.main,
											},
										}}
									>
										{option.label}
									</Box>
								)
							})}
						</Box>

						{activeTabId === 'ecg' && (
							<Box
								component="label"
								sx={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									cursor: 'pointer',
									color: 'primary.main',
									minWidth: 80,
								}}
							>
								<CloudUploadOutlinedIcon sx={{ fontSize: 30, color: 'primary.main' }} />
								<Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'primary.main', mt: 0.1 }}>
									Upload
								</Typography>
								<input type="file" hidden accept=".pdf,.png,.jpg,.jpeg" onChange={handleEcgUpload} />
							</Box>
						)}
					</Box>
				</Box>

				{/* Error state for history */}
				{historyError && !historyLoading && (
					<Box sx={{ px: 2.5, pb: 2 }}>
						<Alert severity="error" sx={{ borderRadius: 2 }}>
							Failed to load vitals history. Please try again.
						</Alert>
					</Box>
				)}

				{/* Table */}
				<Box sx={{ overflowX: 'auto' }}>
					{historyLoading ? (
						<Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
							{Array.from({ length: 5 }).map((_, i) => (
								<AppSkeleton key={i} variant="rounded" width="100%" height={44} />
							))}
						</Box>
					) : (
						<Table size="small" sx={{ minWidth: activeTab.columns.length > 4 ? 800 : 'auto' }}>
							<TableHead>
								<TableRow sx={{ bgcolor: 'rgba(43,111,113,0.05)' }}>
									<TableCell
										sx={{
											fontWeight: 600,
											fontSize: '13px',
											color: 'text.primary',
											minWidth: 160,
											borderBottom: '1px solid',
											borderColor: 'divider',
										}}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
											Date <ArrowUpwardIcon sx={{ fontSize: 14 }} />
										</Box>
									</TableCell>
									{activeTab.columns.map((col) => (
										<TableCell
											key={col.key}
											sx={{
												fontWeight: 600,
												fontSize: '13px',
												color: 'text.primary',
												borderBottom: '1px solid',
												borderColor: 'divider',
												whiteSpace: 'nowrap',
											}}
										>
											{col.label}
											{col.refRange && (
												<Typography
													component="span"
													variant="caption"
													sx={{
														color: 'text.secondary',
														fontWeight: 400,
														fontSize: '11px',
														ml: 0.5,
													}}
												>
													{col.refRange}
												</Typography>
											)}
										</TableCell>
									))}
									<TableCell
										sx={{
											width: activeTab.showDownload ? 80 : 40,
											borderBottom: '1px solid',
											borderColor: 'divider',
										}}
									/>
								</TableRow>
							</TableHead>
							<TableBody>
								{tableRows.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={activeTab.columns.length + 2}
											sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}
										>
											No data available
										</TableCell>
									</TableRow>
								) : (
									tableRows.map((row) => (
										<TableRow
											key={row.id}
											sx={{
												'&:hover': { bgcolor: 'rgba(43,111,113,0.03)' },
												transition: 'all 0.1s',
											}}
										>
											<TableCell
												sx={{
													fontSize: '13px',
													color: 'text.secondary',
													borderBottom: '1px solid',
													borderColor: 'divider',
													whiteSpace: 'nowrap',
												}}
											>
												{row.date}
											</TableCell>
											{activeTab.columns.map((col) => (
												<TableCell
													key={col.key}
													sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
												>
													<DataCell
														value={row.cells[col.key] ?? '\u2014'}
														status={row.cellStatus?.[col.key]}
														showDot={col.showDot}
													/>
												</TableCell>
											))}
											<TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
												{activeTab.showDownload && (
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
														<Tooltip title="View" arrow>
															<IconButton
																size="small"
																sx={{
																	color: 'text.disabled',
																	'&:hover': { color: 'primary.main' },
																	'&:focus': { outline: 'none' },
																}}
															>
																<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
															</IconButton>
														</Tooltip>
														<Tooltip title="Download" arrow>
															<IconButton
																size="small"
																sx={{
																	color: 'text.disabled',
																	'&:hover': { color: 'primary.main' },
																	'&:focus': { outline: 'none' },
																}}
															>
																<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
															</IconButton>
														</Tooltip>
														<Tooltip title="AI Assistance" arrow>
															<IconButton
																size="small"
																sx={{
																	color: 'text.disabled',
																	'&:hover': { color: 'primary.main' },
																	'&:focus': { outline: 'none' },
																}}
															>
																<AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
															</IconButton>
														</Tooltip>
													</Box>
												)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					)}
				</Box>
			</Box>

			{/* FAB */}
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
				<Fab
					size="medium"
					onClick={() => setOpenVitalsModal(true)}
					sx={{
						bgcolor: 'primary.main',
						color: '#fff',
						'&:hover': { bgcolor: 'primary.dark' },
						'&:focus': { outline: 'none' },
						boxShadow: '0 4px 12px rgba(43,111,113,0.4)',
					}}
				>
					<AddIcon />
				</Fab>
			</Box>

			<AppModal
				open={openVitalsModal}
				onClose={() => setOpenVitalsModal(false)}
				maxWidth="sm"
				fullWidth
				showCloseButton={false}
				disableScroll
			>
				<AddVitals
					patientPublicId={patientPublicId}
					onClose={() => setOpenVitalsModal(false)}
					onSaved={handleVitalSaved}
				/>
			</AppModal>
		</Box>
	)
}
