// src/components/common/DatePicker/AppDatePicker.tsx
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Box, SxProps, Theme, Typography } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'

interface AppDatePickerProps {
	label?: string
	/**
	 * 'floating' (default): the label sits in the outline's notch.
	 * 'top': the label is drawn above the box, exactly like AppInput / AppSelect, so it lines up in a form row.
	 */
	labelPosition?: 'floating' | 'top'
	value?: string | null
	onChange?: (value: string | null) => void
	placeholder?: string
	disabled?: boolean
	readOnly?: boolean
	minDate?: string
	maxDate?: string
	disablePast?: boolean
	disableFuture?: boolean
	format?: string
	size?: 'small' | 'medium'
	fullWidth?: boolean
	sx?: SxProps<Theme>
	clearable?: boolean
}

export default function AppDatePicker({
	label,
	labelPosition = 'floating',
	value,
	onChange,
	placeholder,
	disabled = false,
	readOnly = false,
	minDate,
	maxDate,
	disablePast = false,
	disableFuture = false,
	format = 'DD/MM/YYYY',
	size = 'small',
	fullWidth = true,
	sx,
	clearable = false,
}: AppDatePickerProps) {
	const dayjsValue = value ? dayjs(value, format) : null

	const handleChange = (newValue: Dayjs | null) => {
		onChange?.(newValue ? newValue.format(format) : null)
	}

	const showTopLabel = labelPosition === 'top' && Boolean(label)

	const picker = (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<DatePicker
				label={showTopLabel ? undefined : label}
				value={dayjsValue}
				onChange={handleChange}
				disabled={disabled}
				readOnly={readOnly}
				disablePast={disablePast}
				disableFuture={disableFuture}
				minDate={minDate ? dayjs(minDate, format) : undefined}
				maxDate={maxDate ? dayjs(maxDate, format) : undefined}
				format={format}
				slotProps={{
					field: clearable ? { clearable: true, onClear: () => onChange?.(null) } : undefined,
					textField: {
						size,
						fullWidth,
						placeholder,
						// Force the label to float above the box (never inline), matching
						// AppSelect's InputLabelProps={{ shrink: true }} so "Date" lines up
						// visually with "Hospital" / "Mode" / "Status" in filter rows.
						InputLabelProps: { shrink: true },
						sx: {
							// MUI X v8's DatePicker renders its input via the new
							// PickersTextField/PickersOutlinedInput components by
							// default, which use MuiPickersOutlinedInput-* class
							// names -- NOT the classic MuiOutlinedInput-* ones that
							// AppSelect's plain MUI TextField uses. Target both so
							// the Date box's background/border/padding line up with
							// Hospital / Mode / Status regardless of which is active.
							'& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root': {
								borderRadius: '6px',
								bgcolor: 'background.paper',
								transition: 'all 0.2s ease',
								'&:hover .MuiOutlinedInput-notchedOutline, &:hover .MuiPickersOutlinedInput-notchedOutline': {
									borderColor: 'primary.main',
								},
								'&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
									borderWidth: '1px',
									borderColor: 'primary.main',
								},
							},
							// Match AppSelect's input padding/height exactly so the Date
							// box lines up pixel-for-pixel with Hospital / Mode / Status.
							'& .MuiOutlinedInput-input, & .MuiPickersOutlinedInput-input, & .MuiPickersSectionList-root': {
								padding: '8.5px 14px',
								fontSize: 'inherit',
							},
							...sx,
						},
					},
					// The calendar-icon trigger and (optional) clear-icon default to a
					// full IconButton with ripple + hover-circle background, which reads
					// as its own "button" next to Select's plain dropdown arrow. Strip
					// that down to a bare icon so Date matches the other filter fields.
					openPickerButton: {
						size: 'small',
						sx: {
							color: 'action.active',
							p: 0.5,
							mr: -0.5,
							'&:hover': { bgcolor: 'transparent' },
						},
					},
					day: {
						sx: {
							'&.Mui-selected': {
								bgcolor: 'primary.main',
								'&:hover': { bgcolor: 'primary.dark' },
							},
							'&:hover': {
								bgcolor: 'rgba(43,111,113,0.08)',
							},
						},
					},
					popper: {
						sx: {
							'& .MuiPaper-root': {
								borderRadius: '12px',
								boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
							},
						},
					},
				}}
			/>
		</LocalizationProvider>
	)

	if (!showTopLabel) return picker

	return (
		<Box sx={{ width: fullWidth ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}>
			<Typography
				variant="caption"
				sx={{
					display: 'block',
					fontWeight: 400,
					fontSize: '0.8rem',
					color: disabled ? 'text.disabled' : '#0f172a',
					mb: 0.75,
					letterSpacing: '0.01em',
				}}
			>
				{label}
			</Typography>
			{picker}
		</Box>
	)
}