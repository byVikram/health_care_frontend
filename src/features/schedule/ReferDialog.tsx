// src/features/schedule/ReferDialog.tsx
//
// "Refer to another doctor": the doctor picks a speciality, then the doctor the patient should see, adds a note, and the referral is
// created for the appointment (the patient is shown the other doctor's profile and can book). The call is `createReferral`.
import { Box, MenuItem, Select } from '@mui/material'
import { useEffect, useState, type ChangeEvent } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import DeskDialog from '../../components/common/Modal/DeskDialog'
import AvatarTile from '../../components/common/Avatar/AvatarTile'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import { createReferral } from '../../services/referralService'
import { getDoctors, getSpecialities } from '../doctor/doctorService'
import { buildS3Url } from '../../utils/s3'
import { DESK } from '../../styles/deskTokens'
import { initialsOf } from './scheduleUtils'
import type { Appointment } from '../../types/appointment'
import type { DoctorSearchItem } from '../../types/doctor-search'
import type { SpecialityItem } from '../../types/speciality'

interface ReferDialogProps {
	appointment: Appointment | null
	onClose: () => void
	/** The referral was created. */
	onReferred: (doctorName: string) => void
}

const labelSx = { fontSize: 13, fontWeight: 600, color: DESK.inkSoft }

export default function ReferDialog({ appointment, onClose, onReferred }: ReferDialogProps) {
	const open = !!appointment
	const [specialities, setSpecialities] = useState<SpecialityItem[]>([])
	const [specialityId, setSpecialityId] = useState('')
	const [doctors, setDoctors] = useState<DoctorSearchItem[]>([])
	const [loading, setLoading] = useState(false)
	const [doctorId, setDoctorId] = useState('')
	const [note, setNote] = useState('')
	const [busy, setBusy] = useState(false)

	// The specialities, read when the dialog first opens
	useEffect(() => {
		if (!open || specialities.length > 0) return
		let cancelled = false
		const run = async () => {
			try {
				const res = await getSpecialities()
				if (!cancelled) setSpecialities(res.data ?? [])
			} catch {
				// The list stays empty: the dialog then says so.
			}
		}
		void run()
		return () => {
			cancelled = true
		}
	}, [open, specialities.length])

	// The doctors of the chosen speciality
	useEffect(() => {
		if (!open || !specialityId) return
		let cancelled = false
		const run = async () => {
			setLoading(true)
			try {
				const res = await getDoctors({ speciality_id: specialityId, limit: 20 })
				if (!cancelled) setDoctors(res.data ?? [])
			} catch {
				if (!cancelled) setDoctors([])
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		void run()
		return () => {
			cancelled = true
		}
	}, [open, specialityId])

	const close = () => {
		if (busy) return
		setSpecialityId('')
		setDoctors([])
		setDoctorId('')
		setNote('')
		onClose()
	}

	const refer = async () => {
		const doctor = doctors.find((d) => d.id === doctorId)
		if (!appointment || !doctor) return
		setBusy(true)
		try {
			await createReferral({
				appointment_id: appointment.id,
				referred_doctor_id: doctor.id,
				...(note.trim() ? { notes: note.trim() } : {}),
			})
			toast.success(`${appointment.patient?.name ?? 'The patient'} referred to ${doctor.name}`)
			setSpecialityId('')
			setDoctors([])
			setDoctorId('')
			setNote('')
			onReferred(doctor.name)
		} catch (err) {
			// The shared API client already showed the server's reason.
			if (!axios.isAxiosError(err)) toast.error('Something went wrong. Please try again.')
		} finally {
			setBusy(false)
		}
	}

	const first = (appointment?.patient?.name ?? 'the patient').split(' ')[0]

	return (
		<DeskDialog
			open={open}
			title="Refer to another doctor"
			sub={`Choose who should see ${first}. They get the doctor's profile and can book directly.`}
			okLabel="Refer"
			busy={busy}
			okDisabled={!doctorId}
			width={560}
			onClose={close}
			onOk={() => void refer()}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
				<Box component="span" sx={labelSx}>
					Speciality
				</Box>
				<Select
					value={specialityId}
					onChange={(e) => {
						setSpecialityId(e.target.value)
						setDoctorId('')
					}}
					displayEmpty
					fullWidth
					disabled={busy}
					inputProps={{ 'aria-label': 'Speciality' }}
					sx={{
						height: 44,
						borderRadius: '10px',
						fontSize: 15,
						'& .MuiOutlinedInput-notchedOutline': { borderColor: DESK.line },
					}}
					renderValue={(value) =>
						value ? (
							(specialities.find((s) => s.id === value)?.label ?? '')
						) : (
							<Box component="span" sx={{ color: DESK.faint }}>
								Pick a speciality
							</Box>
						)
					}
				>
					{specialities.map((s) => (
						<MenuItem key={s.id} value={s.id} sx={{ fontSize: 14 }}>
							{s.label}
						</MenuItem>
					))}
				</Select>
			</Box>
			{specialityId ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
					<Box component="span" sx={labelSx}>
						Doctor
						<Box component="span" sx={{ color: DESK.danger }}>
							{' *'}
						</Box>
					</Box>
					<Box
						sx={{
							maxHeight: 230,
							overflowY: 'auto',
							display: 'flex',
							flexDirection: 'column',
							gap: '6px',
						}}
					>
						{loading ? (
							[1, 2, 3].map((i) => <AppSkeleton key={i} height={54} sx={{ borderRadius: '10px' }} />)
						) : doctors.length === 0 ? (
							<Box sx={{ fontSize: 13, color: DESK.muted, py: '8px' }}>
								No doctors found for this speciality.
							</Box>
						) : (
							doctors.map((d) => {
								const on = d.id === doctorId
								return (
									<Box
										key={d.id}
										component="button"
										type="button"
										onClick={() => setDoctorId(d.id)}
										aria-pressed={on}
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: '10px',
											p: '8px 10px',
											borderRadius: '10px',
											border: `1.5px solid ${on ? DESK.primary : DESK.line}`,
											bgcolor: on ? DESK.primaryTint : DESK.raised,
											textAlign: 'left',
											fontFamily: 'inherit',
											color: DESK.ink,
											cursor: 'pointer',
										}}
									>
										<AvatarTile
											src={d.avatar_s3_key ? buildS3Url(d.avatar_s3_key) : null}
											initials={initialsOf(d.name)}
											size={36}
											radius="round"
										/>
										<Box
											component="span"
											sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
										>
											<Box component="b" sx={{ fontSize: 14 }}>
												{d.name}
											</Box>
											<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
												{[d.specialities?.[0], d.location].filter(Boolean).join(' · ')}
											</Box>
										</Box>
									</Box>
								)
							})
						)}
					</Box>
				</Box>
			) : null}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
				<Box component="span" sx={labelSx}>
					Note for the doctor (optional)
				</Box>
				<Box
					component="textarea"
					rows={3}
					value={note}
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
					placeholder="e.g. Exertional chest tightness for 3 days, diabetic. Please see today."
					aria-label="Note for the doctor"
					disabled={busy}
					sx={{
						boxSizing: 'border-box',
						width: '100%',
						p: '10px 12px',
						borderRadius: '10px',
						border: `1px solid ${DESK.line}`,
						fontFamily: 'inherit',
						fontSize: 15,
						lineHeight: '22px',
						color: DESK.ink,
						resize: 'vertical',
					}}
				/>
			</Box>
		</DeskDialog>
	)
}
