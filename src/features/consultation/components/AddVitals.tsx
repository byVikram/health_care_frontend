import { useEffect, useRef, useState } from 'react'
import { Box, Grid, Typography } from '@mui/material'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'
import { toast } from 'react-toastify'
import { createVital, getVitalRanges, type VitalRanges } from '../consultationService'
import { RATING_LABELS, RATING_TONES, rateTyped, type RatedVital } from '../vitalRating'

// The readings of a consultation, in the contract the backend keeps (docs/patient-vitals.md in the backend, the same the mobile app
// sends): one record per vital type, every number a number, one unit each. Blood pressure is ONE reading (systolic + diastolic), sugar
// is random blood sugar (RBS) only, temperature is in °F, and weight and height are taken at every visit.

interface AddVitalsProps {
	patientPublicId: string
	onClose: () => void
	onSaved?: () => void
}

type FieldId = 'systolic' | 'diastolic' | 'pulse' | 'spo2' | 'temperature' | 'sugar' | 'weight' | 'height'

type VitalsForm = Record<FieldId, string>

const EMPTY_FORM: VitalsForm = {
	systolic: '',
	diastolic: '',
	pulse: '',
	spo2: '',
	temperature: '',
	sugar: '',
	weight: '',
	height: '',
}

// The same ranges as the backend (patients/vitals.py), which refuses a value outside them too: checking here says it before saving.
const FIELDS: Record<FieldId, { label: string; unit: string; min: number; max: number }> = {
	systolic: { label: 'Blood Pressure (Systolic)', unit: 'mmHg', min: 50, max: 260 },
	diastolic: { label: 'Blood Pressure (Diastolic)', unit: 'mmHg', min: 30, max: 160 },
	pulse: { label: 'Pulse Rate', unit: 'bpm', min: 20, max: 250 },
	spo2: { label: 'SpO2', unit: '%', min: 50, max: 100 },
	temperature: { label: 'Temperature', unit: '°F', min: 90, max: 110 },
	sugar: { label: 'Random Blood Sugar (RBS)', unit: 'mg/dL', min: 20, max: 800 },
	weight: { label: 'Weight', unit: 'kg', min: 2, max: 400 },
	height: { label: 'Height', unit: 'cm', min: 30, max: 260 },
}

const VITAL_FIELDS: FieldId[] = ['systolic', 'diastolic', 'pulse', 'spo2', 'temperature', 'sugar', 'weight', 'height']

const isFilled = (text: string) => text.trim() !== ''

// The fields coloured by the backend's bands while typing (key in GET /api/patients/vitals/ranges; see ../vitalRating.ts); weight,
// height and the "other" measurements are not rated.
const RATED: Partial<Record<FieldId, RatedVital>> = {
	systolic: 'systolic',
	diastolic: 'diastolic',
	pulse: 'pulse_rate',
	spo2: 'spo2',
	temperature: 'temperature',
	sugar: 'random',
}

/** A message to show when what was typed cannot be saved, or null when it can. */
function validate(form: VitalsForm): string | null {
	for (const id of Object.keys(FIELDS) as FieldId[]) {
		if (!isFilled(form[id])) continue
		const { label, unit, min, max } = FIELDS[id]
		const n = Number(form[id].trim())
		if (!Number.isFinite(n) || n <= 0) return `Enter a valid number for ${label}`
		if (n < min || n > max) {
			// A temperature typed in °C is the likeliest slip: say so, with what it comes to in °F.
			if (id === 'temperature' && n >= 30 && n <= 45)
				return `Temperature is in °F: ${n} °C is ${Math.round((n * 9) / 5 + 32)} °F`
			return `${label} should be between ${min} and ${max} ${unit}`
		}
	}
	if (isFilled(form.systolic) !== isFilled(form.diastolic)) return 'Enter both blood pressure values, or neither'
	if (isFilled(form.systolic) && Number(form.systolic) <= Number(form.diastolic))
		return 'Systolic must be higher than diastolic'
	return null
}

interface Entry {
	/** Which reading this is, so one that is already saved is not sent again when Save is pressed a second time. */
	key: string
	vital_type: string
	value: Record<string, number>
}

/** One record per vital type, in the backend's stored shape. */
function buildEntries(form: VitalsForm): Entry[] {
	const n = (id: FieldId) => Number(form[id].trim())
	const entries: Entry[] = []
	if (isFilled(form.systolic) && isFilled(form.diastolic))
		entries.push({
			key: 'bp',
			vital_type: 'blood_pressure',
			value: { systolic: n('systolic'), diastolic: n('diastolic') },
		})
	if (isFilled(form.pulse)) entries.push({ key: 'pulse', vital_type: 'pulse', value: { pulse_rate: n('pulse') } })
	if (isFilled(form.spo2)) entries.push({ key: 'spo2', vital_type: 'spo2', value: { spo2: n('spo2') } })
	if (isFilled(form.temperature))
		entries.push({ key: 'temperature', vital_type: 'temperature', value: { temperature: n('temperature') } })
	if (isFilled(form.sugar)) entries.push({ key: 'sugar', vital_type: 'glucose_level', value: { random: n('sugar') } })
	if (isFilled(form.weight)) entries.push({ key: 'weight', vital_type: 'weight', value: { weight: n('weight') } })
	if (isFilled(form.height)) entries.push({ key: 'height', vital_type: 'height', value: { height: n('height') } })
	return entries
}

