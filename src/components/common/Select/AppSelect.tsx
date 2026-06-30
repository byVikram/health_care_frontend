// src/components/common/Select/AppSelect.tsx
import React, { forwardRef, ReactNode } from 'react'
import { TextField, MenuItem, InputAdornment, SxProps, Theme, TextFieldProps, Chip, Box, Checkbox } from '@mui/material'

interface SelectOption {
	value: string | number
	label: string
	disabled?: boolean
}

interface AppSelectProps extends Omit<TextFieldProps, 'variant' | 'select'> {
	label?: string
	placeholder?: string
	value?: string | number | string[]
	onChange?: React.ChangeEventHandler<HTMLInputElement>
	options?: SelectOption[]
	error?: boolean
	helperText?: string
	startIcon?: ReactNode
	endIcon?: ReactNode
	fullWidth?: boolean
	disabled?: boolean
	size?: 'small' | 'medium'
	variant?: 'outlined' | 'filled' | 'standard'
	sx?: SxProps<Theme>
	InputProps?: TextFieldProps['InputProps']
	multiple?: boolean
}

const AppSelect = forwardRef<HTMLDivElement, AppSelectProps>((props, ref) => {
	const {
		label,
		placeholder,
		value,
		onChange,
		options = [],
		error = false,
		helperText,
		startIcon,
		endIcon,
		fullWidth = true,
		disabled = false,
		size = 'small',
		variant = 'outlined',
		sx = {},
		InputProps,
		multiple = false,
		...rest
	} = props

	const inputProps = {
		...InputProps,
		startAdornment: startIcon ? (
			<InputAdornment position="start">{startIcon}</InputAdornment>
		) : (
			InputProps?.startAdornment
		),
		endAdornment: endIcon ? <InputAdornment position="end">{endIcon}</InputAdornment> : InputProps?.endAdornment,
	}

	const selectedValues: string[] = multiple
		? Array.isArray(value) ? (value as string[]) : []
		: []

	return (
		<TextField
			select
			ref={ref}
			label={label}
			value={multiple ? selectedValues : (value ?? '')}
			onChange={onChange}
			error={error}
			helperText={helperText}
			fullWidth={fullWidth}
			disabled={disabled}
			size={size}
			variant={variant}
			InputProps={inputProps}
			InputLabelProps={{ shrink: true }}
			SelectProps={{
				displayEmpty: true,
				multiple,
				...(multiple && {
					renderValue: (selected: unknown) => {
						const arr = selected as string[]
						if (!arr || arr.length === 0) {
							return (
								<Box component="span" sx={{ color: 'text.disabled', fontSize: '14px' }}>
									{placeholder ?? ''}
								</Box>
							)
						}
						return (
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
								{arr.map((val) => {
									const opt = options.find((o) => o.value === val)
									return (
										<Chip
											key={val}
											label={opt?.label ?? val}
											size="small"
											sx={{
												height: 22,
												fontSize: '12px',
												bgcolor: 'rgba(43,111,113,0.1)',
												color: 'primary.dark',
												fontWeight: 500,
												'& .MuiChip-label': { px: 1 },
											}}
										/>
									)
								})}
							</Box>
						)
					},
				}),
				MenuProps: {
					PaperProps: {
						sx: { mt: 1, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' },
					},
				},
			}}
			sx={{
				'& .MuiOutlinedInput-root': {
					bgcolor: 'background.paper',
					transition: 'all .2s ease',
					borderRadius: '6px',
					'&:hover fieldset': { borderColor: 'primary.main' },
					'&.Mui-focused fieldset': { borderWidth: '1px' },
				},
				'& .MuiSelect-select': { display: 'flex', alignItems: 'center', flexWrap: 'wrap' },
				...sx,
			}}
			{...rest}
		>
			{!multiple && placeholder && (
				<MenuItem value="" disabled>
					{placeholder}
				</MenuItem>
			)}
			{options.map((option) => (
				<MenuItem
					key={option.value}
					value={option.value}
					disabled={option.disabled}
					sx={{ borderRadius: 1, mx: 0.5, my: 0.3 }}
				>
					{multiple && (
						<Checkbox
							checked={selectedValues.includes(option.value as string)}
							size="small"
							sx={{ p: 0, mr: 1, color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
						/>
					)}
					{option.label}
				</MenuItem>
			))}
		</TextField>
	)
})

export default AppSelect