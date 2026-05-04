// src/features/consultation/components/VitalsTab.tsx
import { useState } from 'react'
import { Box, Typography, Grid, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Fab, Divider } from '@mui/material'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined'
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined'
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined'
import AirOutlinedIcon from '@mui/icons-material/AirOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import AddIcon from '@mui/icons-material/Add'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import AppSelect from '../../../components/common/Select/AppSelect'
import { customCardStyle } from '../../../styles/commonStyles'
import { VitalStat, VitalHistoryRow } from '../../../types/consultation'

interface TabColumn {
	key: string
	label: string
	refRange?: string
	showDot?: boolean
	showTime?: boolean
}

interface TabConfig {
	id: string
	label: string
	columns: TabColumn[]
	showDownload?: boolean
	rows: VitalHistoryRow[]
}

const VITAL_STATS: VitalStat[] = [
	{ id: 'temp', label: 'Body Temperature', value: '98.6', unit: 'F', date: '17/04/25' },
	{ id: 'bp', label: 'Blood Pressure', value: '180/80', unit: 'mm/Hg', date: '17/04/25' },
	{ id: 'glucose', label: 'Blood Glucose Level', value: '85', unit: 'mm/dL', date: '17/04/2025' },
	{ id: 'spo2', label: 'Oxygen Saturation (spO2)', value: '79', unit: '%', date: '17/04/2025' },
]

// Weight/Height/BMI data (kept separate as it needs a custom card)
const WEIGHT_KG = 45
const HEIGHT_CM = 165
const BMI = parseFloat((WEIGHT_KG / Math.pow(HEIGHT_CM / 100, 2)).toFixed(1))
const BMI_DATE = '17/04/2025'

function getBmiCategory(bmi: number): { label: string; color: string } {
	if (bmi < 18.5) return { label: 'Underweight', color: '#f57c00' }
	if (bmi < 25) return { label: 'Normal', color: '#388e3c' }
	if (bmi < 30) return { label: 'Overweight', color: '#f57c00' }
	return { label: 'Obese', color: '#d32f2f' }
}

const VITAL_ICONS: Record<string, React.ReactNode> = {
	temp: <ThermostatIcon sx={{ fontSize: 28, color: '#e53935' }} />,
	bp: <FavoriteOutlinedIcon sx={{ fontSize: 28, color: '#e53935' }} />,
	glucose: <WaterDropOutlinedIcon sx={{ fontSize: 28, color: '#e53935' }} />,
	weight: <FitnessCenterOutlinedIcon sx={{ fontSize: 28, color: '#5c6bc0' }} />,
	spo2: <AirOutlinedIcon sx={{ fontSize: 28, color: '#29b6f6' }} />,
}

const PERIOD_OPTIONS = [
	{ value: '7days', label: 'Last 7 Days' },
	{ value: '30days', label: 'Last 30 Days' },
	{ value: '3months', label: 'Last 3 Months' },
	{ value: '1year', label: 'Last 1 Year' },
]

