// src/features/consultation/components/PastMedicalHistory.tsx
import { useState } from 'react'
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material'
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined'
import { customCardStyle } from '../../../styles/commonStyles'

import PrescriptionIcon from '../../../assets/icons/consultation/prescription.svg'
import LabIcon from '../../../assets/icons/consultation/lab.svg'
import RadiologyIcon from '../../../assets/icons/consultation/radiology.svg'
import AncillaryIcon from '../../../assets/icons/consultation/ancillary.svg'

const TABS = [
	{ id: 'prescription', label: 'Prescription' },
	{ id: 'laboratory', label: 'Laboratory' },
	{ id: 'radiology', label: 'Radiology' },
	{ id: 'ancillary', label: 'Ancillary' },
]

const EMPTY_MESSAGES: Record<string, string> = {
	prescription: 'No past prescription history!',
	laboratory: 'No past lab test history!',
	radiology: 'No past radiology history!',
	ancillary: 'No past ancillary history!',
}

// Illustrated icon placeholders — swap with actual images when available
const TAB_ICONS: Record<string, string> = {
	prescription: PrescriptionIcon,
	laboratory: LabIcon,
	radiology: RadiologyIcon,
	ancillary: AncillaryIcon,
}

const DATE_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'today', label: 'Today' },
	{ value: 'week', label: 'This Week' },
	{ value: 'month', label: 'This Month' },
	{ value: '3months', label: 'Last 3 Months' },
	{ value: 'year', label: 'This Year' },
]

export default function PastMedicalHistory() {
	const [activeTab, setActiveTab] = useState('laboratory')
	const [selectedDate, setSelectedDate] = useState('all')

	return (
		<Box sx={{ ...customCardStyle, mt: 2 }}>
			<Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.dark' }}>
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
							{/* TAB_ICONS[tab.id] */}
							{/* <img /> */}

							<img
								src={TAB_ICONS[tab.id]}
								// alt={title}
								style={{ width: 42, height: 42, objectFit: 'cover' }}
							/>
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

			{/* Select date */}
			<Typography
				variant="caption"
				sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 500, display: 'block', mb: 0.8 }}
			>
				Select date
			</Typography>
			<FormControl fullWidth size="small" sx={{ mb: 3 }}>
				<Select
					value={selectedDate}
					onChange={(e) => setSelectedDate(e.target.value)}
					displayEmpty
					sx={{ borderRadius: '8px', fontSize: '13px', color: 'primary.main', fontWeight: 500 }}
				>
					{DATE_OPTIONS.map((opt) => (
						<MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '13px' }}>
							{opt.label}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			{/* Empty state */}
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 1.5 }}>
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
					<SentimentDissatisfiedOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
				</Box>
				<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13.5px', fontWeight: 500 }}>
					{EMPTY_MESSAGES[activeTab]}
				</Typography>
			</Box>
		</Box>
	)
}