interface FieldInputProps {
	id: FieldId
	form: VitalsForm
	/** The backend's bands, to colour a field as it is typed; null while unknown (the fields are then not coloured). */
	ranges: VitalRanges | null
	onChange: (id: FieldId) => (e: React.ChangeEvent<HTMLInputElement>) => void
}

function FieldInput({ id, form, ranges, onChange }: FieldInputProps) {
	const { label, unit } = FIELDS[id]
	const rated = RATED[id]
	const rating = rated ? rateTyped(ranges, rated, form[id]) : 'unset'
	const flagged = rating === 'medium' || rating === 'high'
	const tone = RATING_TONES[rating]
	return (
		<Grid size={{ xs: 12, sm: 6, md: 3 }}>
			<Box>
				<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>
					{label}
				</Typography>
				<AppInput
					placeholder={unit}
					fullWidth
					size="small"
					value={form[id]}
					onChange={onChange(id)}
					endIcon={
						rating !== 'unset' ? (
							<Box
								role="img"
								aria-label={RATING_LABELS[rating]}
								sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tone.dot }}
							/>
						) : undefined
					}
					sx={flagged ? { '& .MuiOutlinedInput-notchedOutline': { borderColor: tone.border } } : undefined}
				/>
			</Box>
		</Grid>
	)
}

export default function AddVitals({ patientPublicId, onClose, onSaved }: AddVitalsProps) {
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState<VitalsForm>(EMPTY_FORM)
	// One time for every reading of this form (a retry keeps it), so the readings of a consultation share a row in the history.
	const recordedAt = useRef(new Date().toISOString())
	// The readings already saved, with the value that was saved: after a partial failure Save sends only what is new or was changed
	// since, so a reading the doctor edits after it was saved is saved again (never silently left at its old value).
	const saved = useRef<Map<string, string>>(new Map())
	// The backend's bands, fetched when the form opens. A failure leaves them null: the fields are simply not coloured (the saved
	// readings are rated by the backend anyway).
	const [ranges, setRanges] = useState<VitalRanges | null>(null)

	useEffect(() => {
		let active = true
		const load = async () => {
			try {
				const loaded = await getVitalRanges()
				if (active && Object.keys(loaded).length) setRanges(loaded)
			} catch {
				// no colour while typing
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [])

	const setField = (field: FieldId) => (e: React.ChangeEvent<HTMLInputElement>) =>
		setForm((prev) => ({ ...prev, [field]: e.target.value }))

	const handleSave = async () => {
		const invalid = validate(form)
		if (invalid) {
			toast.error(invalid)
			return
		}

		const entries = buildEntries(form).filter(
			(entry) => saved.current.get(entry.key) !== JSON.stringify(entry.value)
		)
		if (entries.length === 0) {
			if (saved.current.size === 0) {
				toast.info('Please fill in at least one vital value.')
			} else {
				toast.info('No changes to save.') // everything typed is already saved
				onClose()
			}
			return
		}

		setLoading(true)
		try {
			const results = await Promise.allSettled(
				entries.map((entry) =>
					createVital({
						patient_public_id: patientPublicId,
						vital_type: entry.vital_type,
						recorded_at: recordedAt.current,
						value: entry.value,
					})
				)
			)
			results.forEach((result, i) => {
				if (result.status === 'fulfilled') saved.current.set(entries[i].key, JSON.stringify(entries[i].value))
			})
			const failed = results.filter((result) => result.status === 'rejected').length
			if (failed === 0) {
				toast.success('Vitals saved successfully!')
				onSaved?.()
				onClose()
			} else {
				// The server's reason for each is shown by the global error handler; the ones that went through stay saved.
				if (failed < entries.length) onSaved?.()
				toast.error(
					`${failed} of ${entries.length} readings could not be saved. Fix them and press Save to try again.`
				)
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<Box sx={{ p: '20px 24px 24px' }}>
			{/* Header */}
			<Typography variant="h5" sx={{ fontWeight: 600, fontSize: '18px', mb: 0.5 }}>
				Add Vitals
			</Typography>
			<Typography sx={{ fontSize: '14px', color: 'text.secondary', mb: 3 }}>
				Enter Patient Vitals Value
			</Typography>

			{/* The consultation's vitals */}
			<Grid container spacing={2}>
				{VITAL_FIELDS.map((id) => (
					<FieldInput key={id} id={id} form={form} ranges={ranges} onChange={setField} />
				))}
			</Grid>

			{/* What the colours mean (the dot and border of a field as it is typed) */}
			<Box
				sx={{
					mt: 2,
					px: 1.5,
					py: 1,
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					gap: 2,
					borderRadius: '8px',
					bgcolor: 'action.hover',
				}}
			>
				{(['normal', 'medium', 'high'] as const).map((rating) => (
					<Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
						<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: RATING_TONES[rating].dot }} />
						<Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
							{RATING_LABELS[rating]}
						</Typography>
					</Box>
				))}
			</Box>

			{/* Buttons */}
			<Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
				<AppButton
					label="Cancel"
					variant="outlined"
					fullWidth
					onClick={onClose}
					sx={{
						height: '48px',
						borderRadius: '8px',
						bgcolor: '#EAF2F1',
						border: 'none',
						color: 'primary.main',
						fontWeight: 600,
						fontSize: '15px',
						'&:hover': { bgcolor: '#EAF2F1', border: 'none' },
					}}
				/>
				<AppButton
					label={loading ? 'Saving...' : 'Save'}
					fullWidth
					onClick={handleSave}
					disabled={loading}
					sx={{ height: '48px', borderRadius: '8px', fontWeight: 600, fontSize: '15px' }}
				/>
			</Box>
		</Box>
	)
}
