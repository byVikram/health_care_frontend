// src/features/consultation/components/PastMedicalHistory.tsx
import { useEffect, useMemo, useState } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined'
import { customCardStyle } from '../../../styles/commonStyles'

import PrescriptionIcon from '../../../assets/icons/consultation/prescription.svg'
import LabIcon from '../../../assets/icons/consultation/lab.svg'
import RadiologyIcon from '../../../assets/icons/consultation/radiology.svg'
import AncillaryIcon from '../../../assets/icons/consultation/ancillary.svg'
import {
	getPatientPastMedicalHistory,
	type PastMedicalHistoryCategory,
	type PastMedicalHistoryItem,
} from '../../patient/patientService'

const TABS: { id: PastMedicalHistoryCategory; label: string }[] = [
	{ id: 'prescription', label: 'Prescription' },
	{ id: 'laboratory', label: 'Laboratory' },
	{ id: 'radiology', label: 'Radiology' },
	{ id: 'ancillary', label: 'Ancillary' },
]

const EMPTY_MESSAGES: Record<PastMedicalHistoryCategory, string> = {
	prescription: 'No past prescription history!',
	laboratory: 'No past lab test history!',
	radiology: 'No past radiology history!',
	ancillary: 'No past ancillary history!',
}

const TAB_ICONS: Record<PastMedicalHistoryCategory, string> = {
	prescription: PrescriptionIcon,
	laboratory: LabIcon,
	radiology: RadiologyIcon,
	ancillary: AncillaryIcon,
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
	const [activeTab, setActiveTab] = useState<PastMedicalHistoryCategory>('laboratory')
	const [selectedDate, setSelectedDate] = useState('all')
	const [historyItems, setHistoryItems] = useState<PastMedicalHistoryItem[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const theme = useTheme()

	useEffect(() => {
		if (!patientPublicId) return

		const fetchHistory = async () => {
			try {
				setLoading(true)
				setError(null)

				const data = await getPatientPastMedicalHistory(patientPublicId)

				setHistoryItems(data)
			} catch (error) {
				console.error('Error fetching past medical history', error)
				setError('Failed to load past medical history. Please try again.')
				setHistoryItems([])
			} finally {
				setLoading(false)
			}
		}

		fetchHistory()
	}, [patientPublicId])

	const filteredHistoryItems = useMemo(
		() =>
			historyItems.filter(
				(item) => item.category === activeTab && isWithinDateRange(item.date, selectedDate)
			),
		[activeTab, historyItems, selectedDate]
	)

	return (
		<Box sx={{ ...customCardStyle, mt: 2, minHeight: '80vh', flexGrow: 1 }}>
			<Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
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

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
					filteredHistoryItems.map((item) => (
						<Box
							key={item.id}
							sx={{
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: '12px',
								p: 2,
								display: 'flex',
								flexDirection: 'column',
								gap: 1.5,
								backgroundColor: '#fff',
							}}
						>
							{/* Date */}
							<Typography
								sx={{
									fontSize: '13px',
									color: 'text.secondary',
									fontWeight: 600,
								}}
							>
								{formatHistoryDate(item.date)}
							</Typography>

							{item.title && (
								<Typography
									sx={{
										fontSize: '13px',
										color: 'text.primary',
										fontWeight: 600,
									}}
								>
									{item.title}
								</Typography>
							)}

							{/* PDF Preview */}
							{item.fileUrl && (
								<iframe
									src={`${item.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
									title={item.category}
									width="100%"
									height="300px"
									style={{
										border: '1px solid #e0e0e0',
										borderRadius: '8px',
									}}
								/>
							)}

							{/* Notes */}
							{item.notes && (
								<Typography
									sx={{
										fontSize: '14px',
										lineHeight: 1.6,
									}}
								>
									{item.notes}
								</Typography>
							)}
						</Box>
					))
				)}
			</Box>
		</Box>
	)
}
