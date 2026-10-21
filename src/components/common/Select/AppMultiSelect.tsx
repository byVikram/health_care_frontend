// src/components/common/Select/AppMultiSelect.tsx
import { forwardRef, ReactNode } from 'react'
import {
	TextField,
	MenuItem,
	InputAdornment,
	Typography,
	Chip,
	Box,
	Checkbox,
	ListItemText,
	SxProps,
	Theme,
	TextFieldProps,
} from '@mui/material'

export interface MultiSelectOption {
	value: string | number
	label: string
}

interface AppMultiSelectProps extends Omit<TextFieldProps, 'variant' | 'select' | 'value' | 'onChange'> {
	label?: string
	value?: (string | number)[]
	onChange?: (selected: (string | number)[]) => void
	options?: MultiSelectOption[]
	error?: boolean
	helperText?: string
	startIcon?: ReactNode
	placeholder?: string
	fullWidth?: boolean
	disabled?: boolean
	size?: 'small' | 'medium'
	variant?: 'outlined' | 'filled' | 'standard'
	maxChips?: number
	sx?: SxProps<Theme>
}

const AppMultiSelect = forwardRef<HTMLDivElement, AppMultiSelectProps>((props, ref) => {
	const {
		label,
		value = [],
		onChange,
		options = [],
		error = false,
		helperText,
		startIcon,
		placeholder,
		fullWidth = true,
		disabled = false,
		size = 'small',
		variant = 'outlined',
		maxChips = 3,
		sx = {},
		...rest
	} = props

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		onChange?.(event.target.value as (string | number)[])
	}

	const handleDelete = (val: string | number) => {
		onChange?.(value.filter((v) => v !== val))
	}

	const getLabelForValue = (val: string | number) => options.find((o) => o.value === val)?.label ?? String(val)

	const multiSelectField = (
		<TextField
			select
			ref={ref}
			value={value}
			onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
			error={error}
			helperText={helperText}
			fullWidth={fullWidth}
			disabled={disabled}
			size={size}
			variant={variant}
			InputProps={{
				startAdornment: startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : undefined,
			}}
			SelectProps={{
				multiple: true,
				displayEmpty: false,
				MenuProps: {
					PaperProps: {
						sx: { mt: 1, boxShadow: '0 6px 20px rgba(0,0,0,0.12)', maxHeight: 280 },
					},
				},
				renderValue: (selected) => {
					const vals = selected as (string | number)[]
					if (vals.length === 0) {
						return <Box sx={{ color: 'text.disabled', fontSize: '14px' }}>{placeholder || 'Select...'}</Box>
					}
					const visible = vals.slice(0, maxChips)
					const remaining = vals.length - maxChips
					return (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
							{visible.map((val) => (
								<Chip
									key={val}
									label={getLabelForValue(val)}
									size="small"
									onDelete={() => handleDelete(val)}
									onMouseDown={(e) => e.stopPropagation()}
									sx={{
										bgcolor: 'rgba(0,0,0,0.08)', // neutral gray
										color: 'text.primary',
										fontWeight: 600,
										fontSize: '11px',
										height: 22,
										'& .MuiChip-deleteIcon': {
											fontSize: '14px',
											color: 'text.secondary',
											'&:hover': { color: 'error.main' },
										},
									}}
								/>
							))}
							{remaining > 0 && (
								<Chip
									label={`+${remaining} more`}
									size="small"
									sx={{
										bgcolor: 'divider',
										color: 'text.secondary',
										fontSize: '11px',
										height: 22,
									}}
								/>
							)}
						</Box>
					)
				},
			}}
			sx={{
				'& .MuiOutlinedInput-root': {
					bgcolor: 'background.paper',
					transition: 'all 0.2s ease',
					'&:hover fieldset': { borderColor: 'text.secondary' }, // neutral hover
					'&.Mui-focused fieldset': { borderWidth: '1px', borderColor: 'text.primary' },
				},
				...sx,
			}}
			{...rest}
		>
			{options.map((option) => {
				const isSelected = value.includes(option.value)
				return (
					<MenuItem
						key={option.value}
						value={option.value}
						sx={{
							borderRadius: 1,
							mx: 0.5,
							my: 0.2,
							bgcolor: isSelected ? 'rgba(0,0,0,0.0)' : 'transparent',
							'&:hover': { bgcolor: 'rgba(0,0,0,0.0)' },
						}}
					>
						<Checkbox
							checked={isSelected}
							size="small"
							sx={{
								color: 'text.disabled',
								'&.Mui-checked': { color: '#666' }, // neutral gray instead of primary.main
								p: 0.5,
								mr: 1,
							}}
						/>
						<ListItemText primary={option.label} primaryTypographyProps={{ fontSize: '14px' }} />
					</MenuItem>
				)
			})}
		</TextField>
	)

	if (!label) {
		return multiSelectField
	}

	return (
		<Box sx={{ width: fullWidth ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}>
			<Typography
				variant="caption"
				sx={{
					display: 'block',
					fontWeight: 400,
					fontSize: '0.8rem',
					color: disabled ? 'text.disabled' : error ? 'error.main' : '#0f172a',
					mb: 0.75,
					letterSpacing: '0.01em',
				}}
			>
				{label}
			</Typography>
			{multiSelectField}
		</Box>
	)
})

AppMultiSelect.displayName = 'AppMultiSelect'

export default AppMultiSelect
