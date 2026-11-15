// One dialog for adding a family member (the + in the profile menu) and for viewing / editing one (their avatar there):
// the same sections, fields and grid in both modes, like the mobile app's family-member page. Add starts empty; Edit loads
// the member and fills the form in. The signed-in account never changes, and every request goes through the existing
// family-member endpoints, which check the caller is the member's guardian. Mount it only while it is open, with
// `key={memberId ?? 'new'}`, so each opening starts from a clean form.
import { useEffect, useRef, useState } from 'react'
import {
	Avatar,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	Typography,
} from '@mui/material'
import {
	CameraAltOutlined as CameraIcon,
	Close as CloseIcon,
	DeleteOutline as DeleteIcon,
	EditOutlined as EditIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import AppMultiSelect from '../../../components/common/Select/AppMultiSelect'
import AppDatePicker from '../../../components/common/DatePicker/AppDatePicker'
import AppButton from '../../../components/common/Button/AppButton'
import AppSkeleton from '../../../components/common/Skeleton/AppSkeleton'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import { customScrollbar } from '../../../styles/commonStyles'
import { buildS3Url } from '../../../utils/s3'
import { useAvatarChange } from '../../../hooks/useAvatarChange'
import { announceFamilyMembersChanged } from '../../../hooks/useFamilyMembers'
import { uploadAvatar, validateAvatarFile } from '../../../services/avatarService'
import {
	createFamilyMember,
	getFamilyMember,
	getIdentityDocument,
	getMemberHealthDetails,
	removeFamilyMember,
	updateFamilyMember,
	uploadIdentityDocument,
	validateIdentityDocument,
	type FamilyMemberUpdate,
	type IdentityDocument,
	type MedicationItem,
} from '../patientService'
import {
	ALLERGY_OPTIONS,
	BLOOD_GROUP_OPTIONS,
	CONDITION_OPTIONS,
	FAMILY_RELATION_OPTIONS,
	GENDER_OPTIONS,
	fromApiDate,
	messageOf,
	numberOrUndefined,
	relationLabel,
	toApiDate,
	validateBasics,
	withCurrent,
	type BasicErrors,
} from '../familyMemberForm'

interface FormValues {
	name: string
	relation: string
	gender: string
	dob: string // DD/MM/YYYY
	mobile: string
	bloodGroup: string
	height: string
	weight: string
	allergies: string[]
	conditions: string[]
	medications: MedicationItem[]
}

const EMPTY: FormValues = {
	name: '',
	relation: '',
	gender: '',
	dob: '',
	mobile: '',
	bloodGroup: '',
	height: '',
	weight: '',
	allergies: [],
	conditions: [],
	medications: [],
}

const EMPTY_MEDICINE: MedicationItem = { name: '', dose: '', frequency: '' }

const sectionTitleSx = { fontWeight: 700, fontSize: '14px', color: 'text.primary' } as const
// the caption AppInput / AppSelect draw above their box: the date field is drawn the same way so the labels line up
const fieldLabelSx = { display: 'block', fontWeight: 400, fontSize: '0.8rem', color: '#0f172a', mb: 0.75, letterSpacing: '0.01em' } as const
// a multi-select with chips is as tall as a plain select (36px), so a row of mixed fields stays level
// (not `.MuiOutlinedInput-root`: AppMultiSelect sets its own styles under that key and a repeat would replace them)
const multiSelectSx = { '& .MuiInputBase-root': { minHeight: 36 }, '& .MuiSelect-select': { py: '7px' } } as const
const withOptions = (base: { value: string; label: string }[], chosen: string[]) => [
	...base,
	...chosen.filter((c) => !base.some((o) => o.value === c)).map((c) => ({ value: c, label: c })),
]

const DOCUMENT_STATUS_LABEL: Record<string, string> = {
	pending: 'Pending review',
	approved: 'Approved',
	rejected: 'Rejected',
	reupload: 'Please upload again',
}

interface Props {
	open: boolean
	/** The member to view / edit; leave out to add a new one */
	memberId?: string
	onClose: () => void
}

export default function FamilyMemberModal({ open, memberId, onClose }: Props) {
	const isEdit = !!memberId

	const [values, setValues] = useState<FormValues>(EMPTY)
	const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(EMPTY))
	const [errors, setErrors] = useState<BasicErrors>({})
	const [meta, setMeta] = useState({ code: '', complete: true })
	const [loading, setLoading] = useState(isEdit)
	const [loadError, setLoadError] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)

	// the photo: a saved member's goes straight to them; a member being added keeps the picked file until they are saved
	const [avatar, setAvatar] = useState('')
	const [pendingPhoto, setPendingPhoto] = useState<File | null>(null)
	const fileInput = useRef<HTMLInputElement>(null)
	const photo = useAvatarChange({
		current: avatar,
		patientId: memberId,
		onChanged: setAvatar,
		onSaved: () => announceFamilyMembersChanged(), // the header's Family row shows the new photo too
	})

	// the ID document: a saved member's is uploaded as soon as it is picked; a member being added keeps the picked file
	// until they are saved
	const [idDocument, setIdDocument] = useState<IdentityDocument | null>(null)
	const [pendingDocument, setPendingDocument] = useState<File | null>(null)
	const [documentBusy, setDocumentBusy] = useState(false)
	const documentInput = useRef<HTMLInputElement>(null)

	const [medicine, setMedicine] = useState<{ index: number | null; draft: MedicationItem } | null>(null)
	const [medicineError, setMedicineError] = useState('')
	const [confirmRemove, setConfirmRemove] = useState(false)
	const [removing, setRemoving] = useState(false)
	const [confirmDeletePhoto, setConfirmDeletePhoto] = useState(false)

	useEffect(() => {
		if (!memberId) return
		let active = true
		const loadMember = async () => {
			try {
				const [member, details, document] = await Promise.all([
					getFamilyMember(memberId),
					getMemberHealthDetails(memberId),
					getIdentityDocument(memberId),
				])
				if (!active) return
				setIdDocument(document)
				const loaded: FormValues = {
					name: member.name,
					relation: (member.relation || '').toUpperCase(),
					gender: member.gender || '',
					dob: fromApiDate(member.date_of_birth),
					mobile: member.contact_number || '',
					bloodGroup: details.personal.blood_group || '',
					height: details.personal.height ? String(details.personal.height) : '',
					weight: details.personal.weight ? String(details.personal.weight) : '',
					allergies: details.medical.allergies || [],
					conditions: details.medical.chronic_conditions || [],
					medications:
						details.medical.medications ??
						(details.medical.current_medications || []).map((name) => ({ name, dose: '', frequency: '' })),
				}
				setValues(loaded)
				setSavedSnapshot(JSON.stringify(loaded))
				setMeta({ code: member.patient_code || '', complete: !!member.is_complete })
				setAvatar(buildS3Url(member.avatar_s3_key) || '')
			} catch (error) {
				if (active) setLoadError(messageOf(error, 'We could not load this family member.'))
			} finally {
				if (active) setLoading(false)
			}
		}
		void loadMember()
		return () => {
			active = false
		}
	}, [memberId])

	// release the preview of a photo picked while adding
	useEffect(
		() => () => {
			if (!memberId && avatar.startsWith('blob:')) URL.revokeObjectURL(avatar)
		},
		[avatar, memberId]
	)

	const dirty = JSON.stringify(values) !== savedSnapshot

	const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
		setValues((prev) => ({ ...prev, [key]: value }))
		if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }))
	}

	const handleClose = () => {
		if (saving || removing) return
		onClose()
	}

	const pickPhoto = (file: File) => {
		if (isEdit) {
			void photo.change(file)
			return
		}
		const problem = validateAvatarFile(file)
		if (problem) {
			toast.error(problem)
			return
		}
		setPendingPhoto(file)
		setAvatar(URL.createObjectURL(file))
	}

	const pickDocument = async (file: File) => {
		if (documentBusy) return // one upload at a time: no duplicate submissions
		const problem = validateIdentityDocument(file)
		if (problem) {
			toast.error(problem)
			return
		}
		if (!memberId) {
			setPendingDocument(file)
			return
		}
		setDocumentBusy(true)
		try {
			setIdDocument(await uploadIdentityDocument(memberId, file))
			toast.success('ID document uploaded')
		} catch (error) {
			toast.error(`Document not uploaded. ${messageOf(error, 'Please try again.')}`)
		} finally {
			setDocumentBusy(false)
		}
	}

	const removePhoto = () => {
		if (isEdit) {
			void photo.remove()
			return
		}
		setPendingPhoto(null)
		setAvatar('')
	}

	const buildHealth = (): FamilyMemberUpdate => ({
		...(values.bloodGroup ? { blood_group: values.bloodGroup } : {}),
		...(numberOrUndefined(values.height) ? { height: numberOrUndefined(values.height) } : {}),
		...(numberOrUndefined(values.weight) ? { weight: numberOrUndefined(values.weight) } : {}),
		...(values.allergies.length ? { allergies: values.allergies } : {}),
		...(values.conditions.length ? { chronic_conditions: values.conditions } : {}),
		...(values.medications.length ? { medications: values.medications } : {}),
	})

	const handleSave = async () => {
		if (medicine) {
			// a medicine still being typed is not part of the form yet: ask for a decision instead of dropping it
			toast.info('Add or cancel the medicine you are entering first')
			return
		}
		const found = validateBasics(values)
		setErrors(found)
		if (Object.keys(found).length) return
		setSaving(true)
		const name = values.name.trim()

		if (isEdit && memberId) {
			try {
				await updateFamilyMember(memberId, {
					name,
					relation: values.relation,
					gender: values.gender,
					date_of_birth: toApiDate(values.dob),
					contact_number: values.mobile.trim() || null,
					blood_group: values.bloodGroup,
					...(numberOrUndefined(values.height) ? { height: numberOrUndefined(values.height) } : {}),
					...(numberOrUndefined(values.weight) ? { weight: numberOrUndefined(values.weight) } : {}),
					allergies: values.allergies,
					chronic_conditions: values.conditions,
					medications: values.medications,
				})
				setSavedSnapshot(JSON.stringify(values))
				setMeta((prev) => ({ ...prev, complete: true }))
				announceFamilyMembersChanged() // the name or relation may have changed in the lists
				toast.success('Saved')
			} catch (error) {
				toast.error(messageOf(error, "Couldn't save the changes. Please try again."))
			} finally {
				setSaving(false)
			}
			return
		}

		// Add: create the member, then the photo and the health details they now belong to
		let newId: string
		try {
			const created = await createFamilyMember({
				name,
				relation: values.relation,
				gender: values.gender,
				date_of_birth: toApiDate(values.dob),
				contact_number: values.mobile.trim() || null,
			})
			newId = created.id
		} catch (error) {
			toast.error(messageOf(error, "Couldn't add the family member. Please try again."))
			setSaving(false)
			return
		}
		announceFamilyMembersChanged() // the member exists now: show them everywhere before the rest is saved

		const problems: string[] = []
		if (pendingPhoto) {
			try {
				await uploadAvatar(pendingPhoto, newId)
			} catch (error) {
				problems.push(`photo (${messageOf(error, 'please try again')})`)
			}
		}
		if (pendingDocument) {
			try {
				await uploadIdentityDocument(newId, pendingDocument)
			} catch (error) {
				problems.push(`ID document (${messageOf(error, 'please try again')})`)
			}
		}
		const health = buildHealth()
		if (Object.keys(health).length) {
			try {
				await updateFamilyMember(newId, health)
			} catch (error) {
				problems.push(`health details (${messageOf(error, 'please try again')})`)
			}
		}
		announceFamilyMembersChanged()
		if (problems.length) toast.warning(`${name} was added, but the ${problems.join(' and ')} were not saved. You can add them from their profile.`)
		else toast.success(`${name} added to your family`)
		setSaving(false)
		onClose()
	}

	const handleRemove = async () => {
		if (!memberId) return
		setRemoving(true)
		try {
			await removeFamilyMember(memberId)
			announceFamilyMembersChanged()
			toast.success(`${values.name.split(' ')[0] || 'They'} removed from your family`)
			onClose()
		} catch (error) {
			toast.error(messageOf(error, "Couldn't remove this family member. Please try again."))
			setRemoving(false)
			setConfirmRemove(false)
		}
	}

	const saveMedicine = () => {
		if (!medicine) return
		if (!medicine.draft.name.trim()) {
			setMedicineError('Enter the medicine name')
			return
		}
		const item = {
			name: medicine.draft.name.trim(),
			dose: medicine.draft.dose.trim(),
			frequency: medicine.draft.frequency.trim(),
		}
		const next = [...values.medications]
		if (medicine.index === null) next.push(item)
		else next[medicine.index] = item
		set('medications', next)
		setMedicine(null)
		setMedicineError('')
	}

	const cancelMedicine = () => {
		setMedicine(null)
		setMedicineError('')
	}

	const changeDraft = (patch: Partial<MedicationItem>) =>
		setMedicine((prev) => (prev ? { ...prev, draft: { ...prev.draft, ...patch } } : prev))

	// Add / edit one medicine, inline. Enter adds it; Escape cancels just this form (it must not reach the dialog, or the
	// whole family-member form would close and lose what was typed).
	const medicineForm = medicine && (
		<Box
			onKeyDown={(e) => {
				if (e.key === 'Escape') {
					e.stopPropagation()
					cancelMedicine()
				} else if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
					e.preventDefault()
					saveMedicine()
				}
			}}
			sx={{ p: 1.5, border: '1px solid', borderColor: 'primary.main', borderRadius: '8px' }}
		>
			<Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>{medicine.index === null ? 'Add medicine' : 'Edit medicine'}</Typography>
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6 }}>
					<AppInput
						label="Medicine name"
						placeholder="e.g. Metformin 500 mg"
						value={medicine.draft.name}
						onChange={(e) => {
							setMedicineError('')
							changeDraft({ name: e.target.value })
						}}
						error={!!medicineError}
						helperText={medicineError}
						inputProps={{ maxLength: 200 }}
						autoFocus
						fullWidth
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 3 }}>
					<AppInput
						label="Dosage"
						placeholder="e.g. 1 tablet"
						value={medicine.draft.dose}
						onChange={(e) => changeDraft({ dose: e.target.value })}
						inputProps={{ maxLength: 100 }}
						fullWidth
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 3 }}>
					<AppInput
						label="When"
						placeholder="e.g. Morning"
						value={medicine.draft.frequency}
						onChange={(e) => changeDraft({ frequency: e.target.value })}
						inputProps={{ maxLength: 100 }}
						fullWidth
					/>
				</Grid>
			</Grid>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
				<AppButton label="Cancel" variant="outlined" onClick={cancelMedicine} />
				<AppButton label={medicine.index === null ? 'Add medicine' : 'Save medicine'} onClick={saveMedicine} />
			</Box>
		</Box>
	)

	const firstName = values.name.trim().split(' ')[0] || 'them'
	const busy = saving || removing || documentBusy

	return (
		<>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				fullWidth
				scroll="paper"
				PaperProps={{
					sx: {
						borderRadius: '12px',
						m: { xs: 1, sm: 4 },
						width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
						maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
					},
				}}
			>
				<DialogTitle
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						py: 1.25,
						px: 2,
						borderBottom: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Typography
						component="span"
						variant="subtitle1"
						noWrap
						sx={{ fontWeight: 600, fontSize: '15px', display: 'block', minWidth: 0 }}
					>
						{isEdit ? values.name || 'Family member' : 'Add Family Member'}
					</Typography>
					<IconButton
						onClick={handleClose}
						size="small"
						disabled={busy}
						aria-label="Close"
						sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' }, '&:focus': { outline: 'none' } }}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				</DialogTitle>

				<DialogContent sx={{ pt: '16px !important', px: 2, pb: 2, ...customScrollbar }}>
					{loading ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<AppSkeleton height={72} />
							<AppSkeleton height={220} />
							<AppSkeleton height={160} />
						</Box>
					) : loadError ? (
						<Typography sx={{ py: 3, textAlign: 'center' }}>{loadError}</Typography>
					) : (
						<>
							{/* Photo, name and Karola ID */}
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
								<Box sx={{ position: 'relative', flexShrink: 0 }}>
									<Avatar src={avatar || undefined} alt={values.name} sx={{ width: 72, height: 72, fontSize: 26 }}>
										{values.name.trim().charAt(0).toUpperCase()}
									</Avatar>
									<IconButton
										size="small"
										aria-label="Change photo"
										disabled={photo.busy || saving}
										onClick={() => fileInput.current?.click()}
										sx={{
											position: 'absolute',
											right: -6,
											bottom: -6,
											width: 30,
											height: 30,
											bgcolor: 'primary.main',
											color: '#fff',
											border: '2px solid #fff',
											'&:hover': { bgcolor: 'primary.dark' },
											'&:focus': { outline: 'none' },
										}}
									>
										{photo.busy ? <CircularProgress size={14} color="inherit" /> : <CameraIcon sx={{ fontSize: 16 }} />}
									</IconButton>
									<input
										ref={fileInput}
										type="file"
										accept="image/jpeg,image/png,image/webp"
										hidden
										onChange={(e) => {
											const file = e.target.files?.[0]
											if (file) pickPhoto(file)
											e.target.value = ''
										}}
									/>
								</Box>
								<Box sx={{ minWidth: 0, flex: 1 }}>
									<Typography variant="h6" noWrap sx={{ fontWeight: 800, fontSize: '18px' }}>
										{values.name || 'Their name'}
									</Typography>
									<Typography variant="body2" color="text.secondary" noWrap>
										{isEdit
											? `${relationLabel(values.relation)}${meta.code ? ` · Karola ID ${meta.code}` : ''}${meta.complete ? '' : ' · details incomplete'}`
											: 'Profile photo (optional)'}
									</Typography>
									<Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
										<Typography
											component="button"
											type="button"
											variant="caption"
											onClick={() => fileInput.current?.click()}
											disabled={photo.busy || saving}
											sx={{ all: 'unset', cursor: 'pointer', fontWeight: 700, color: 'primary.main', fontSize: '13px' }}
										>
											{avatar ? 'Change photo' : 'Add photo'}
										</Typography>
										{avatar && (
											<Typography
												component="button"
												type="button"
												variant="caption"
												onClick={() => (isEdit ? setConfirmDeletePhoto(true) : removePhoto())}
												disabled={photo.busy || saving}
												sx={{ all: 'unset', cursor: 'pointer', fontWeight: 700, color: 'error.main', fontSize: '13px' }}
											>
												Delete photo
											</Typography>
										)}
									</Box>
								</Box>
							</Box>

							{/* Basic details */}
							<Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>Basic details</Typography>
							<Grid container spacing={2} sx={{ mb: 3 }}>
								<Grid size={{ xs: 12 }}>
									<AppInput
										label="Full name"
										placeholder="As on their ID"
										value={values.name}
										onChange={(e) => set('name', e.target.value)}
										error={!!errors.name}
										helperText={errors.name}
										inputProps={{ maxLength: 100 }}
										fullWidth
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<AppSelect
										label="Relationship to you"
										placeholder="Select relationship"
										value={values.relation}
										options={withCurrent(FAMILY_RELATION_OPTIONS, values.relation)}
										onChange={(e) => set('relation', e.target.value as string)}
										error={!!errors.relation}
										helperText={errors.relation}
										fullWidth
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<AppSelect
										label="Gender"
										placeholder="Select gender"
										value={values.gender}
										options={withCurrent(GENDER_OPTIONS, values.gender)}
										onChange={(e) => set('gender', e.target.value as string)}
										error={!!errors.gender}
										helperText={errors.gender}
										fullWidth
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Typography variant="caption" sx={{ ...fieldLabelSx, ...(errors.dob && { color: 'error.main' }) }}>
										Date of birth
									</Typography>
									<AppDatePicker
										value={values.dob}
										onChange={(val) => set('dob', val ?? '')}
										disableFuture
										fullWidth
										sx={
											errors.dob
												? { '& .MuiPickersOutlinedInput-notchedOutline, & .MuiOutlinedInput-notchedOutline': { borderColor: 'error.main' } }
												: undefined
										}
									/>
									{errors.dob && (
										<Typography variant="caption" color="error" sx={{ display: 'block', mt: '3px', mx: '14px' }}>
											{errors.dob}
										</Typography>
									)}
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<AppInput
										label="Their mobile number (optional)"
										placeholder="For visit reminders to them"
										value={values.mobile}
										onChange={(e) => set('mobile', e.target.value)}
										error={!!errors.mobile}
										helperText={errors.mobile}
										inputProps={{ maxLength: 15, inputMode: 'tel' }}
										fullWidth
									/>
								</Grid>
							</Grid>

							{/* Health */}
							<Typography sx={{ ...sectionTitleSx, mb: 0.5 }}>Health</Typography>
							<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
								Shown to doctors and nurses only for this person's bookings.
							</Typography>
							<Grid container spacing={2} sx={{ mb: 3 }}>
								<Grid size={{ xs: 12, sm: 4 }}>
									<AppSelect
										label="Blood group"
										placeholder="Select"
										value={values.bloodGroup}
										options={withCurrent(BLOOD_GROUP_OPTIONS, values.bloodGroup)}
										onChange={(e) => set('bloodGroup', e.target.value as string)}
										fullWidth
									/>
								</Grid>
								<Grid size={{ xs: 6, sm: 4 }}>
									<AppInput
										label="Height (cm)"
										value={values.height}
										onChange={(e) => set('height', e.target.value.replace(/[^\d.]/g, ''))}
										inputProps={{ inputMode: 'decimal', maxLength: 6 }}
										fullWidth
									/>
								</Grid>
								<Grid size={{ xs: 6, sm: 4 }}>
									<AppInput
										label="Weight (kg)"
										value={values.weight}
										onChange={(e) => set('weight', e.target.value.replace(/[^\d.]/g, ''))}
										inputProps={{ inputMode: 'decimal', maxLength: 6 }}
										fullWidth
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<AppMultiSelect
										label="Allergies"
										placeholder="Select allergies"
										value={values.allergies}
										options={withOptions(ALLERGY_OPTIONS, values.allergies)}
										onChange={(selected) => set('allergies', selected as string[])}
										sx={multiSelectSx}
										fullWidth
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<AppMultiSelect
										label="Long-term conditions"
										placeholder="Select conditions"
										value={values.conditions}
										options={withOptions(CONDITION_OPTIONS, values.conditions)}
										onChange={(selected) => set('conditions', selected as string[])}
										sx={multiSelectSx}
										fullWidth
									/>
								</Grid>
							</Grid>

							{/* Current medicines */}
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
								<Typography sx={sectionTitleSx}>Current medicines</Typography>
								<AppButton
									label="Add medicine"
									variant="outlined"
									disabled={!!medicine}
									onClick={() => {
										setMedicineError('')
										setMedicine({ index: null, draft: { ...EMPTY_MEDICINE } })
									}}
								/>
							</Box>
							{/* the medicine form opens inline, inside this dialog: no second dialog is stacked on top of it */}
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
								{medicine?.index === null && medicineForm}
								{values.medications.length === 0 && !medicine && (
									<Typography variant="body2" color="text.secondary">
										No medicines added
									</Typography>
								)}
								{values.medications.map((m, index) =>
									medicine?.index === index ? (
										<Box key={`${m.name}-${index}`}>{medicineForm}</Box>
									) : (
										<Box
											key={`${m.name}-${index}`}
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												gap: 1,
												p: 1.5,
												border: '1px solid',
												borderColor: 'divider',
												borderRadius: '8px',
											}}
										>
											<Box sx={{ minWidth: 0 }}>
												<Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
													{m.name}
												</Typography>
												<Typography variant="caption" color="text.secondary" noWrap>
													{[m.dose, m.frequency].filter(Boolean).join(' · ') || 'No dose or timing'}
												</Typography>
											</Box>
											<Box sx={{ flexShrink: 0 }}>
												<IconButton
													size="small"
													aria-label={`Edit ${m.name}`}
													disabled={!!medicine}
													onClick={() => {
														setMedicineError('')
														setMedicine({ index, draft: { ...m } })
													}}
												>
													<EditIcon fontSize="small" />
												</IconButton>
												<IconButton
													size="small"
													aria-label={`Remove ${m.name}`}
													disabled={!!medicine}
													onClick={() => set('medications', values.medications.filter((_, i) => i !== index))}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Box>
										</Box>
									)
								)}
							</Box>

							{/* ID document: stored privately against this member; shown back by name and review status */}
							<Typography sx={{ ...sectionTitleSx, mb: 0.5 }}>ID document</Typography>
							<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
								Some labs and hospitals ask for ID. Our team checks each upload.
							</Typography>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 1,
									p: 1.5,
									border: '1px solid',
									borderColor: 'divider',
									borderRadius: '8px',
									mb: isEdit ? 3 : 0,
								}}
							>
								<Box>
									<Typography variant="body2" sx={{ fontWeight: 600 }}>
										Government photo ID (optional)
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Aadhaar, passport or birth certificate for children
									</Typography>
									{idDocument && (
										<Typography variant="caption" sx={{ display: 'block', mt: 0.5, wordBreak: 'break-word' }}>
											{idDocument.url ? (
												<a href={idDocument.url} target="_blank" rel="noreferrer">
													{idDocument.file_name || idDocument.type_label}
												</a>
											) : (
												idDocument.file_name || idDocument.type_label
											)}
											{' · '}
											<Box component="span" sx={{ fontWeight: 600 }}>
												{DOCUMENT_STATUS_LABEL[idDocument.status] ?? idDocument.status}
											</Box>
										</Typography>
									)}
									{!idDocument && pendingDocument && (
										<Typography variant="caption" sx={{ display: 'block', mt: 0.5, wordBreak: 'break-word' }}>
											{pendingDocument.name} · Will be uploaded when you add {firstName}
										</Typography>
									)}
								</Box>
								<input
									ref={documentInput}
									type="file"
									hidden
									accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
									onChange={(event) => {
										const file = event.target.files?.[0]
										event.target.value = '' // the same file can be picked again after a failure
										if (file) void pickDocument(file)
									}}
								/>
								<AppButton
									label={idDocument || pendingDocument ? 'Replace' : 'Upload'}
									variant="outlined"
									loading={documentBusy}
									disabled={busy || loading}
									onClick={() => documentInput.current?.click()}
								/>
							</Box>

							{/* Access: only for a member that already exists */}
							{isEdit && (
								<>
									<Typography sx={{ ...sectionTitleSx, mb: 0.5 }}>Access</Typography>
									<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
										You manage this profile. Bookings, reports and prescriptions for {firstName} appear under your account.
									</Typography>
									<AppButton
										label={`Remove ${firstName} from family`}
										variant="outlined"
										color="error"
										onClick={() => setConfirmRemove(true)}
									/>
								</>
							)}
						</>
					)}
				</DialogContent>

				<DialogActions
					sx={{
						px: 2,
						pb: 2,
						pt: 1,
						borderTop: '1px solid',
						borderColor: 'divider',
						gap: 1,
						justifyContent: 'flex-end',
					}}
				>
					<Button
						onClick={handleClose}
						disabled={busy}
						variant="outlined"
						size="medium"
						sx={{
							minWidth: 100,
							fontSize: 14,
							fontWeight: 400,
							borderRadius: '8px',
							boxShadow: 'none',
							border: '2px solid',
							textTransform: 'none',
							'&:focus': { outline: 'none' },
						}}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={busy || loading || !!loadError || (isEdit && !dirty)}
						variant="contained"
						size="medium"
						startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
						sx={{
							minWidth: 100,
							fontSize: 14,
							fontWeight: 400,
							borderRadius: '8px',
							boxShadow: 'none',
							textTransform: 'none',
							'&:focus': { outline: 'none' },
						}}
					>
						{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>

			<ConfirmModal
				open={confirmRemove}
				onClose={() => !removing && setConfirmRemove(false)}
				onConfirm={handleRemove}
				variant="delete"
				title={`Remove ${firstName} from family?`}
				description="They won't appear in booking lists any more. Their past bookings, reports and prescriptions are kept."
				confirmLabel="Remove"
				loading={removing}
			/>

			<ConfirmModal
				open={confirmDeletePhoto}
				onClose={() => setConfirmDeletePhoto(false)}
				onConfirm={() => {
					setConfirmDeletePhoto(false)
					removePhoto()
				}}
				variant="delete"
				title="Delete profile photo?"
				description={`${firstName}'s photo will be removed. You can add another one any time.`}
				confirmLabel="Delete"
			/>

		</>
	)
}
