// src/features/consultation/components/PastMedicalHistory.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined'
import { customCardStyle, customScrollbar } from '../../../styles/commonStyles'
import LabHistoryCard from './LabHistoryCard'
import PrescriptionHistoryCard from './PrescriptionHistoryCard'

import PrescriptionIcon from '../../../assets/icons/consultation/prescription.svg'
import LabIcon from '../../../assets/icons/consultation/lab.svg'
import {
	getPatientPrescriptionHistory,
	getPatientLaboratoryHistory,
	type PastMedicalHistoryCategory,
	type PastMedicalHistoryItem,
} from '../../patient/patientService'

// One API per tab: the visits' history (prescription) and the laboratory reports.
const HISTORY_FETCHERS: Partial<Record<PastMedicalHistoryCategory, (patientPublicId: string) => Promise<PastMedicalHistoryItem[]>>> = {
	prescription: getPatientPrescriptionHistory,
	laboratory: getPatientLaboratoryHistory,
}

const TABS: { id: PastMedicalHistoryCategory; label: string }[] = [
	{ id: 'prescription', label: 'Prescription' },
	{ id: 'laboratory', label: 'Laboratory' },
]

const EMPTY_MESSAGES: Record<PastMedicalHistoryCategory, string> = {
	prescription: 'No past prescription history!',
	laboratory: 'No past lab test history!',
}

const TAB_ICONS: Record<PastMedicalHistoryCategory, string> = {
	prescription: PrescriptionIcon,
	laboratory: LabIcon,
}

const DATE_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'today', label: 'Today' },
	{ value: 'yesterday', label: 'Yesterday' },
	{ value: '7days', label: '7 Days' },
	{ value: '30days', label: '30 Days' },
	{ value: '90days', label: '90 Days' },
	{ value: 'custom', label: 'Custom' },
]

interface Props {
	patientPublicId?: string
}

function getDateRange(value: string): { start?: Date; end?: Date } {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const end = new Date(today)
	end.setHours(23, 59, 59, 999)

	if (value === 'today') {
		return { start: today, end }
	}

	if (value === 'yesterday') {
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)
		const yesterdayEnd = new Date(yesterday)
		yesterdayEnd.setHours(23, 59, 59, 999)
		return { start: yesterday, end: yesterdayEnd }
	}

	const days = value === '7days' ? 7 : value === '30days' ? 30 : value === '90days' ? 90 : undefined

	if (!days) {
		return {}
	}

	const start = new Date(today)
	start.setDate(start.getDate() - days + 1)

	return { start, end }
}

function isWithinDateRange(dateValue: string, rangeValue: string): boolean {
	const { start, end } = getDateRange(rangeValue)

	if (!start || !end) {
		return true
	}

	const itemDate = new Date(dateValue)

	if (Number.isNaN(itemDate.getTime())) {
		return false
	}

	return itemDate >= start && itemDate <= end
}

