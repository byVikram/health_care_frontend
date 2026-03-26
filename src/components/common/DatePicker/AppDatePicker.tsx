// src/components/common/DatePicker/AppDatePicker.tsx
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { SxProps, Theme } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'

interface AppDatePickerProps {
	label?: string
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
}

export default function AppDatePicker({
	label,
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
}: AppDatePickerProps) {
	const dayjsValue = value ? dayjs(value, format) : null

	const handleChange = (newValue: Dayjs | null) => {
		onChange?.(newValue ? newValue.format(format) : null)
	}

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<DatePicker
				label={label}
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
					textField: {
						size,
						fullWidth,
						placeholder,
						sx: {
							'& .MuiOutlinedInput-root': {
								borderRadius: '6px',
								bgcolor: 'background.paper',
								transition: 'all 0.2s ease',
							},
							'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
								borderColor: 'primary.main',
							},
							'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
								borderColor: 'primary.main',
							},
							...sx,
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
}
