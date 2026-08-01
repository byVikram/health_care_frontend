// src/components/admin/verification/IssueFlagSelector.tsx
import { Box, Typography, Stack, Chip } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'

export const ISSUE_PRESETS = [
	'Blurry Image',
	'Wrong Document Type',
	'Expired Document',
	'Missing Information',
	'Name Mismatch',
	'Registration Number Mismatch',
	'Invalid Document',
	'Illegible Certificate Seal',
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
			<Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
				<FlagIcon sx={{ fontSize: 16, color: '#d97706' }} />
				<Typography variant="caption" fontWeight={800} color="#475569" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
					Document Issue Flags
				</Typography>
			</Stack>

			<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.25 }}>
				Click tags below to quickly flag issues for applicant re-upload or rejection:
			</Typography>

			<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
				{ISSUE_PRESETS.map((flag) => {
					const isSelected = selectedFlags.includes(flag)
					return (
						<Chip
							key={flag}
							label={flag}
							size="small"
							onClick={() => onToggleFlag(flag)}
							sx={{
								fontSize: '0.68rem',
								fontWeight: 700,
								cursor: 'pointer',
								bgcolor: isSelected ? '#fee2e2' : '#f1f5f9',
								color: isSelected ? '#dc2626' : '#475569',
								border: `1px solid ${isSelected ? '#fca5a5' : '#e2e8f0'}`,
								'&:hover': {
									bgcolor: isSelected ? '#fecaca' : '#fee2e2',
									color: '#dc2626',
								},
							}}
						/>
					)
				})}
			</Stack>
		</Box>
	)
}
