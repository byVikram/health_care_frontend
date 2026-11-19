// src/features/lab/components/LabWhenSection.tsx
//
// Step 3 of the cart page: the next 14 days as a strip, a fasting hint when the cart has a fasting test, and the chosen lab's free times of
// the day grouped Morning / Afternoon / Evening (from GET /api/laboratory/slots). Picking a time is what completes the booking's lab + slot.
import { Box, CircularProgress } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import DeskButton from '../../../components/common/Button/DeskButton'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import { dayNum, dowShort, monShort, timeLabel } from '../labFormat'
import LabCartSection from './LabCartSection'

const PARTS = [
	{ label: 'Morning', from: 0, to: 12 },
	{ label: 'Afternoon', from: 12, to: 17 },
	{ label: 'Evening', from: 17, to: 24 },
]

const hourOf = (hhmm: string) => Number(hhmm.split(':')[0])

interface LabWhenSectionProps {
	sub: string
	/** 'YYYY-MM-DD' for each day offered; the first is today. */
	days: string[]
	dayIdx: number
	onDay: (index: number) => void
	/** The cart has a test that needs fasting. */
	fasting: boolean
	/** A lab is chosen (there is nothing to list before that). */
	hasLab: boolean
	times: string[]
	loading: boolean
	error: string | null
	onRetry: () => void
	/** 'HH:MM' of the picked time when it is the chosen lab on the chosen day. */
	selectedTime: string | null
	onPick: (time: string) => void
}

export default function LabWhenSection({
	sub,
	days,
	dayIdx,
	onDay,
	fasting,
	hasLab,
	times,
	loading,
	error,
	onRetry,
	selectedTime,
	onPick,
}: LabWhenSectionProps) {
	const late = fasting && !!selectedTime && hourOf(selectedTime) >= 11
	return (
		<LabCartSection step={3} title="When?" sub={sub}>
			<Box role="radiogroup" aria-label="Date" sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}>
				{days.map((iso, i) => {
					const on = i === dayIdx
					return (
						<Box
							key={iso}
							component="button"
							type="button"
							role="radio"
							aria-checked={on}
							aria-label={`${dowShort(iso)} ${dayNum(iso)} ${monShort(iso)}`}
							onClick={() => onDay(i)}
							sx={{
								height: 72,
								borderRadius: '12px',
								border: `1.5px solid ${on ? DESK.primary : '#C9D6D7'}`,
								bgcolor: on ? DESK.primary : DESK.raised,
								color: on ? '#FFFFFF' : DESK.ink,
								fontFamily: 'inherit',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '2px',
								cursor: 'pointer',
							}}
						>
							<Box component="span" sx={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>
								{i === 0 ? 'Today' : dowShort(iso)}
							</Box>
							<Box component="b" sx={{ fontSize: 20, lineHeight: '24px' }}>
								{dayNum(iso)}
							</Box>
							<Box component="span" sx={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>
								{monShort(iso)}
							</Box>
						</Box>
					)
				})}
			</Box>

			{fasting ? (
				<Box
					component="span"
					sx={{
						p: '10px 12px',
						borderRadius: '10px',
						bgcolor: late ? DESK.dangerSoft : DESK.warningSoft,
						color: late ? DESK.danger : DESK.warning,
						fontSize: 13,
						lineHeight: '18px',
						display: 'flex',
						gap: '8px',
					}}
				>
					<Box component="span" sx={{ display: 'flex', flexShrink: 0 }}>
						<DeskIcon d={DESK_ICONS.clock} size={16} />
					</Box>
					{late
						? 'Your cart has a fasting test. This time means a long fast. A slot before 11 AM is better.'
						: 'Your cart has a fasting test. A morning slot is best.'}
				</Box>
			) : null}

			{!hasLab ? (
				<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
					Choose a lab above to see its times.
				</Box>
			) : null}

			{hasLab && loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: '8px' }}>
					<CircularProgress size={22} thickness={5} />
				</Box>
			) : null}

			{hasLab && error ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
					<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
						{error}
					</Box>
					<Box sx={{ width: 140 }}>
						<DeskButton label="Try again" kind="secondary" size="md" onClick={onRetry} />
					</Box>
				</Box>
			) : null}

			{hasLab && !loading && !error && times.length === 0 ? (
				<Box component="span" sx={{ py: '8px', textAlign: 'center', fontSize: 14, color: DESK.muted }}>
					No times left on this day for this lab. Try another date.
				</Box>
			) : null}

			{hasLab && !loading && !error
				? PARTS.map((part) => {
						const inPart = times.filter((t) => hourOf(t) >= part.from && hourOf(t) < part.to)
						if (inPart.length === 0) return null
						return (
							<Box key={part.label} sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
								<Box component="span" sx={{ fontSize: 13, fontWeight: 800, color: DESK.inkSoft }}>
									{part.label}
								</Box>
								<Box
									role="radiogroup"
									aria-label={part.label}
									sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '8px' }}
								>
									{inPart.map((t) => {
										const on = t === selectedTime
										return (
											<Box
												key={t}
												component="button"
												type="button"
												role="radio"
												aria-checked={on}
												onClick={() => onPick(t)}
												sx={{
													height: 46,
													borderRadius: '10px',
													border: `1.5px solid ${on ? DESK.primary : '#C9D6D7'}`,
													bgcolor: on ? DESK.primary : DESK.raised,
													color: on ? '#FFFFFF' : DESK.ink,
													fontFamily: 'inherit',
													fontSize: 14,
													fontWeight: 700,
													cursor: 'pointer',
													'&:hover': { borderColor: DESK.primary },
												}}
											>
												{timeLabel(t)}
											</Box>
										)
									})}
								</Box>
							</Box>
						)
					})
				: null}
		</LabCartSection>
	)
}