const TAB_CONFIGS: TabConfig[] = [
	{
		id: 'bp',
		label: 'Blood Pressure',
		columns: [
			{ key: 'morning', label: 'Morning', refRange: '90/60 - 120/80 mmHg', showDot: true, showTime: true },
			{ key: 'evening', label: 'Evening', refRange: '90/60 - 120/80 mmHg', showDot: true, showTime: true },
		],
		rows: [
			{
				id: '1',
				date: '03/01/2025',
				cells: { morning: '135/85 mmHg', evening: '180/80 mm/Hg' },
				cellStatus: { morning: 'abnormal', evening: 'abnormal' },
			},
			{
				id: '2',
				date: '17/04/2025',
				cells: { morning: '88/58 mmHg', evening: '78/48 mm/Hg' },
				cellStatus: { morning: 'abnormal', evening: 'abnormal' },
			},
			{
				id: '3',
				date: '15/12/2024',
				cells: { morning: '120/80 mmHg', evening: '120/80 mmHg' },
				cellStatus: { morning: 'normal', evening: 'normal' },
			},
			{
				id: '4',
				date: '17/12/2024',
				cells: { morning: '172/110 mmHg', evening: '185/120 mm/Hg' },
				cellStatus: { morning: 'abnormal', evening: 'abnormal' },
			},
			{
				id: '5',
				date: '15/8/2024',
				cells: { morning: '120/80 mmHg', evening: '120/80 mmHg' },
				cellStatus: { morning: 'normal', evening: 'normal' },
			},
			{
				id: '6',
				date: '5/8/2024',
				cells: { morning: '120/80 mmHg', evening: '120/80 mmHg' },
				cellStatus: { morning: 'normal', evening: 'normal' },
			},
		],
	},
	{
		id: 'glucose',
		label: 'Glucose Level',
		columns: [
			{ key: 'fasting', label: 'Fasting Sugar', refRange: '70 - 99 mg/dL', showDot: true, showTime: true },
			{ key: 'random', label: 'Random Sugar', refRange: '< 140 mg/dL', showDot: true, showTime: true },
		],
		rows: [
			{
				id: '1',
				date: '17/04/2025 07:40 AM',
				cells: { fasting: '140 mg/dL', random: '85 mg/dL' },
				cellStatus: { fasting: 'abnormal', random: 'normal' },
			},
			{
				id: '2',
				date: '03/01/2025 07:40 AM',
				cells: { fasting: '240 mg/dL', random: '65 mg/dL' },
				cellStatus: { fasting: 'abnormal', random: 'normal' },
			},
			{
				id: '3',
				date: '15/12/2024 07:40 AM',
				cells: { fasting: '90 mg/dL', random: '144 mg/dL' },
				cellStatus: { fasting: 'normal', random: 'abnormal' },
			},
			{
				id: '4',
				date: '17/12/2024 07:40 AM',
				cells: { fasting: '80 mg/dL', random: '148 mg/dL' },
				cellStatus: { fasting: 'normal', random: 'abnormal' },
			},
			{
				id: '5',
				date: '17/04/2025 07:40 AM',
				cells: { fasting: '140 mg/dL', random: '100 mg/dL' },
				cellStatus: { fasting: 'abnormal', random: 'normal' },
			},
			{
				id: '6',
				date: '5/8/2024 07:40 AM',
				cells: { fasting: '160 mg/dL', random: '120 mg/dL' },
				cellStatus: { fasting: 'abnormal', random: 'normal' },
			},
		],
	},
	{
		id: 'weight',
		label: 'Weight',
		columns: [{ key: 'weight', label: 'Weight in Kg', refRange: 'Ideal range: 58-70 kg', showDot: true }],
		rows: [
			{ id: '1', date: '17/04/2025 08:00 AM', cells: { weight: '45 Kg' }, cellStatus: { weight: 'abnormal' } },
			{ id: '2', date: '17/04/2025 08:00 AM', cells: { weight: '44 Kg' }, cellStatus: { weight: 'abnormal' } },
			{ id: '3', date: '17/04/2025 08:00 AM', cells: { weight: '55 Kg' }, cellStatus: { weight: 'abnormal' } },
			{ id: '4', date: '17/04/2025 08:00 AM', cells: { weight: '64 Kg' }, cellStatus: { weight: 'normal' } },
			{ id: '5', date: '17/04/2025 08:00 AM', cells: { weight: '64 Kg' }, cellStatus: { weight: 'normal' } },
			{ id: '6', date: '17/04/2025 08:00 AM', cells: { weight: '64 Kg' }, cellStatus: { weight: 'normal' } },
			{ id: '7', date: '17/04/2025 08:00 AM', cells: { weight: '64 Kg' }, cellStatus: { weight: 'normal' } },
		],
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
		rows: [
			{
				id: '1',
				date: '15/12/2024 10:00AM',
				cells: {
					waist: '60 cms',
					hba1c: '9 %',
					ldl: '87 mg/dL',
					hdl: '87 mg/dL',
					tgl: '87 mg/dL',
					respRate: '79 bpm',
					pulseRate: '79 bpm',
					spo2: '79',
					temp: '98.6 F',
				},
			},
			{
				id: '2',
				date: '17/04/2025 10:00AM',
				cells: {
					waist: '60 cms',
					hba1c: '9 %',
					ldl: '87 mg/dL',
					hdl: '87 mg/dL',
					tgl: '87 mg/dL',
					respRate: '79 bpm',
					pulseRate: '79 bpm',
					spo2: '79',
					temp: '98.6 F',
				},
			},
			{
				id: '3',
				date: '17/12/2024 10:00AM',
				cells: {
					waist: '60 cms',
					hba1c: '9 %',
					ldl: '87 mg/dL',
					hdl: '87 mg/dL',
					tgl: '87 mg/dL',
					respRate: '79 bpm',
					pulseRate: '79 bpm',
					spo2: '79',
					temp: '98.6 F',
				},
			},
			{
				id: '4',
				date: '5/8/2024 10:00AM',
				cells: {
					waist: '60 cms',
					hba1c: '9 %',
					ldl: '87 mg/dL',
					hdl: '87 mg/dL',
					tgl: '87 mg/dL',
					respRate: '79 bpm',
					pulseRate: '79 bpm',
					spo2: '79',
					temp: '98.6 F',
				},
			},
		],
	},
	{
		id: 'ecg',
		label: 'ECG',
		showDownload: true,
		columns: [
			{ key: 'heartRate', label: 'Heart Rate' },
			// { key: 'prInterval', label: 'PR Interval' },
			// { key: 'pDuration', label: 'P Duration' },
			// { key: 'qrsDuration', label: 'QRS Duration' },
			// { key: 'tDuration', label: 'T Duration' },
			// { key: 'qtQtc', label: 'QT/QTc' },
			// { key: 'pqrsAxis', label: 'P/QRS/T axis' },
			// { key: 'rvSv', label: 'R(v5) / S(v1)' },
		],
		rows: [
			{
				id: '1',
				date: '17/04/2025 10:00AM',
				cells: {
					heartRate: '120 bpm',
					// prInterval: '60 ms',
					// pDuration: '87 ms',
					// qrsDuration: '84 ms',
					// tDuration: '9 ms',
					// qtQtc: '70 ms',
					// pqrsAxis: '77 dgv',
					// rvSv: '91 mv',
				},
			},
			{
				id: '2',
				date: '03/01/2025 10:00AM',
				cells: {
					heartRate: '120 bpm',
					// prInterval: '60 ms',
					// pDuration: '87 ms',
					// qrsDuration: '84 ms',
					// tDuration: '9 ms',
					// qtQtc: '70 ms',
					// pqrsAxis: '77 dgv',
					// rvSv: '91 mv',
				},
			},
			{
				id: '3',
				date: '15/12/2024 10:00AM',
				cells: {
					heartRate: '120 bpm',
					// prInterval: '60 ms',
					// pDuration: '87 ms',
					// qrsDuration: '84 ms',
					// tDuration: '9 ms',
					// qtQtc: '70 ms',
					// pqrsAxis: '77 dgv',
					// rvSv: '91 mv',
				},
			},
			{
				id: '4',
				date: '17/12/2024 10:00AM',
				cells: {
					heartRate: '120 bpm',
					// prInterval: '60 ms',
					// pDuration: '87 ms',
					// qrsDuration: '84 ms',
					// tDuration: '9 ms',
					// qtQtc: '70 ms',
					// pqrsAxis: '77 dgv',
					// rvSv: '91 mv',
				},
			},
			{
				id: '5',
				date: '5/8/2024 10:00AM',
				cells: {
					heartRate: '120 bpm',
					// prInterval: '60 ms',
					// pDuration: '87 ms',
					// qrsDuration: '84 ms',
					// tDuration: '9 ms',
					// qtQtc: '70 ms',
					// pqrsAxis: '77 dgv',
					// rvSv: '91 mv',
				},
			},
		],
	},
]

