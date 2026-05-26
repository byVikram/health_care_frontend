// src/features/patient/components/MedicalTab.tsx
import { useState } from 'react'
import {
	Box,
	Typography,
	IconButton,
	Collapse,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Divider,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AppInput from '../../../components/common/Input/AppInput'
import { PatientMedical } from '../../../types/patient'
import { customCardStyle } from '../../../styles/commonStyles'
import AppButton from '../../../components/common/Button/AppButton'

interface MedicalTabProps {
	data: PatientMedical
	onChange: (updated: Partial<PatientMedical>) => void
	handleSave: () => void | Promise<void>
}

type SectionKey = keyof PatientMedical

interface Section {
	key: SectionKey
	label: string
	dialogLabel: string
}

const SECTIONS: Section[] = [
	{ key: 'allergies', label: 'Allergies', dialogLabel: 'Allergy' },
	{ key: 'chronic_conditions', label: 'Chronic diseases', dialogLabel: 'Chronic disease' },
	{ key: 'current_medications', label: 'Current medications', dialogLabel: 'Medication' },
	{ key: 'past_surgeries', label: 'Past surgeries', dialogLabel: 'Surgery' },
	{ key: 'family_history', label: 'Family medical history', dialogLabel: 'Family history entry' },
]

export default function MedicalTab({ data, onChange, handleSave }: MedicalTabProps) {
	const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
		allergies: true,
		chronic_conditions: true,
		current_medications: true,
		past_surgeries: false,
		family_history: false,
	})
	const [dialogOpen, setDialogOpen] = useState(false)
	const [activeSection, setActiveSection] = useState<Section | null>(null)
	const [inputValue, setInputValue] = useState('')
	const [isDirty, setIsDirty] = useState(false)
	const [saving, setSaving] = useState(false)

	const getItems = (key: SectionKey): string[] => {
		const val = data[key]
		return Array.isArray(val) ? val : []
	}

	const toggleExpand = (key: SectionKey) => {
		setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	const openAddDialog = (section: Section) => {
		setActiveSection(section)
		setInputValue('')
		setDialogOpen(true)
	}

	const handleDialogAdd = () => {
		if (!activeSection || !inputValue.trim()) return
		const current = getItems(activeSection.key)
		const patch: Partial<PatientMedical> = {}
		patch[activeSection.key] = [...current, inputValue.trim()]
		onChange(patch)
		setDialogOpen(false)
		setInputValue('')
		setExpanded((prev) => ({ ...prev, [activeSection!.key]: true }))
		setIsDirty(true)
	}

	const handleDelete = (key: SectionKey, index: number) => {
		const current = getItems(key)
		const patch: Partial<PatientMedical> = {}
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

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Medical Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				{SECTIONS.map((section) => {
					const items = getItems(section.key)
					const isExpanded = expanded[section.key]
					return (
						<Box
							key={section.key}
							sx={{
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: '10px',
								overflow: 'hidden',
								bgcolor: 'background.paper',
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.5 }}>
								<Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'text.primary', flexGrow: 1 }}>
									{section.label}
								</Typography>
								<Typography
									onClick={() => openAddDialog(section)}
									sx={{
										fontSize: '0.82rem',
										fontWeight: 600,
										color: 'primary.main',
										cursor: 'pointer',
										mr: 1,
										'&:hover': { textDecoration: 'underline' },
									}}
								>
									+ add
								</Typography>
								<IconButton size="small" onClick={() => toggleExpand(section.key)}>
									{isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
								</IconButton>
							</Box>
							<Collapse in={isExpanded}>
								{items.length > 0 && (
									<Box>
										{items.map((item, idx) => (
											<Box key={idx}>
												<Divider />
												<Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.2 }}>
													<Typography sx={{ flexGrow: 1, fontSize: '0.88rem', color: 'text.secondary' }}>
														{item}
													</Typography>
													<IconButton size="small" onClick={() => handleDelete(section.key, idx)} sx={{ color: 'error.main', p: 0.5 }}>
														<DeleteOutlineIcon fontSize="small" />
													</IconButton>
												</Box>
											</Box>
										))}
									</Box>
								)}
							</Collapse>
						</Box>
					)
				})}
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
				<AppButton variant="contained" label="Save" disabled={!isDirty} loading={saving} onClick={onSave} />
			</Box>

			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
				<DialogTitle sx={{ fontWeight: 600 }}>Add {activeSection?.dialogLabel}</DialogTitle>
				<DialogContent>
					<Box sx={{ pt: 1 }}>
						<AppInput
							label={activeSection?.dialogLabel}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleDialogAdd() }}
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
					<AppButton variant="outlined" label="Cancel" onClick={() => setDialogOpen(false)} />
					<AppButton variant="contained" label="Add" disabled={!inputValue.trim()} onClick={handleDialogAdd} />
				</DialogActions>
			</Dialog>
		</Box>
	)
}
