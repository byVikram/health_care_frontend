// src/styles/deskTokens.ts
//
// The colours, tones and icon paths of the desktop "My bookings" (patient) and "Schedule" (doctor) designs. The pages and the shared
// components they use (StatusPill, UnderlineTabs, SegmentTabs, RailItem, AvatarTile, FactList, SearchField, MonthCalendar, DeskButton,
// DeskDialog, ReasonDialog) read from here, so a colour is changed in one place.

export const DESK = {
	page: '#F5F8F8',
	raised: '#FFFFFF',
	/** Card and divider lines. */
	line: '#DCE5E6',
	lineSoft: '#EEF2F2',
	/** Buttons, inputs and the calendar. */
	lineStrong: '#D5E1E2',
	field: '#C9D5D6',
	ink: '#12373E',
	inkSoft: '#3D5054',
	muted: '#5B6B6E',
	faint: '#7A8B8E',
	fainter: '#9AA7A9',
	primary: '#2B6F71',
	primaryDark: '#276668',
	primarySoft: '#E3EFEF',
	primaryTint: '#F0F7F7',
	segmentTrack: '#E9EFEF',
	danger: '#B42318',
	dangerSoft: '#FDECEA',
	dangerLine: '#F3C5BF',
	success: '#1E7A4E',
	successSoft: '#E6F4EC',
	warning: '#8A5300',
	warningSoft: '#FDF1DC',
	info: '#2463A8',
	infoSoft: '#DDEBFA',
	lilac: '#6A4BB5',
	lilacSoft: '#ECE6FA',
	shadowMenu: '0 16px 40px #12373E33',
	shadowDialog: '0 24px 64px #12373E59',
	scrim: '#12373E66',
	/** The Lab tests pages: card border, the dark hero and its glow, the light teal on it, the discount badge, a disabled teal button. */
	cardLine: '#E3EAEB',
	hero: '#12373E',
	heroGlow: '#1F5E7A',
	mint: '#9FD3D1',
	mintText: '#CFE3E3',
	discountBadge: '#E4572E',
	primaryDisabled: '#9DB9BA',
	chip: '#F0F3F3',
	sand: '#B4532A',
} as const

/** Gradient panels behind a lab test / package icon on the browse cards: [light, deeper, icon ink]. */
export const DESK_MEDIA = {
	teal: ['#D8EEEE', '#9FD3D1', '#2B6F71'],
	lilac: ['#ECE6FA', '#C9B8F2', '#6A4BB5'],
	blue: ['#DDEBFA', '#A9C9EE', '#2463A8'],
	red: ['#FDECEA', '#F5B8B0', '#B42318'],
	peach: ['#FDE8DC', '#F3BE9F', '#B4532A'],
	sand: ['#FBEFD5', '#F0D28F', '#8A5300'],
	pink: ['#FCE7F3', '#F2B5D6', '#A0306B'],
} as const

/** The status chips: ok (green), wait (amber), move (blue), done (grey), bad (red), lilac (referred), quiet (not arrived yet). */
export type DeskTone = 'ok' | 'wait' | 'move' | 'done' | 'bad' | 'lilac' | 'quiet'

export const DESK_TONES: Record<DeskTone, { bg: string; fg: string }> = {
	ok: { bg: '#E6F4EC', fg: '#1E7A4E' },
	wait: { bg: '#FDF1DC', fg: '#8A5300' },
	move: { bg: '#DDEBFA', fg: '#2463A8' },
	done: { bg: '#F0F4F4', fg: '#5B6B6E' },
	bad: { bg: '#FDECEA', fg: '#B42318' },
	lilac: { bg: '#ECE6FA', fg: '#6A4BB5' },
	quiet: { bg: '#F0F3F3', fg: '#5B6B6E' },
}

/** The tinted tiles behind a category / clinic icon: background + icon colour. */
export const DESK_TILES = {
	all: { bg: '#E3EFEF', ink: '#2B6F71' },
	doctor: { bg: '#DDEBFA', ink: '#2463A8' },
	care: { bg: '#FDE8DC', ink: '#B4532A' },
	lab: { bg: '#ECE6FA', ink: '#6A4BB5' },
	pharmacy: { bg: '#FBEFD5', ink: '#8A5300' },
	clinic: { bg: '#ECE6FA', ink: '#6A4BB5' },
	clinicAlt: { bg: '#FBEFD5', ink: '#8A5300' },
	video: { bg: '#DDEBFA', ink: '#2463A8' },
} as const

/** Stroke icon paths (24x24 viewBox, drawn by DeskIcon): the ones the two designs use. */
export const DESK_ICONS = {
	chevronRight: 'M9 6l6 6-6 6',
	chevronLeft: 'M15 18l-6-6 6-6',
	chevronDown: 'M6 9l6 6 6-6',
	search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
	check: 'M5 12.5l4.5 4.5L19 7.5',
	tick: 'M5 12l5 5 9-10',
	close: 'M6 6l12 12M18 6L6 18',
	calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
	clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
	video: 'M15 10l5-3v10l-5-3zM3 7h12v10H3z',
	clinic: 'M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M2 21h20M12 7v6M9 10h6',
	user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0',
	users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20a7 7 0 0 1 14 0M16 4.2a3.5 3.5 0 0 1 0 6.6M18 14a7 7 0 0 1 4 6',
	phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
	file: 'M14 3v5h5M6 3h8l5 5v13H6zM9 13h6M9 17h6',
	send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
	refer: 'M5 12h14M13 6l6 6-6 6',
	grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
	stethoscope: 'M5 3v5a5 5 0 0 0 10 0V3M10 13v3a4 4 0 0 0 8 0v-3M18 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
	homeCare:
		'M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16M7 20l1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9M2 15l6 6M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12z',
	lab: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 15h9',
	pill: 'M10.5 20.5a4.95 4.95 0 0 1-7-7l6-6a4.95 4.95 0 0 1 7 7zM8.5 8.5l7 7',
	// Lab tests (the Lab Tests Ordering design)
	package:
		'M5 4h14v17H5zM9 4V3h6v1M12 17s-3.5-2-3.5-4.3A1.8 1.8 0 0 1 12 11.6a1.8 1.8 0 0 1 3.5 1.1C15.5 15 12 17 12 17z',
	home: 'M4 11l8-7 8 7M6 10v10h12V10',
	pin: 'M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
	gps: 'M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3',
	shield: 'M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-4.5',
	lock: 'M8 11V8a4 4 0 0 1 8 0v3M6 11h12v9H6z',
	cart: 'M3 4h2l2.4 11.2a1 1 0 0 0 .8.8h9.2a1 1 0 0 0 1-.8L20 8H6.2M9 20.5a.5.5 0 1 0 0 .01M18 20.5a.5.5 0 1 0 0 .01',
	info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5M12 16h.01',
	download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
	share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
	qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2',
	plus: 'M12 5v14M5 12h14',
} as const