function VitalStatCard({ stat }: { stat: VitalStat }) {
	return (
		<Box sx={{ ...customCardStyle, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, height: '100%', boxSizing: 'border-box' }}>
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

function WeightBmiCard() {
	const { label: bmiLabel, color: bmiColor } = getBmiCategory(BMI)
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
			{/* Header row: icon + date */}
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
				<FitnessCenterOutlinedIcon sx={{ fontSize: 22, color: '#5c6bc0' }} />
				<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.disabled' }}>
					{BMI_DATE}
				</Typography>
			</Box>

			{/* Three metrics in a row */}
			<Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
				{/* Weight */}
				<Box sx={{ flex: 1, textAlign: 'center' }}>
					<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.3 }}>
						<Typography sx={{ fontWeight: 700, fontSize: '15px', color: 'text.primary' }}>
							{WEIGHT_KG}
						</Typography>
						<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>Kg</Typography>
					</Box>
					<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary', display: 'block' }}>
						Weight
					</Typography>
				</Box>

				<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

				{/* Height */}
				<Box sx={{ flex: 1, textAlign: 'center' }}>
					<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.3 }}>
						<Typography sx={{ fontWeight: 700, fontSize: '15px', color: 'text.primary' }}>
							{HEIGHT_CM}
						</Typography>
						<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>cm</Typography>
					</Box>
					<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary', display: 'block' }}>
						Height
					</Typography>
				</Box>

				<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

				{/* BMI */}
				<Box sx={{ flex: 1, textAlign: 'center' }}>
					<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.3 }}>
						<Typography sx={{ fontWeight: 700, fontSize: '15px', color: bmiColor }}>
							{BMI}
						</Typography>
					</Box>
					<Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary', display: 'block' }}>
						BMI
					</Typography>
					<Typography variant="caption" sx={{ fontSize: '9px', color: bmiColor, fontWeight: 600, display: 'block' }}>
						{bmiLabel}
					</Typography>
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

