// src/features/lab/components/LabRescheduleDialog.tsx
//
// "Reschedule pickup": a 7-day strip and that day's real free times at the order's own lab (GET .../orders/{id}/slots), then
// POST .../orders/{id}/reschedule. Mount it only while it is open, so each opening starts fresh on the current day.
import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import DeskDialog from '../../../components/common/Modal/DeskDialog'
import { DESK } from '../../../styles/deskTokens'
import { RESCHEDULE_DAY_COUNT } from '../labConstants'
import { addDays, commaDate, dayNum, dowShort, timeLabel, toIso } from '../labFormat'
import { fetchOrderSlots, labErrorMessage, rescheduleOrder, type ApiOrder } from '../labService'

interface LabRescheduleDialogProps {
	orderId: string
	/** The current slot; `time` is a display label ("9:00 AM"). */
	current: { date: string; time: string }
	/** "Home sample collection · 2 tests" */
	subtitle: string
	onClose: () => void
	/** The order as the server now has it. */
	onRescheduled: (order: ApiOrder) => void
}

export default function LabRescheduleDialog({ orderId, current, subtitle, onClose, onRescheduled }: LabRescheduleDialogProps) {
	const days = useMemo(() => Array.from({ length: RESCHEDULE_DAY_COUNT }, (_, i) => toIso(addDays(new Date(), i))), [])
	const [dayIndex, setDayIndex] = useState(() => Math.max(0, days.indexOf(current.date)))
	const [time, setTime] = useState<string | null>(null)
	const [times, setTimes] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [reload, setReload] = useState(0)
	const [busy, setBusy] = useState(false)
	const day = days[dayIndex]

	useEffect(() => {
		let active = true
		const load = async () => {
			setLoading(true)
			setError('')
			setTimes([])
			try {
				const free = await fetchOrderSlots(orderId, day)
				if (active) setTimes(free)
			} catch (err) {
				if (active) setError(labErrorMessage(err))
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [orderId, day, reload])

	const confirm = async () => {
		if (!time) return
		setBusy(true)
		try {
			onRescheduled(await rescheduleOrder(orderId, day, time))
		} catch (err) {
			toast.error(labErrorMessage(err))
			setTime(null)
			setReload((n) => n + 1) // the time may have just gone: read the free ones again
		} finally {
			setBusy(false)
		}
	}

	return (
		<DeskDialog
			open
			title="Reschedule pickup"
			sub={subtitle}
			okLabel={time ? `Confirm · ${commaDate(day)}, ${timeLabel(time)}` : 'Confirm new slot'}
			cancelLabel="Keep current slot"
			okDisabled={!time}
			busy={busy}
			width={600}
			onClose={onClose}
			onOk={() => void confirm()}
		>
			<Box component="p" sx={{ m: 0, fontSize: 14, color: DESK.muted }}>
				Now {commaDate(current.date)}, {current.time}. Pick a new day and time. Morning slots are best for fasting tests.
			</Box>
			<Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${RESCHEDULE_DAY_COUNT}, minmax(0, 1fr))`, gap: '6px' }}>
				{days.map((iso, index) => {
					const on = index === dayIndex
					return (
						<Box
							key={iso}
							component="button"
							type="button"
							aria-pressed={on}
							aria-label={commaDate(iso)}
							onClick={() => {
								setDayIndex(index)
								setTime(null)
							}}
							sx={{
								height: 64,
								borderRadius: '10px',
								border: `1.5px solid ${on ? DESK.primary : DESK.lineStrong}`,
								bgcolor: on ? DESK.primary : DESK.raised,
								color: on ? '#FFFFFF' : DESK.ink,
								fontFamily: 'inherit',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
							}}
						>
							<Box component="span" sx={{ fontSize: 11, fontWeight: 700 }}>
								{index === 0 ? 'Today' : dowShort(iso)}
							</Box>
							<Box component="b" sx={{ fontSize: 18 }}>
								{dayNum(iso)}
							</Box>
						</Box>
					)
				})}
			</Box>
			{loading ? (
				<Box sx={{ fontSize: 14, color: DESK.muted }}>Loading free times…</Box>
			) : error ? (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 14, color: DESK.danger }}>
					{error}
					<Box
						component="button"
						type="button"
						onClick={() => setReload((n) => n + 1)}
						sx={{ p: 0, border: 0, bgcolor: 'transparent', color: DESK.primary, fontWeight: 800, cursor: 'pointer' }}
					>
						Try again
					</Box>
				</Box>
			) : times.length === 0 ? (
				<Box sx={{ fontSize: 14, color: DESK.muted }}>No free times on this day.</Box>
			) : (
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
					{times.map((t) => {
						const isCurrent = day === current.date && timeLabel(t) === current.time
						const on = t === time
						return (
							<Box
								key={t}
								component="button"
								type="button"
								disabled={isCurrent}
								aria-pressed={on}
								onClick={() => setTime(t)}
								sx={{
									height: 42,
									borderRadius: '10px',
									border: `1.5px solid ${on ? DESK.primary : DESK.lineStrong}`,
									bgcolor: on ? DESK.primaryTint : DESK.raised,
									color: isCurrent ? DESK.fainter : on ? DESK.primary : DESK.ink,
									fontFamily: 'inherit',
									fontSize: 14,
									fontWeight: 700,
									textDecoration: isCurrent ? 'line-through' : 'none',
									cursor: isCurrent ? 'default' : 'pointer',
								}}
							>
								{timeLabel(t)}
							</Box>
						)
					})}
				</Box>
			)}
		</DeskDialog>
	)
}
