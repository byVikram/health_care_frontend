import { useState } from 'react'
import { Box, Divider, Grid, Typography } from '@mui/material'
import AppInput from '../../../components/common/Input/AppInput'
import AppButton from '../../../components/common/Button/AppButton'
import { toast } from 'react-toastify'
import { createVital } from '../consultationService'

interface AddVitalsProps {
	patientPublicId: string
	onClose: () => void
	onSaved?: () => void
}

// Single consolidated form state — replaces 13 individual useState calls
interface VitalsForm {
	morningBp: string
	eveningBp: string
	fastingSugar: string
	randomSugar: string
	weight: string
	waist: string
	ldl: string
	hba1c: string
	hdl: string
	tgl: string
	pulseRate: string
	respRate: string
	spo2: string
	temperature: string
}

const EMPTY_FORM: VitalsForm = {
	morningBp: '',
	eveningBp: '',
	fastingSugar: '',
	randomSugar: '',
	weight: '',
	waist: '',
	ldl: '',
	hba1c: '',
	hdl: '',
	tgl: '',
	pulseRate: '',
	respRate: '',
	spo2: '',
	temperature: '',
}

export default function AddVitals({ patientPublicId, onClose, onSaved }: AddVitalsProps) {
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState<VitalsForm>(EMPTY_FORM)

	const setField =
		(field: keyof VitalsForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm((prev) => ({ ...prev, [field]: e.target.value }))

	const handleSave = async () => {
		// Timestamp used as recorded_at for all vitals in this submission
		const recorded_at = new Date().toISOString()
		const requests: Promise<unknown>[] = []

		// Blood Pressure
		if (form.morningBp.trim() || form.eveningBp.trim()) {
			const parts = form.morningBp.split('/')
			requests.push(
				createVital({
					patient_public_id: patientPublicId,
					vital_type: 'blood_pressure',
					recorded_at,
					value: {
						morning: form.morningBp.trim() || null,
						evening: form.eveningBp.trim() || null,
						systolic: parts[0]?.trim() ?? null,
						diastolic: parts[1]?.trim() ?? null,
					},
				})
			)
		}

		// Glucose level
		if (form.fastingSugar.trim() || form.randomSugar.trim()) {
			requests.push(
				createVital({
					patient_public_id: patientPublicId,
					vital_type: 'glucose_level',
					recorded_at,
					value: {
						fasting: form.fastingSugar.trim() || null,
						random: form.randomSugar.trim() || null,
					},
				})
			)
		}

		// Weight
		if (form.weight.trim()) {
			requests.push(
				createVital({
					patient_public_id: patientPublicId,
					vital_type: 'weight',
					recorded_at,
					value: { weight: Number(form.weight.trim()) },
				})
			)
		}

		// Temperature
		if (form.temperature.trim()) {
			requests.push(
				createVital({
					patient_public_id: patientPublicId,
					vital_type: 'temperature',
					recorded_at,
					value: { temperature: Number(form.temperature.trim()) },
				})
			)
		}

		// SpO2
		if (form.spo2.trim()) {
			requests.push(
				createVital({
					patient_public_id: patientPublicId,
					vital_type: 'spo2',
					recorded_at,
					value: { spo2: Number(form.spo2.trim()) },
				})
			)
		}

		// Others (waist, ldl, hba1c, hdl, tgl, pulse rate, resp rate)
		const othersValue: Record<string, unknown> = {}
		if (form.waist.trim()) othersValue.waist = Number(form.waist)
		if (form.ldl.trim()) othersValue.ldl = Number(form.ldl)
		if (form.hba1c.trim()) othersValue.hba1c = Number(form.hba1c)
		if (form.hdl.trim()) othersValue.hdl = Number(form.hdl)
		if (form.tgl.trim()) othersValue.tgl = Number(form.tgl)
		if (form.pulseRate.trim()) othersValue.pulse_rate = Number(form.pulseRate)
		if (form.respRate.trim()) othersValue.resp_rate = Number(form.respRate)

		if (Object.keys(othersValue).length > 0) {
			requests.push(
				createVital({
					patient_public_id: patientPublicId,
					vital_type: 'others',
					recorded_at,
					value: othersValue,
				})
			)
		}

		if (requests.length === 0) {
			toast.info('Please fill in at least one vital value.')
			return
		}

		setLoading(true)
		try {
			await Promise.all(requests)
			toast.success('Vitals saved successfully!')
			onSaved?.()
			onClose()
		} catch {
			// errors handled globally by apiService interceptor
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

			{/* Top Section */}
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>
							Blood Pressure (Morning)
						</Typography>
						<AppInput placeholder="mm/Hg" fullWidth size="small" value={form.morningBp} onChange={setField('morningBp')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>
							Blood Pressure (Evening)
						</Typography>
						<AppInput placeholder="mm/Hg" fullWidth size="small" value={form.eveningBp} onChange={setField('eveningBp')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>
							Fasting Sugar
						</Typography>
						<AppInput placeholder="mg/dL" fullWidth size="small" value={form.fastingSugar} onChange={setField('fastingSugar')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>
							Random Sugar
						</Typography>
						<AppInput placeholder="mg/dL" fullWidth size="small" value={form.randomSugar} onChange={setField('randomSugar')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>
							Weight
						</Typography>
						<AppInput placeholder="Kg" fullWidth size="small" value={form.weight} onChange={setField('weight')} />
					</Box>
				</Grid>
			</Grid>

			<Divider sx={{ my: 2.5 }} />

			{/* Other Vitals */}
			<Typography sx={{ color: 'primary.main', fontWeight: 500, fontSize: '15px', mb: 2 }}>
				Other Vitals
			</Typography>

			<Grid container spacing={2}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>Waist</Typography>
						<AppInput placeholder="cms" fullWidth size="small" value={form.waist} onChange={setField('waist')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>LDL</Typography>
						<AppInput placeholder="mg/dL" fullWidth size="small" value={form.ldl} onChange={setField('ldl')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>HbA1C</Typography>
						<AppInput placeholder="%" fullWidth size="small" value={form.hba1c} onChange={setField('hba1c')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>HDL</Typography>
						<AppInput placeholder="mg/dL" fullWidth size="small" value={form.hdl} onChange={setField('hdl')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>TGL</Typography>
						<AppInput placeholder="mg/dL" fullWidth size="small" value={form.tgl} onChange={setField('tgl')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>Pulse Rate</Typography>
						<AppInput placeholder="bpm" fullWidth size="small" value={form.pulseRate} onChange={setField('pulseRate')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>Respiration rate</Typography>
						<AppInput placeholder="bpm" fullWidth size="small" value={form.respRate} onChange={setField('respRate')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>SpO2</Typography>
						<AppInput placeholder="%" fullWidth size="small" value={form.spo2} onChange={setField('spo2')} />
					</Box>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Box>
						<Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.75 }}>Temperature</Typography>
						<AppInput placeholder="F" fullWidth size="small" value={form.temperature} onChange={setField('temperature')} />
					</Box>
				</Grid>
			</Grid>

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