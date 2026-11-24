// src/features/lab/LabBrowsePage.tsx
//
// Lab tests, browse: hero with search, filters (Show, Health concern), promo cards, the packages and single tests, and the sticky cart
// (design: Desktop 1b, "with images"). The catalogue comes from the API for the pincode of the patient's address (only what the labs there
// offer is listed); search and the concerns are server searches, so what shows is not limited to the first page.
import { Box } from '@mui/material'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import LabBrowseCart from './components/LabBrowseCart'
import LabBrowseHero from './components/LabBrowseHero'
import LabDetailsDrawer from './components/LabDetailsDrawer'
import LabFilters from './components/LabFilters'
import { LabPackageCard, LabTestCard } from './components/LabItemCards'
import LabPromoCards from './components/LabPromoCards'
import { concernCounts as countConcerns, matchesConcerns, useLabCatalogue } from './labCatalogue'
import { MAX_LAB_ITEMS, labBooking, useLabBooking } from './labBookingStore'
import { LAB_CONCERNS, type LabItem, type LabTypeId } from './labConstants'
import { plural } from './labFormat'
import { LAB_CARD, LAB_H2 } from './labStyles'
import LabPageShell from './LabPageShell'
import { useLabAddresses } from './useLabAddresses'

type SortId = 'pop' | 'low' | 'high'

const sortItems = (items: LabItem[], sort: SortId) => {
	if (sort === 'pop') return items
	return [...items].sort((a, b) => (sort === 'low' ? a.price - b.price : b.price - a.price))
}

