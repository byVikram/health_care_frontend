// src/features/doctor/profile/components/DoctorAdditionalDetailTab.tsx
import { useState } from 'react'
import {
	Box,
	Typography,
	IconButton,
	Collapse,
	Chip,
	Card,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import AppInput from '../../../../components/common/Input/AppInput'
import { DoctorAdditionalDetail } from '../../../../types/doctor-profile'
import { customCardStyle } from '../../../../styles/commonStyles'
import AppButton from '../../../../components/common/Button/AppButton'

interface AdditionalDetailTabProps {
	data: DoctorAdditionalDetail
	onChange: (updated: Partial<DoctorAdditionalDetail>) => void
	handleSave: () => void | Promise<void>
}

type SectionKey = keyof DoctorAdditionalDetail

interface Section {
	key: SectionKey
	label: string
	dialogLabel: string
}

const SECTIONS: Section[] = [
	{ key: 'treatments', label: 'Treatments', dialogLabel: 'Treatment' },
	{ key: 'areas_of_expertise', label: 'Areas of Expertise', dialogLabel: 'Area of expertise' },
]

export default function AdditionalDetailTab({ data, onChange, handleSave }: AdditionalDetailTabProps) {
	const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
		treatments: true,
		areas_of_expertise: true,
	})
	const [isDirty, setIsDirty] = useState(false)
	const [saving, setSaving] = useState(false)

	// Inline adding state
	const [activeInputSection, setActiveInputSection] = useState<SectionKey | null>(null)
	const [inputValue, setInputValue] = useState('')

	const getItems = (key: SectionKey): string[] => {
		const val = data[key]
		return Array.isArray(val) ? val : []
	}

	const toggleExpand = (key: SectionKey) => {
		setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	const startAdding = (section: Section) => {
		setActiveInputSection(section.key)
		setInputValue('')
		// auto-expand if collapsed
		if (!expanded[section.key]) {
			setExpanded((prev) => ({ ...prev, [section.key]: true }))
		}
	}

	const cancelAdding = () => {
		setActiveInputSection(null)
		setInputValue('')
	}

	const handleInlineAdd = () => {
		if (!activeInputSection || !inputValue.trim()) return
		const current = getItems(activeInputSection)
		const patch: Partial<DoctorAdditionalDetail> = {}
		patch[activeInputSection] = [...current, inputValue.trim()]
		onChange(patch)
		setInputValue('')
		setActiveInputSection(null)
		setIsDirty(true)
	}

	const handleDelete = (key: SectionKey, index: number) => {
		const current = getItems(key)
		const patch: Partial<DoctorAdditionalDetail> = {}
		patch[key] = current.filter((_, i) => i !== index)
		onChange(patch)
		setIsDirty(true)
	}

	const onSave = async () => {
		setSaving(true)
		try {
			await handleSave()
			setIsDirty(false)
		} finally {
			setSaving(false)
		}
	}

	if (!data) return null
	return (
		<Box sx={{ ...customCardStyle, p: 2.5 }}>
			{/* Header */}
			<Typography variant="h6" fontWeight={600} sx={{ mb: 2.5, color: 'text.primary' }}>
				Additional Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				{SECTIONS.map((section) => {
					const items = getItems(section.key)
					const isExpanded = expanded[section.key]
					const isAdding = activeInputSection === section.key

					return (
						<Card
							key={section.key}
							sx={{
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: 1,
								overflow: 'hidden',
							}}
						>
							{/* Section header */}
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									px: 2,
									py: 1,
									cursor: 'pointer',
									'&:hover': { bgcolor: 'action.hover' },
								}}
								onClick={() => toggleExpand(section.key)}
							>
								<Typography
									variant="subtitle2"
									fontWeight={600}
									sx={{ flexGrow: 1, color: 'text.primary', fontSize: '0.9rem' }}
								>
									{section.label}
								</Typography>
								<Typography
									onClick={(e) => {
										e.stopPropagation() // don't toggle expand on "+ add"
										startAdding(section)
									}}
									sx={{
										fontSize: '0.75rem',
										fontWeight: 600,
										color: 'primary.main',
										cursor: 'pointer',
										mr: 1,
										'&:hover': { textDecoration: 'underline' },
										userSelect: 'none',
									}}
								>
									+ add
								</Typography>
								<IconButton size="small" sx={{ p: 0.3 }}>
									{isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
								</IconButton>
							</Box>

							<Collapse in={isExpanded}>
								{/* Inline add input */}
								{isAdding && (
									<Box sx={{ px: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
										<AppInput
											size="small"
											value={inputValue}
											onChange={(e) => setInputValue(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') handleInlineAdd()
												if (e.key === 'Escape') cancelAdding()
											}}
											placeholder={`Add ${section.dialogLabel}`}
											autoFocus
											fullWidth={false}
											sx={{ minWidth: 280 }}
											inputProps={{ style: { fontSize: '0.82rem' } }}
										/>
										<AppButton
											variant="contained"
											size="small"
											label="Add"
											onClick={handleInlineAdd}
											disabled={!inputValue.trim()}
											sx={{ whiteSpace: 'nowrap', px: 2 }}
										/>
									</Box>
								)}

								{/* Items as chips */}
								{items.length > 0 && (
									<Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
										{items.map((item, idx) => (
											<Chip
												key={idx}
												label={item}
												size="small"
												onDelete={() => handleDelete(section.key, idx)}
												sx={{
													fontSize: '0.78rem',
													height: 28,
													bgcolor: 'action.hover',
													'& .MuiChip-deleteIcon': {
														fontSize: '1rem',
														color: 'text.secondary',
													},
												}}
											/>
										))}
									</Box>
								)}

								{!isAdding && items.length === 0 && (
									<Box sx={{ px: 2, pb: 1.5 }}>
										<Typography variant="caption" sx={{ color: 'text.disabled' }}>
											No items added yet.
										</Typography>
									</Box>
								)}
							</Collapse>
						</Card>
					)
				})}
			</Box>

			{/* Save button */}
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>
				<AppButton
					variant="contained"
					label="Save Changes"
					disabled={!isDirty}
					loading={saving}
					onClick={onSave}
				/>
			</Box>
		</Box>
	)
}
