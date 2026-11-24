// src/features/bookings/MyBookingsPage.tsx
//
// The patient's "My bookings" (route ROUTES.BOOKINGS): every booking in one place, from GET /api/patients/me/bookings (the app's
// Bookings tab list): doctor appointments, home care, lab tests and pharmacy orders, the patient's own and their family members'.
// Upcoming / Past tabs, a category rail, a search box, the list grouped by day (or month, for Past) and a sticky detail panel with the
// buttons that work on the web (see useBookingActions). A doctor who lands here is sent to the Schedule page.
import { Box } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import PersonFilter, { ALL_PEOPLE } from '../../components/common/PersonFilter/PersonFilter'
import RailItem from '../../components/common/Rail/RailItem'
import ReasonDialog from '../../components/common/Modal/ReasonDialog'
import SearchField from '../../components/common/SearchField/SearchField'
import SectionLabel from '../../components/common/SectionLabel/SectionLabel'
import UnderlineTabs from '../../components/common/Tabs/UnderlineTabs'
import RescheduleDrawer from '../doctor/search/components/RescheduleDrawer'
import { USER_ROLES } from '../../constants/constants'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import BookingDetailPanel from './BookingDetailPanel'
import BookingListItem from './BookingListItem'
import { CATEGORY_RAIL, bookingKey, groupBookings, whenLabel } from './bookingListUtils'
import { getMyBookings } from './bookingsService'
import type { BookingItem, BookingsCategoryFilter, BookingsPage, BookingsWhen } from './bookingsTypes'
import { CANCEL_REASONS, useBookingActions } from './useBookingActions'

const PAGE_SIZE = 20

const WHEN_TABS: { value: BookingsWhen; label: string }[] = [
	{ value: 'upcoming', label: 'Upcoming' },
	{ value: 'past', label: 'Past' },
]

const NEW_LINKS = [
	{ label: 'Find a doctor', to: ROUTES.DOCTORS.SEARCH },
	{ label: 'Book a scan', to: ROUTES.RADIOLOGY.SEARCH },
]

const matches = (item: BookingItem, query: string) =>
	[item.title, item.subtitle, item.ref, item.kind_label].some((text) => (text ?? '').toLowerCase().includes(query))

const CATEGORIES: BookingsCategoryFilter[] = ['all', 'doctor', 'ancillary', 'lab', 'pharmacy']
const categoryFromParam = (value: string | null): BookingsCategoryFilter | null =>
	CATEGORIES.find((entry) => entry === value) ?? null
const whenFromParam = (value: string | null): BookingsWhen | null =>
	value === 'upcoming' || value === 'past' ? value : null

