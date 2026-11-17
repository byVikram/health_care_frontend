// src/components/common/Tabs/SegmentTabs.tsx
//
// A small segmented control on a grey track ("All" / "In-clinic" / "Video" on the Schedule page). No counts inside the segments.
import { Box } from '@mui/material'
import { DESK } from '../../../styles/deskTokens'
import type { TabOption } from './UnderlineTabs'

interface SegmentTabsProps<T extends string> {
	value: T
	options: TabOption<T>[]
	onChange: (value: T) => void
	ariaLabel?: string
}

export default function SegmentTabs<T extends string>({ value, options, onChange, ariaLabel }: SegmentTabsProps<T>) {
	return (
		<Box
			role="tablist"
			aria-label={ariaLabel}
			sx={{ display: 'flex', gap: '4px', p: '3px', borderRadius: '10px', bgcolor: DESK.segmentTrack }}
		>
			{options.map((option) => {
				const on = option.value === value
				return (
					<Box
						key={option.value}
						component="button"
						type="button"
						role="tab"
						aria-selected={on}
						onClick={() => onChange(option.value)}
						sx={{
							height: 32,
							px: '12px',
							border: 0,
							borderRadius: '8px',
							bgcolor: on ? DESK.raised : 'transparent',
							color: on ? DESK.ink : DESK.muted,
							boxShadow: on ? '0 1px 3px #12373E26' : 'none',
							fontFamily: 'inherit',
							fontSize: 13,
							fontWeight: 700,
							cursor: 'pointer',
						}}
					>
						{option.label}
					</Box>
				)
			})}
		</Box>
	)
}
