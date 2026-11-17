// src/components/common/Tabs/UnderlineTabs.tsx
//
// The text tabs with a teal underline under the chosen one ("Upcoming" / "Past" on My bookings). No counts inside the tabs.
import { Box } from '@mui/material'
import { DESK } from '../../../styles/deskTokens'

export interface TabOption<T extends string = string> {
	value: T
	label: string
}

interface UnderlineTabsProps<T extends string> {
	value: T
	options: TabOption<T>[]
	onChange: (value: T) => void
	ariaLabel?: string
}

export default function UnderlineTabs<T extends string>({ value, options, onChange, ariaLabel }: UnderlineTabsProps<T>) {
	return (
		<Box
			role="tablist"
			aria-label={ariaLabel}
			sx={{ display: 'flex', gap: '24px', borderBottom: `1px solid ${DESK.line}` }}
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
							height: 42,
							px: '2px',
							border: 0,
							bgcolor: 'transparent',
							color: on ? DESK.ink : DESK.muted,
							fontFamily: 'inherit',
							fontSize: 15,
							fontWeight: on ? 800 : 600,
							boxShadow: on ? `inset 0 -2px 0 ${DESK.primary}` : 'none',
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
