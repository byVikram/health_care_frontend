// src/features/patient/components/PatientProfileField.tsx
import { useState } from 'react'
import { Box, Typography, Divider, IconButton } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppButton from '../../../components/common/Button/AppButton'

export interface SelectOption {
	value: string
	label: string
}

interface PatientProfileFieldProps {
	label: string
	value?: string
	verified?: boolean
	readOnly?: boolean
	type?: string
	selectOptions?: SelectOption[]
	onSave?: (value: string) => void
	showDivider?: boolean
}

export default function PatientProfileField({
	label,
	value = '',
	verified = false,
	readOnly = false,
	type = 'text',
	selectOptions,
	onSave,
	showDivider = true,
}: PatientProfileFieldProps) {
	const [editing, setEditing] = useState(false)
	const [inputVal, setInputVal] = useState(value)

	const hasValue = Boolean(value && value.trim())

	const displayValue = selectOptions ? (selectOptions.find((o) => o.value === value)?.label ?? value) : value

	const handleSave = () => {
		onSave?.(inputVal)
		setEditing(false)
	}

	const handleCancel = () => {
		setInputVal(value)
		setEditing(false)
	}

	return (
		<Box>
			<Box
				sx={{
					display: 'flex',
					alignItems: editing ? 'flex-start' : 'center',
					justifyContent: 'space-between',
					py: 1.6,
					gap: 2,
					minHeight: 52,
				}}
			>
				{/* Left: label + value */}
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						variant="caption"
						sx={{ color: 'text.secondary', fontSize: '12px', display: 'block', mb: 0.3 }}
					>
						{label}
					</Typography>

					{editing ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 0.5 }}>
							{selectOptions ? (
								<AppSelect
									value={inputVal}
									onChange={(e) => setInputVal(e.target.value as string)}
									options={selectOptions}
									size="small"
									label=""
								/>
							) : (
								<AppInput
									value={inputVal}
									onChange={(e) => setInputVal(e.target.value)}
									type={type}
									size="small"
									autoFocus
									onKeyDown={(e) => {
										if (e.key === 'Enter') handleSave()
										if (e.key === 'Escape') handleCancel()
									}}
								/>
							)}
							<Box sx={{ display: 'flex', gap: 1 }}>
								<AppButton label="Save" size="small" onClick={handleSave} sx={{ minWidth: 64 }} />
								<AppButton
									label="Cancel"
									size="small"
									variant="outlined"
									onClick={handleCancel}
									sx={{ minWidth: 64 }}
								/>
							</Box>
						</Box>
					) : hasValue ? (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
							<Typography
								variant="body2"
								sx={{ color: 'text.primary', fontWeight: 500, fontSize: '14px' }}
							>
								{displayValue}
							</Typography>
							{verified && <CheckCircleIcon sx={{ fontSize: 17, color: 'success.main' }} />}
						</Box>
					) : null}
				</Box>

				{/* Right: + add or edit icon */}
				{!editing &&
					!readOnly &&
					(hasValue ? (
						<IconButton
							size="small"
							onClick={() => {
								setInputVal(value)
								setEditing(true)
							}}
							sx={{
								color: 'text.disabled',
								'&:hover': { color: 'primary.main' },
								'&:focus': { outline: 'none' },
								flexShrink: 0,
							}}
						>
							{/* pencil svg inline to avoid encoding issues */}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
								<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
							</svg>
						</IconButton>
					) : (
						<Typography
							onClick={() => {
								setInputVal('')
								setEditing(true)
							}}
							variant="caption"
							sx={{
								color: 'primary.main',
								fontWeight: 600,
								fontSize: '13px',
								cursor: 'pointer',
								flexShrink: 0,
								userSelect: 'none',
								'&:hover': { textDecoration: 'underline' },
							}}
						>
							+ add
						</Typography>
					))}
			</Box>

			{showDivider && <Divider sx={{ borderColor: 'rgba(0,0,0,0.07)' }} />}
		</Box>
	)
}