export default function LabBrowsePage() {
	const booking = useLabBooking()
	const { addresses, loading: addressesLoading } = useLabAddresses()
	const address = addresses.find((a) => a.id === booking.addressId) ?? addresses[0]

	const [search, setSearch] = useState('')
	const [term, setTerm] = useState('')
	const [type, setType] = useState<LabTypeId>('all')
	const [chosen, setChosen] = useState<string[]>([])
	const [sort, setSort] = useState<SortId>('pop')
	const [opened, setOpened] = useState<LabItem | undefined>(undefined)
	const [counts, setCounts] = useState<Record<string, number>>({})
	const [countedFrom, setCountedFrom] = useState<LabItem[] | null>(null)

	// Search the server once the patient pauses typing.
	useEffect(() => {
		const timer = setTimeout(() => setTerm(search.trim()), 350)
		return () => clearTimeout(timer)
	}, [search])

	// A typed search wins; otherwise the chosen concerns are searched together (their keywords, results merged).
	const queries = useMemo(
		() => (term ? [term] : LAB_CONCERNS.filter((c) => chosen.includes(c.id)).flatMap((c) => c.queries)),
		[term, chosen]
	)
	const { packages, tests, coverage, loading, loadingMore, error, hasMore, loadMore, retry } = useLabCatalogue({
		queries,
		kind: 'all',
		pincode: address?.pincode,
		paused: addressesLoading,
	})

	const unfiltered = chosen.length === 0 && !term
	// The concern counts are from the full list; they are kept while a concern is chosen (the list is then narrowed).
	const everything = useMemo(() => [...packages, ...tests], [packages, tests])
	if (!loading && unfiltered && countedFrom !== everything) {
		setCountedFrom(everything)
		setCounts(countConcerns(everything))
	}

	const visiblePackages = useMemo(
		() => sortItems(packages.filter((i) => matchesConcerns(i, chosen)), sort),
		[packages, chosen, sort]
	)
	const visibleTests = useMemo(
		() => sortItems(tests.filter((i) => matchesConcerns(i, chosen)), sort),
		[tests, chosen, sort]
	)
	const showPackages = type !== 'tests' && visiblePackages.length > 0
	const showTests = type !== 'packages' && visibleTests.length > 0
	const shown = (showPackages ? visiblePackages.length : 0) + (showTests ? visibleTests.length : 0)
	const hasFilters = type !== 'all' || chosen.length > 0 || !!search.trim()

	const toggleItem = (item: LabItem) => {
		const inCart = booking.cart.includes(item.id)
		if (!inCart && booking.cart.length >= MAX_LAB_ITEMS) {
			labBooking.addItem(item.id) // says why it cannot be added
			return
		}
		labBooking.toggleItem(item.id)
	}

	const toggleAll = (items: LabItem[]) => {
		const allIn = items.every((i) => booking.cart.includes(i.id))
		if (allIn) {
			items.forEach((i) => labBooking.removeItem(i.id))
			return
		}
		items.filter((i) => !booking.cart.includes(i.id)).forEach((i) => labBooking.addItem(i.id))
	}

	const clearAll = () => {
		setSearch('')
		setTerm('')
		setType('all')
		setChosen([])
	}

	const toggleConcern = (id: string) => setChosen((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]))

	const typeCounts: Record<LabTypeId, string> = {
		all: loading ? '' : `${packages.length + tests.length}${hasMore ? '+' : ''}`,
		packages: loading ? '' : String(packages.length),
		tests: loading ? '' : `${tests.length}${hasMore ? '+' : ''}`,
	}

	const unserviceable = coverage?.serviceable === false

	return (
		<LabPageShell hero={<LabBrowseHero search={search} onSearch={setSearch} />}>
			<Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
				<LabFilters
					type={type}
					onType={setType}
					typeCounts={typeCounts}
					concerns={chosen}
					onToggleConcern={toggleConcern}
					concernCounts={counts}
					hasFilters={hasFilters}
					onClear={clearAll}
				/>
				<Box component="section" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '22px' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
						<Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 14, color: DESK.muted }}>
							Sort by
							<Box
								component="select"
								value={sort}
								onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as SortId)}
								sx={{
									height: 38,
									px: '10px',
									border: `1.5px solid ${DESK.lineStrong}`,
									borderRadius: '10px',
									bgcolor: DESK.raised,
									color: DESK.ink,
									fontFamily: 'inherit',
									fontSize: 14,
									fontWeight: 700,
								}}
							>
								<option value="pop">Most booked</option>
								<option value="low">Price: low to high</option>
								<option value="high">Price: high to low</option>
							</Box>
						</Box>
					</Box>

					{chosen.length > 0 ? (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
							{LAB_CONCERNS.filter((c) => chosen.includes(c.id)).map((c) => (
								<Box
									key={c.id}
									component="button"
									type="button"
									onClick={() => toggleConcern(c.id)}
									sx={{
										height: 32,
										pl: '12px',
										pr: '10px',
										borderRadius: '9999px',
										border: `1.5px solid ${DESK.primary}`,
										bgcolor: DESK.primaryTint,
										color: DESK.primary,
										fontFamily: 'inherit',
										fontSize: 13,
										fontWeight: 700,
										display: 'flex',
										alignItems: 'center',
										gap: '6px',
										cursor: 'pointer',
									}}
								>
									{c.label}
									<DeskIcon d={DESK_ICONS.close} size={13} strokeWidth={2.6} />
								</Box>
							))}
						</Box>
					) : null}

					{unserviceable ? (
						<Box
							role="status"
							sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.warningSoft, color: DESK.warning, fontSize: 14, lineHeight: '20px' }}
						>
							No lab serves {coverage?.pincode} yet. Choose another address on the next step to see what is available there.
						</Box>
					) : null}

					{error ? (
						<Box sx={{ ...LAB_CARD, p: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
							<Box component="b" sx={{ fontSize: 18 }}>
								We could not load the tests
							</Box>
							<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
								{error}
							</Box>
							<Box sx={{ width: 160 }}>
								<DeskButton label="Try again" kind="primary" onClick={retry} />
							</Box>
						</Box>
					) : null}

					{loading && !error ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
							{[0, 1, 2].map((i) => (
								<AppSkeleton key={i} height={150} sx={{ borderRadius: '18px' }} />
							))}
						</Box>
					) : null}

					{!loading && !error ? (
						<>
							{unfiltered && type === 'all' ? (
								<LabPromoCards
									packages={packages}
									tests={tests}
									cart={booking.cart}
									onOpen={setOpened}
									onToggleAll={toggleAll}
								/>
							) : null}

							{showPackages ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
									<Box sx={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
										<Box component="h2" sx={LAB_H2}>
											Health packages
										</Box>
										<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
											{plural(visiblePackages.length, 'package', 'packages')}
										</Box>
									</Box>
									{visiblePackages.map((item) => (
										<LabPackageCard
											key={item.id}
											item={item}
											added={booking.cart.includes(item.id)}
											onToggle={toggleItem}
											onOpen={setOpened}
										/>
									))}
								</Box>
							) : null}

							{showTests ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
									<Box sx={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
										<Box component="h2" sx={LAB_H2}>
											Single tests
										</Box>
										<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
											{plural(visibleTests.length, 'test', 'tests')}
											{hasMore ? ' so far' : ''}
										</Box>
									</Box>
									<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
										{visibleTests.map((item) => (
											<LabTestCard
												key={item.id}
												item={item}
												added={booking.cart.includes(item.id)}
												onToggle={toggleItem}
												onOpen={setOpened}
											/>
										))}
									</Box>
									{hasMore ? (
										<Box sx={{ alignSelf: 'center', width: 220 }}>
											<DeskButton label="Show more tests" kind="secondary" onClick={() => void loadMore()} loading={loadingMore} />
										</Box>
									) : null}
								</Box>
							) : null}

							{shown === 0 && !unserviceable ? (
								<Box
									sx={{
										...LAB_CARD,
										borderStyle: 'dashed',
										p: '48px 24px',
										textAlign: 'center',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: '8px',
									}}
								>
									<Box component="b" sx={{ fontSize: 18 }}>
										No tests match
									</Box>
									<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
										Try another word, or clear your filters.
									</Box>
									<Box sx={{ mt: '6px', width: 220 }}>
										<DeskButton label="Clear search & filters" kind="secondary" onClick={clearAll} />
									</Box>
								</Box>
							) : null}
						</>
					) : null}
				</Box>
				<LabBrowseCart />
			</Box>
			<LabDetailsDrawer
				item={opened}
				addressId={address?.id ?? null}
				added={!!opened && booking.cart.includes(opened.id)}
				onToggle={toggleItem}
				onClose={() => setOpened(undefined)}
			/>
		</LabPageShell>
	)
}
