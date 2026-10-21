// src/components/admin/verification/IssueFlagSelector.tsx
import React from 'react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SearchIcon from '@mui/icons-material/Search'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'

export const ISSUE_PRESETS: Array<{ label: string; icon: React.ReactElement }> = [
	{ label: 'Blurry Image', icon: <DescriptionOutlinedIcon sx={{ fontSize: 12 }} /> },
	{ label: 'Wrong Document Type', icon: <FilterAltOutlinedIcon sx={{ fontSize: 12 }} /> },
	{ label: 'Expired Document', icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} /> },
	{ label: 'Missing Information', icon: <InfoOutlinedIcon sx={{ fontSize: 12 }} /> },
	{ label: 'Name Mismatch', icon: <SearchIcon sx={{ fontSize: 12 }} /> },
	{ label: 'Registration Number Mismatch', icon: <BadgeOutlinedIcon sx={{ fontSize: 12 }} /> },
	{ label: 'Invalid Document', icon: <EditOutlinedIcon sx={{ fontSize: 12 }} /> },
	{ label: 'Illegible Certificate Seal', icon: <AccountBalanceOutlinedIcon sx={{ fontSize: 12 }} /> },
]

interface IssueFlagSelectorProps {
	selectedFlags: string[]
	onToggleFlag: (flag: string) => void
}

export default function IssueFlagSelector({
	selectedFlags,
	onToggleFlag,
}: IssueFlagSelectorProps) {
	return (
		<Box>
			<Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
				<FlagIcon sx={{ fontSize: 15, color: '#d97706' }} />
				<Typography variant="caption" fontWeight={800} color="#0f172a" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11.5px' }}>
					Document Issue Flags
				</Typography>
			</Stack>

			<Typography variant="caption" color="#64748b" display="block" sx={{ mb: 1, fontSize: '11px', fontStyle: 'italic', lineHeight: 1.35 }}>
				Click tags to flag issues for applicant re-upload or rejection:
			</Typography>

			<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ gap: '5px' }}>
				{ISSUE_PRESETS.map((item) => {
					const isSelected = selectedFlags.includes(item.label)
					return (
						<Chip
							key={item.label}
							icon={item.icon}
							label={item.label}
							size="small"
							onClick={() => onToggleFlag(item.label)}
							sx={{
								fontSize: '0.67rem',
								fontWeight: isSelected ? 700 : 500,
								cursor: 'pointer',
								py: 1.2,
								px: 0.25,
								height: 22,
								bgcolor: isSelected ? '#fee2e2' : '#f8fafc',
								color: isSelected ? '#dc2626' : '#475569',
								border: '1px solid',
								borderColor: isSelected ? '#fca5a5' : '#e2e8f0',
								borderRadius: '16px',
								transition: 'all 0.15s ease',
								'& .MuiChip-icon': {
									color: isSelected ? '#dc2626' : '#64748b',
									fontSize: 12,
								},
								'&:hover': {
									bgcolor: isSelected ? '#fecaca' : '#f1f5f9',
									borderColor: isSelected ? '#f87171' : '#cbd5e1',
									color: isSelected ? '#dc2626' : '#0f172a',
								},
							}}
						/>
					)
				})}
			</Stack>
		</Box>
	)
}
