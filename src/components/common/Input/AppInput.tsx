// src/components/common/Input/AppInput.tsx
import React, { forwardRef, ReactNode, useState } from 'react'
import { Box, TextField, InputAdornment, Typography, SxProps, Theme, TextFieldProps } from '@mui/material'
import MicIcon from '@mui/icons-material/Mic'

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

    const [isListening, setIsListening] = useState(false)
    const startListening = () => {
        type SpeechRecognitionConstructor = new () => {
            lang: string
            continuous: boolean
            interimResults: boolean
            start: () => void
            onresult: ((event: Event) => void) | null
            onend: (() => void) | null
            onerror: (() => void) | null
        }
        const SpeechRecognition =
            (
                window as typeof window & {
                    SpeechRecognition?: SpeechRecognitionConstructor
                    webkitSpeechRecognition?: SpeechRecognitionConstructor
                }
            ).SpeechRecognition ||
            (
                window as typeof window & {
                    SpeechRecognition?: SpeechRecognitionConstructor
                    webkitSpeechRecognition?: SpeechRecognitionConstructor
                }
            ).webkitSpeechRecognition

        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser')
            return
        }

        const recognition = new SpeechRecognition()

        recognition.lang = 'en-US'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.start()

        setIsListening(true)

        recognition.onresult = (event: Event) => {
            const speechEvent = event as unknown as {
                results: ArrayLike<ArrayLike<{ transcript: string }>>
            }

            const transcript = speechEvent.results[0][0].transcript

            onVoiceResult?.(transcript)
        }
        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.onerror = () => {
            setIsListening(false)
        }
    }

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

                    {enableVoiceSearch && (
                        <MicIcon
                            onClick={startListening}
                            sx={{
                                cursor: 'pointer',
                                color: isListening ? 'red' : 'text.secondary',
                            }}
                        />
                    )}
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