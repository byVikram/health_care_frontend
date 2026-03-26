// src/components/common/Select/AppSelect.tsx
import React, { forwardRef, ReactNode } from 'react'
import { TextField, MenuItem, InputAdornment, SxProps, Theme, TextFieldProps } from '@mui/material'

interface SelectOption {
	value: string | number
	label: string
}

interface AppSelectProps extends Omit<TextFieldProps, 'variant' | 'select'> {
	label?: string
	placeholder?: string
	value?: string | number
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

	return (
		<TextField
			select
			ref={ref}
			label={label}
			value={value ?? ''}
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
				'& .MuiSelect-select': { display: 'flex', alignItems: 'center' },
				...sx,
			}}
			{...rest}
		>
			{placeholder && (
				<MenuItem value="" disabled>
					{placeholder}
				</MenuItem>
			)}
			{options.map((option) => (
				<MenuItem key={option.value} value={option.value} sx={{ borderRadius: 1, mx: 0.5, my: 0.3 }}>
					{option.label}
				</MenuItem>
			))}
		</TextField>
	)
})

export default AppSelect