export default function VitalsTab() {
	const [activeTabId, setActiveTabId] = useState('bp')
	const [period, setPeriod] = useState('30days')
	const activeTab = TAB_CONFIGS.find((t) => t.id === activeTabId)!

	return (
		<Box sx={{ position: 'relative' }}>
			<Grid container spacing={1.5} sx={{ mb: 3 }} alignItems="stretch">
				{VITAL_STATS.map((stat) => (
					<Grid key={stat.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
						<VitalStatCard stat={stat} />
					</Grid>
				))}
				{/* Weight / Height / BMI card occupies same slot width as others */}
				<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
					<WeightBmiCard />
				</Grid>
			</Grid>

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
					<AppSelect
						label=""
						value={period}
						options={PERIOD_OPTIONS}
						onChange={(e) => setPeriod(e.target.value as string)}
						size="small"
						sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
					/>
				</Box>

				<Box sx={{ overflowX: 'auto' }}>
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
							{activeTab.rows.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={activeTab.columns.length + 2}
										sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}
									>
										No data available
									</TableCell>
								</TableRow>
							) : (
								activeTab.rows.map((row) => (
									<TableRow
										key={row.id}
										sx={{ '&:hover': { bgcolor: 'rgba(43,111,113,0.03)' }, transition: 'all 0.1s' }}
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
													value={row.cells[col.key] ?? '—'}
													status={row.cellStatus?.[col.key]}
													showDot={col.showDot}
												/>
											</TableCell>
										))}
										<TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
												<IconButton
													size="small"
													sx={{
														color: 'text.disabled',
														'&:hover': { color: 'primary.main' },
														'&:focus': { outline: 'none' },
													}}
												>
													<EditOutlinedIcon sx={{ fontSize: 16 }} />
												</IconButton>
												{activeTab.showDownload && (
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
												)}
											</Box>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
				<Fab
					size="medium"
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
		</Box>
	)
}
