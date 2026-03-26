// src/features/patient/components/ProfileField.tsx
import { useState } from 'react'
import { Box, Typography, IconButton, Divider } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppButton from '../../../components/common/Button/AppButton'

interface SelectOption {
	value: string
	label: string
}

interface ProfileFieldProps {
	label: string
	value?: string
	verified?: boolean
	readOnly?: boolean
	type?: string
	selectOptions?: SelectOption[]
	onSave?: (value: string) => void
	showDivider?: boolean
}

export default function ProfileField({
	label,
	value,
	verified = false,
	readOnly = false,
	type = 'text',
	selectOptions,
	onSave,
	showDivider = true,
}: ProfileFieldProps) {
	const [editing, setEditing] = useState(false)
	const [inputVal, setInputVal] = useState(value || '')

	const hasValue = Boolean(value && value.trim())

	// Get display label for select fields (show label not raw value)
	const displayValue = selectOptions ? (selectOptions.find((o) => o.value === value)?.label ?? value) : value

	const handleSave = () => {
		onSave?.(inputVal)
		setEditing(false)
	}

	const handleCancel = () => {
		setInputVal(value || '')
		setEditing(false)
	}

	return (
		<Box>
			<Box
				sx={{
					display: 'flex',
					alignItems: editing ? 'flex-start' : 'center',
					justifyContent: 'space-between',
					py: 1.8,
					gap: 2,
				}}
			>
				{/* Left: label + value */}
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						variant="caption"
						sx={{ color: 'text.secondary', fontSize: '12px', display: 'block', mb: 0.4 }}
					>
						{label}
					</Typography>

					{editing ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 0.5 }}>
							{/* AppSelect for dropdown fields, AppInput for text fields */}
							{selectOptions ? (
								<AppSelect
									value={inputVal}
									onChange={(e) => setInputVal(e.target.value as string)}
									options={selectOptions}
									size="small"
								/>
							) : (
								<AppInput
									value={inputVal}
									onChange={(e) => setInputVal(e.target.value)}
									type={type}
									size="small"
									autoFocus
								/>
							)}
							<Box sx={{ display: 'flex', gap: 1 }}>
								<AppButton label="Save" size="small" onClick={handleSave} sx={{ minWidth: 70 }} />
								<AppButton
									label="Cancel"
									size="small"
									variant="outlined"
									onClick={handleCancel}
									sx={{ minWidth: 70 }}
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
							{verified && <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />}
						</Box>
					) : null}
				</Box>

				{/* Right: + add or edit icon */}
				{!editing &&
					!readOnly &&
					(hasValue ? (
						<IconButton
							size="small"
							onClick={() => setEditing(true)}
							sx={{
								color: 'text.secondary',
								'&:hover': { color: 'primary.main' },
								'&:focus': { outline: 'none' },
								flexShrink: 0,
							}}
						>
							<EditOutlinedIcon sx={{ fontSize: 17 }} />
						</IconButton>
					) : (
						<Typography
							onClick={() => setEditing(true)}
							variant="caption"
							sx={{
								color: 'primary.main',
								fontWeight: 600,
								fontSize: '13px',
								cursor: 'pointer',
								flexShrink: 0,
								'&:hover': { textDecoration: 'underline' },
							}}
						>
							+ add
						</Typography>
					))}
			</Box>

			{showDivider && <Divider />}
		</Box>
	)
}
