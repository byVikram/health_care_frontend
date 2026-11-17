// src/components/common/Calendar/MonthCalendar.tsx
//
// The month card of the Schedule page: title with previous / next arrows, a weekday header, the days (today ringed, the chosen day
// filled, a dot under a day that has appointments) and a "Jump to today" button. Dates are YYYY-MM-DD strings; the page owns which
// month is shown and which day is chosen.
import { Box } from '@mui/material'
import DeskIcon from '../Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export type DayMark = 'none' | 'past' | 'upcoming'

interface MonthCalendarProps {
	/** The month shown: year and 0-based month. */
	year: number
	month: number
	/** The chosen day and today, YYYY-MM-DD. */
	selectedIso: string
	todayIso: string
	/** The dot under a day: none, a grey one for a past day, a teal one from today on. */
	markOf: (iso: string) => DayMark
	onSelect: (iso: string) => void
	onPrevMonth: () => void
	onNextMonth: () => void
	onJumpToToday: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`

const arrowSx = {
	width: 30,
	height: 30,
	borderRadius: '9px',
	border: `1px solid ${DESK.lineStrong}`,
	bgcolor: DESK.raised,
	color: DESK.ink,
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
} as const

export default function MonthCalendar({
	year,
	month,
	selectedIso,
	todayIso,
	markOf,
	onSelect,
	onPrevMonth,
	onNextMonth,
	onJumpToToday,
}: MonthCalendarProps) {
	const leading = new Date(year, month, 1).getDay()
	const days = new Date(year, month + 1, 0).getDate()

	return (
		<Box
			component="section"
			sx={{
				bgcolor: DESK.raised,
				border: `1px solid ${DESK.line}`,
				borderRadius: '16px',
				p: '14px',
				display: 'flex',
				flexDirection: 'column',
				gap: '10px',
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
				<Box component="b" sx={{ flexGrow: 1, fontSize: 15 }}>
					{MONTHS[month]} {year}
				</Box>
				<Box component="button" type="button" onClick={onPrevMonth} aria-label="Previous month" sx={arrowSx}>
					<DeskIcon d={DESK_ICONS.chevronLeft} size={15} strokeWidth={2.4} />
				</Box>
				<Box component="button" type="button" onClick={onNextMonth} aria-label="Next month" sx={arrowSx}>
					<DeskIcon d={DESK_ICONS.chevronRight} size={15} strokeWidth={2.4} />
				</Box>
			</Box>
			<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
				{WEEKDAYS.map((weekday, index) => (
					<Box key={index} component="span" sx={{ fontSize: 11, fontWeight: 700, color: DESK.faint, py: '4px' }}>
						{weekday}
					</Box>
				))}
				{Array.from({ length: leading }, (_, index) => (
					<Box key={`blank-${index}`} />
				))}
				{Array.from({ length: days }, (_, index) => {
					const day = index + 1
					const iso = isoOf(year, month, day)
					const chosen = iso === selectedIso
					const isToday = iso === todayIso
					const mark = markOf(iso)
					return (
						<Box
							key={iso}
							component="button"
							type="button"
							onClick={() => onSelect(iso)}
							aria-label={`${MONTHS[month]} ${day}`}
							aria-pressed={chosen}
							sx={{
								position: 'relative',
								height: 34,
								border: `1.5px solid ${isToday && !chosen ? DESK.primary : 'transparent'}`,
								borderRadius: '9px',
								bgcolor: chosen ? DESK.primary : DESK.raised,
								color: chosen ? '#FFFFFF' : DESK.ink,
								fontFamily: 'inherit',
								fontSize: 13,
								fontWeight: isToday || chosen ? 800 : 600,
								cursor: 'pointer',
							}}
						>
							{day}
							<Box
								component="span"
								sx={{
									position: 'absolute',
									left: '50%',
									bottom: '3px',
									width: 4,
									height: 4,
									ml: '-2px',
									borderRadius: '9999px',
									bgcolor:
										mark === 'none' ? 'transparent' : chosen ? '#FFFFFF' : mark === 'past' ? DESK.fainter : DESK.primary,
								}}
							/>
						</Box>
					)
				})}
			</Box>
			<Box
				component="button"
				type="button"
				onClick={onJumpToToday}
				sx={{
					height: 34,
					px: '14px',
					borderRadius: '10px',
					border: `1px solid ${DESK.lineStrong}`,
					bgcolor: DESK.raised,
					color: DESK.ink,
					fontFamily: 'inherit',
					fontSize: 14,
					fontWeight: 700,
					cursor: 'pointer',
				}}
			>
				Jump to today
			</Box>
		</Box>
	)
}