function PatientBookings() {
	const [searchParams] = useSearchParams()
	const linkedId = searchParams.get('appointment_id') || searchParams.get('open_appointment_id')

	// A link can open the page on a tab and a category (?when=past&category=lab: the account menu's Lab Bookings row).
	const linkedWhen = whenFromParam(searchParams.get('when'))
	const linkedCategory = categoryFromParam(searchParams.get('category'))
	const [when, setWhen] = useState<BookingsWhen>(linkedWhen ?? 'upcoming')
	const [category, setCategory] = useState<BookingsCategoryFilter>(linkedCategory ?? 'all')
	const [query, setQuery] = useState('')
	const { members } = useFamilyMembers()
	const [personId, setPersonId] = useState(ALL_PEOPLE)
	// "For Everyone": one person of the account narrows the list on the server (a person who is no longer on the account means everyone).
	const person = members.find((member) => member.id === personId) ?? null
	const patientId = person?.id
	const [items, setItems] = useState<BookingItem[]>([])
	const [counts, setCounts] = useState<Partial<BookingsPage['counts']>>({})
	const [page, setPage] = useState(1)
	const [pages, setPages] = useState(1)
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState('')
	const [selectedKey, setSelectedKey] = useState<string | null>(null)
	const [reloadKey, setReloadKey] = useState(0)
	// Only the newest request may fill the page (a tab or category change while one is still on its way).
	const requestRef = useRef(0)
	const linkApplied = useRef<string | null>(null)

	// The page is already open and another link to it is followed (a different row of the account menu): take that tab / category.
	useEffect(() => {
		if (linkedWhen) setWhen(linkedWhen)
		if (linkedCategory) setCategory(linkedCategory)
	}, [linkedWhen, linkedCategory])

	const reload = useCallback(() => setReloadKey((n) => n + 1), [])
	const actions = useBookingActions(reload)

	const load = useCallback(
		async (pageNo: number) => {
			const request = ++requestRef.current
			if (pageNo === 1) {
				setLoading(true)
				setError('')
			} else {
				setLoadingMore(true)
			}
			try {
				const res = await getMyBookings({ when, category, page: pageNo, limit: PAGE_SIZE, patientId })
				if (request !== requestRef.current) return
				setItems((prev) => (pageNo === 1 ? res.items : [...prev, ...res.items]))
				setCounts(res.counts ?? {})
				setPage(res.page)
				setPages(res.pages)
			} catch {
				if (request !== requestRef.current) return
				if (pageNo === 1) setError('We could not load your bookings.')
				else toast.error('Could not load more bookings.')
			} finally {
				if (request === requestRef.current) {
					setLoading(false)
					setLoadingMore(false)
				}
			}
		},
		[when, category, patientId]
	)

	useEffect(() => {
		void load(1)
	}, [load, reloadKey])

	// A different account (or a family member's switch) was chosen: read the list again.
	useEffect(() => {
		window.addEventListener('auth-changed', reload)
		return () => window.removeEventListener('auth-changed', reload)
	}, [reload])

	const q = query.trim().toLowerCase()
	const visible = useMemo(() => (q ? items.filter((item) => matches(item, q)) : items), [items, q])
	const sections = useMemo(() => groupBookings(visible, when), [visible, when])

	// A link from a notification (?appointment_id=) picks that booking once it is on screen.
	useEffect(() => {
		if (!linkedId || linkApplied.current === linkedId) return
		const found = items.find((item) => item.target?.id === linkedId || item.id === linkedId)
		if (!found) return
		linkApplied.current = linkedId
		setSelectedKey(bookingKey(found))
	}, [items, linkedId])

	// The chosen booking, else the first one (a refresh keeps the choice while the booking is still in the list).
	const selected = visible.find((item) => bookingKey(item) === selectedKey) ?? visible[0] ?? null

	const emptyTitle = q
		? `No bookings match “${query.trim()}”`
		: person
			? `No ${when} bookings for ${person.name.split(' ')[0]}`
			: `No ${when} bookings here`
	const emptySub = q
		? 'Try a doctor’s name, test or booking ID.'
		: 'Book a doctor, lab test or home visit to see it here.'

	return (
		<Box sx={{ bgcolor: DESK.page, minHeight: 'calc(100vh - 64px)', color: DESK.ink }}>
			<Box
				sx={{
					maxWidth: 1200,
					mx: 'auto',
					px: { xs: '16px', md: '24px', xl: 0 },
					pt: '24px',
					pb: '40px',
					display: 'flex',
					flexDirection: 'column',
					gap: '18px',
				}}
			>
				<Box
					component="nav"
					aria-label="Breadcrumb"
					sx={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, color: DESK.muted }}
				>
					<Box component={Link} to={ROUTES.ROOT} sx={{ color: DESK.muted, textDecoration: 'none' }}>
						Home
					</Box>
					<DeskIcon d={DESK_ICONS.chevronRight} size={14} />
					<Box component="b" sx={{ color: DESK.ink }}>
						My bookings
					</Box>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
					<Box sx={{ flexGrow: 1 }}>
						<Box
							component="h1"
							sx={{ m: 0, fontSize: 26, lineHeight: '32px', fontWeight: 800, letterSpacing: '-0.01em' }}
						>
							My bookings
						</Box>
					</Box>
					<PersonFilter
						people={members}
						value={person ? person.id : ALL_PEOPLE}
						onChange={(next) => {
							setPersonId(next)
							setSelectedKey(null)
						}}
					/>
					<SearchField
						value={query}
						onChange={setQuery}
						placeholder="Search doctor, test, medicine or ID"
						ariaLabel="Search bookings"
						voice
					/>
				</Box>

				<UnderlineTabs
					value={when}
					options={WHEN_TABS}
					ariaLabel="Bookings"
					onChange={(next) => {
						setWhen(next)
						setSelectedKey(null)
					}}
				/>

				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', lg: 'row' },
						gap: '24px',
						alignItems: 'flex-start',
					}}
				>
					<Box
						component="aside"
						sx={{
							flexShrink: 0,
							width: { xs: '100%', lg: 220 },
							display: 'flex',
							flexDirection: 'column',
							gap: '4px',
						}}
					>
						<Box
							component="span"
							sx={{
								p: '4px 10px 6px',
								fontSize: 11,
								fontWeight: 800,
								letterSpacing: '0.06em',
								color: DESK.muted,
							}}
						>
							CATEGORY
						</Box>
						{CATEGORY_RAIL.map((entry) => (
							<RailItem
								key={entry.id}
								label={entry.label}
								icon={entry.icon}
								tileBg={entry.tile.bg}
								tileInk={entry.tile.ink}
								selected={category === entry.id}
								count={counts[entry.id] ?? 0}
								onClick={() => {
									setCategory(entry.id)
									setSelectedKey(null)
								}}
							/>
						))}
						<Box
							sx={{
								mt: '14px',
								p: '14px',
								borderRadius: '14px',
								bgcolor: DESK.raised,
								border: `1px solid ${DESK.line}`,
								display: 'flex',
								flexDirection: 'column',
								gap: '8px',
							}}
						>
							<Box component="b" sx={{ fontSize: 14 }}>
								Book something new
							</Box>
							{NEW_LINKS.map((link) => (
								<Box
									key={link.label}
									component={Link}
									to={link.to}
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										fontSize: 13,
										fontWeight: 700,
										color: DESK.primary,
										textDecoration: 'none',
									}}
								>
									{link.label}
									<DeskIcon d={DESK_ICONS.chevronRight} size={14} strokeWidth={2.4} />
								</Box>
							))}
						</Box>
					</Box>

					<Box
						sx={{
							flexGrow: 1,
							minWidth: 0,
							width: '100%',
							display: 'flex',
							flexDirection: 'column',
							gap: '10px',
						}}
					>
						{loading ? (
							[0, 1, 2, 3].map((n) => (
								<AppSkeleton key={n} variant="rounded" height={76} sx={{ borderRadius: '14px' }} />
							))
						) : error ? (
							<Box
								sx={{
									p: '40px 20px',
									borderRadius: '14px',
									border: `1.5px dashed ${DESK.lineStrong}`,
									bgcolor: DESK.raised,
									textAlign: 'center',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: '10px',
								}}
							>
								<Box component="b" sx={{ fontSize: 15 }}>
									{error}
								</Box>
								<Box sx={{ width: 140 }}>
									<DeskButton label="Retry" kind="primary" size="md" onClick={() => void load(1)} />
								</Box>
							</Box>
						) : visible.length === 0 ? (
							<Box
								sx={{
									p: '40px 20px',
									borderRadius: '14px',
									border: `1.5px dashed ${DESK.lineStrong}`,
									bgcolor: DESK.raised,
									textAlign: 'center',
									display: 'flex',
									flexDirection: 'column',
									gap: '6px',
								}}
							>
								<Box component="b" sx={{ fontSize: 15 }}>
									{emptyTitle}
								</Box>
								<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
									{emptySub}
								</Box>
							</Box>
						) : (
							<>
								{sections.map((section) => (
									<Box
										key={section.title}
										sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
									>
										<SectionLabel label={section.title} />
										{section.data.map((item) => (
											<BookingListItem
												key={bookingKey(item)}
												item={item}
												selected={selected ? bookingKey(selected) === bookingKey(item) : false}
												onSelect={() => setSelectedKey(bookingKey(item))}
											/>
										))}
									</Box>
								))}
								{page < pages && !q ? (
									<Box sx={{ alignSelf: 'center', width: 220, mt: '6px' }}>
										<DeskButton
											label="Show more bookings"
											kind="secondary"
											size="md"
											loading={loadingMore}
											onClick={() => void load(page + 1)}
										/>
									</Box>
								) : null}
							</>
						)}
					</Box>

					{!loading && !error && selected ? (
						<BookingDetailPanel
							item={selected}
							actions={actions.actionsFor(selected)}
							onViewDetails={actions.detailLinkFor(selected)}
						/>
					) : null}
				</Box>
			</Box>

			<RescheduleDrawer {...actions.drawerProps} />
			<ReasonDialog
				key={actions.cancel.item ? bookingKey(actions.cancel.item) : 'closed'}
				open={!!actions.cancel.item}
				title="Cancel this booking?"
				sub={
					actions.cancel.item
						? [actions.cancel.item.title, whenLabel(actions.cancel.item)].filter(Boolean).join(' · ')
						: undefined
				}
				body="The doctor is told and the slot is released."
				reasons={CANCEL_REASONS}
				noteLabel="Anything else you would like to add (optional)"
				okLabel="Cancel booking"
				cancelLabel="Keep booking"
				danger
				busy={actions.cancel.busy}
				onClose={actions.cancel.close}
				onConfirm={(reason, note) => void actions.cancel.confirm(reason, note)}
			/>
		</Box>
	)
}

export default function MyBookingsPage() {
	const { role } = useAuth()
	if (role === USER_ROLES.DOCTOR) return <Navigate to={ROUTES.SCHEDULE} replace />
	return <PatientBookings />
}
