// src/components/common/Input/AppInput.tsx
import React, { forwardRef, ReactNode } from 'react'
import { TextField, InputAdornment, SxProps, Theme, TextFieldProps } from '@mui/material'

interface AppInputProps extends Omit<TextFieldProps, 'variant'> {
	label?: string
	value?: unknown
	onChange?: React.ChangeEventHandler<HTMLInputElement>
	placeholder?: string
	type?: string
	error?: boolean
	helperText?: string
	startIcon?: ReactNode
	endIcon?: ReactNode
	fullWidth?: boolean
	disabled?: boolean
	multiline?: boolean
	rows?: number
	variant?: 'outlined' | 'filled' | 'standard'
	size?: 'small' | 'medium'
	sx?: SxProps<Theme>
	InputProps?: TextFieldProps['InputProps']
}

const AppInput = forwardRef<HTMLDivElement, AppInputProps>((props, ref) => {
	const {
		label,
		value,
		onChange,
		placeholder,
		type = 'text',
		error = false,
		helperText,
		startIcon,
		endIcon,
		fullWidth = true,
		disabled = false,
		multiline = false,
		rows,
		variant = 'outlined',
		size = 'small',
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
			ref={ref}
			label={label}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			type={type}
			error={error}
			helperText={helperText}
			fullWidth={fullWidth}
			disabled={disabled}
			multiline={multiline}
			rows={rows}
			variant={variant}
			size={size}
			InputProps={inputProps}
			sx={{
				'& .MuiOutlinedInput-root': {
					bgcolor: 'background.paper',
					transition: 'all 0.2s ease',
					borderRadius: '6px',
				},
				...sx,
			}}
			{...rest}
		/>
	)
})

AppInput.displayName = 'AppInput'

export default AppInput
