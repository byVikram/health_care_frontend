// src/components/common/Input/AppInput.tsx
import React, { forwardRef, ReactNode } from 'react'
import { Box, TextField, InputAdornment, Typography, SxProps, Theme, TextFieldProps } from '@mui/material'
import VoiceMicButton from '../Voice/VoiceMicButton'

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
    enableVoiceSearch?: boolean
    onVoiceResult?: (text: string) => void
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
        enableVoiceSearch = false,
        onVoiceResult,
        ...rest
    } = props

    const inputProps = {
        ...InputProps,
        startAdornment: startIcon ? (
            <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : (
            InputProps?.startAdornment
        ),

        endAdornment: (
            <InputAdornment position="end">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {InputProps?.endAdornment}

                    {endIcon}

                    {enableVoiceSearch && <VoiceMicButton onResult={(text) => onVoiceResult?.(text)} />}
                </Box>
            </InputAdornment>
        ),
    }

    const inputField = (
        <TextField
            ref={ref}
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
                ...(type === 'number'
                    ? {
                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                            },
                            '& input[type=number]': {
                                MozAppearance: 'textfield',
                            },
                      }
                    : {}),
                ...sx,
            }}
            {...rest}
        />
    )

    if (!label) {
        return inputField
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
            {inputField}
        </Box>
    )
})

AppInput.displayName = 'AppInput'

export default AppInput