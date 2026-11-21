// src/components/common/PillToggle/PillToggle.tsx
//
// The teal pill toggle of the booking pages ("Clinic Visit ₹0 / Video Call ₹0" on the doctor's slot picker, "Home visit / Visit a lab" on the
// lab cart): a teal track with one white segment for the chosen option. Each option has a label and, optionally, a small second line
// (a price, "Free"). It only reports the choice. `compact` makes it as wide as its options instead of the full width.
import { Box, Typography } from '@mui/material'

export interface PillToggleOption<T extends string> {
	value: T
	label: string
	/** The small second line under the label (a price, "Free"). */
	sub?: string
}

interface PillToggleProps<T extends string> {
	/** The chosen option; none is highlighted while it is undefined. */
	value?: T
	options: PillToggleOption<T>[]
	onChange: (value: T) => void
	ariaLabel?: string
	/** As wide as the options instead of the full width. */
	compact?: boolean
	/** 'md' is the doctor slot picker's size; 'lg' has bigger text and a taller pill. */
	size?: 'md' | 'lg'
}

const SIZES = {
	md: { label: '12px', sub: '10px', px: 3, py: 0.85 },
	lg: { label: '15px', sub: '12px', px: 4, py: 1.35 },
} as const

export default function PillToggle<T extends string>({
	value,
	options,
	onChange,
	ariaLabel,
	compact = false,
	size = 'md',
}: PillToggleProps<T>) {
	const s = SIZES[size]
	return (
		<Box sx={{ display: 'flex', justifyContent: 'flex-start', width: compact ? 'auto' : '100%' }}>
			<Box
				role="radiogroup"
				aria-label={ariaLabel}
				sx={{
					display: 'flex',
					bgcolor: 'primary.main',
					borderRadius: '50px',
					p: '3px',
					gap: '3px',
					width: compact ? 'auto' : '100%',
				}}
			>
				{options.map((option) => {
					const on = option.value === value
					return (
						<Box
							key={option.value}
							component="button"
							type="button"
							role="radio"
							aria-checked={on}
							onClick={() => onChange(option.value)}
							sx={{
								display: 'flex',
								alignItems: 'center',
								flexDirection: 'column',
								justifyContent: 'center',
								flex: compact ? '0 0 auto' : 1,
								px: s.px,
								py: s.py,
								border: 0,
								borderRadius: '50px',
								cursor: 'pointer',
								bgcolor: on ? '#fff' : 'transparent',
								fontFamily: 'inherit',
								transition: 'all 0.2s',
								userSelect: 'none',
								'&:focus-visible': { outline: '2px solid #fff', outlineOffset: '-4px' },
							}}
						>
							<Typography
								component="span"
								sx={{
									fontSize: s.label,
									fontWeight: 600,
									color: on ? 'text.primary' : '#fff',
									lineHeight: 1.3,
								}}
							>
								{option.label}
							</Typography>
							{option.sub !== undefined && (
								<Typography
									component="span"
									sx={{
										fontSize: s.sub,
										fontWeight: 500,
										color: on ? 'text.secondary' : 'rgba(255,255,255,0.8)',
										lineHeight: 1.2,
									}}
								>
									{option.sub}
								</Typography>
							)}
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}