function formatHistoryDate(dateValue: string): string {
	const date = new Date(dateValue)

	if (Number.isNaN(date.getTime())) {
		return dateValue || '-'
	}

	return new Intl.DateTimeFormat('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	}).format(date)
}

export default function PastMedicalHistory({ patientPublicId }: Props) {
	const [activeTab, setActiveTab] = useState<PastMedicalHistoryCategory>('prescription')
	const [selectedDate, setSelectedDate] = useState('all')
	const [historyItems, setHistoryItems] = useState<PastMedicalHistoryItem[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const theme = useTheme()

	// Cache fetched results per category so switching tabs back and forth
	// doesn't re-call laboratory-reports/radiology-reports/history APIs.
	const historyCacheRef = useRef<Partial<Record<PastMedicalHistoryCategory, PastMedicalHistoryItem[]>>>({})

	useEffect(() => {
		if (!patientPublicId) return

		const fetcher = HISTORY_FETCHERS[activeTab]
		if (!fetcher) {
			setHistoryItems([])
			setError(null)
			setLoading(false)
			return
		}

		// The prescription links are signed and expire after about 5 minutes: that tab is fetched again each time it is opened.
		const cached = activeTab === 'prescription' ? undefined : historyCacheRef.current[activeTab]
		if (cached) {
			setHistoryItems(cached)
			setError(null)
			setLoading(false)
			return
		}

		let cancelled = false

		const fetchHistory = async () => {
			try {
				setLoading(true)
				setError(null)

				const data = await fetcher(patientPublicId)
				if (cancelled) return

				if (activeTab !== 'prescription') historyCacheRef.current[activeTab] = data
				setHistoryItems(data)
			} catch (error) {
				if (cancelled) return
				console.error('Error fetching past medical history', error)
				setError('Failed to load past medical history. Please try again.')
				setHistoryItems([])
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		fetchHistory()

		return () => {
			cancelled = true
		}
	}, [activeTab, patientPublicId])

	const filteredHistoryItems = useMemo(
		() => historyItems.filter((item) => isWithinDateRange(item.date, selectedDate)),
		[historyItems, selectedDate]
	)

	return (
		<Box
			sx={{
				...customCardStyle,
				mt: 2,
				height: '90vh',
				flexGrow: 1,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', flexShrink: 0 }}>
				Past medical history
			</Typography>

			{/* Category tabs */}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-around',
					mb: 2,
					borderBottom: '1px solid',
					borderColor: 'divider',
					pb: 1,
					flexShrink: 0,
				}}
			>
				{TABS.map((tab) => {
					const isActive = activeTab === tab.id
					return (
						<Box
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								cursor: 'pointer',
								px: 1,
								pb: 1,
								borderBottom: isActive ? '2.5px solid' : '2.5px solid transparent',
								borderColor: isActive ? 'primary.main' : 'transparent',
								transition: 'all 0.15s',
							}}
						>
							<img src={TAB_ICONS[tab.id]} style={{ width: 42, height: 42, objectFit: 'cover' }} />
							<Typography
								variant="caption"
								sx={{
									fontSize: '12px',
									fontWeight: isActive ? 600 : 400,
									mt: 0.5,
									color: isActive ? 'primary.main' : 'text.secondary',
								}}
							>
								{tab.label}
							</Typography>
						</Box>
					)
				})}
			</Box>

			{/* Date Filter Pills */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					flexWrap: 'wrap',
					mb: 2,
					flexShrink: 0,
				}}
			>
				{DATE_OPTIONS.map((option) => {
					const isSelected = selectedDate === option.value

					return (
						<Box
							key={option.value}
							onClick={() => setSelectedDate(option.value)}
							sx={{
								px: 1.5,
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
									backgroundColor: isSelected ? theme.palette.primary.dark : 'rgba(43,111,113,0.08)',
									borderColor: isSelected ? theme.palette.primary.dark : theme.palette.primary.light,
									color: isSelected ? '#FFFFFF' : theme.palette.primary.main,
								},
							}}
						>
							{option.label}
						</Box>
					)
				})}
			</Box>

			{/* Results list — scrolls on its own; header/tabs/filters above stay fixed. */}
			<Box
				sx={{
					flex: 1,
					overflowY: 'auto',
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					pr: 0.5,
					...customScrollbar,
				}}
			>
				{loading ? (
					<Typography sx={{ color: 'text.secondary', fontSize: '13.5px' }}>Loading...</Typography>
				) : error ? (
					<Typography sx={{ color: 'error.main', fontSize: '13.5px', fontWeight: 500 }}>{error}</Typography>
				) : filteredHistoryItems.length === 0 ? (
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							py: 4,
							gap: 1.5,
						}}
					>
						<Box
							sx={{
								width: 80,
								height: 80,
								borderRadius: '50%',
								border: '2px solid',
								borderColor: 'divider',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<SentimentDissatisfiedOutlinedIcon
								sx={{
									fontSize: 44,
									color: 'text.disabled',
								}}
							/>
						</Box>

						<Typography
							variant="body2"
							sx={{
								color: 'text.secondary',
								fontSize: '13.5px',
								fontWeight: 500,
							}}
						>
							{EMPTY_MESSAGES[activeTab]}
						</Typography>
					</Box>
				) : (
					filteredHistoryItems.map((item) =>
						item.category === 'prescription' ? (
							// Prescriptions and lab reports are the same card with a button that opens the file in a dialog, not inline.
							<PrescriptionHistoryCard key={item.id} item={item} dateLabel={formatHistoryDate(item.date)} />
						) : (
							<LabHistoryCard key={item.id} item={item} dateLabel={formatHistoryDate(item.date)} />
						)
					)
				)}
			</Box>
		</Box>
	)
}
