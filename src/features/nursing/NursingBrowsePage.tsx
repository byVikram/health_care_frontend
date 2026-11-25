// src/features/nursing/NursingBrowsePage.tsx
//
// Nursing care at home, browse (the Lab tests browse page with the Nursing care design's content): hero with search, filters (Show, Care for),
// promo cards, the care packages and the nursing procedures, and the sticky "Your booking" cart with "Book now" and "Schedule for later".
// The catalogue is one call (GET /catalog) and the search is a server search. The cart holds ONE package OR procedures, never both (the
// server's rule): adding across kinds asks to replace what is there.
import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DeskButton from '../../components/common/Button/DeskButton'
import ConfirmModal from '../../components/common/Modal/ConfirmModal'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import { DESK } from '../../styles/deskTokens'
import PatientPageShell from '../../components/layout/PatientPageShell'
import { BOOKING_CARD, BOOKING_H2 } from '../booking/bookingStyles'
import NursingBrowseCart from './components/NursingBrowseCart'
import NursingBrowseHero from './components/NursingBrowseHero'
import NursingDetailsDrawer from './components/NursingDetailsDrawer'
import NursingFilters from './components/NursingFilters'
import { NursingPackageCard, NursingProcedureCard } from './components/NursingItemCards'
import NursingPromoCards from './components/NursingPromoCards'
import { nursingBooking, useNursingBooking, type BookingMode } from './nursingBookingStore'
import type { NursingTypeId } from './nursingConstants'
import type { NursingItem } from './nursingService'
import { useNursingCatalogue, useNursingCategories, useNursingConfig } from './useNursingCatalogue'
import { carePath } from './careServices'
import { useCareService } from './useCareService'

export default function NursingBrowsePage() {
	const navigate = useNavigate()
	const booking = useNursingBooking()
	const care = useCareService()
	const { helpline } = useNursingConfig()
	const categories = useNursingCategories(care.key)

	// a cart is for one service: arriving here for another one starts it afresh
	useEffect(() => {
		nursingBooking.useService(care.key)
	}, [care.key])

	const [search, setSearch] = useState('')
	const [term, setTerm] = useState('')
	const [type, setType] = useState<NursingTypeId>('all')
	const [categoryId, setCategoryId] = useState<string | null>(null)
	const [opened, setOpened] = useState<NursingItem | undefined>(undefined)
	const [replacing, setReplacing] = useState<NursingItem | null>(null)

	// Search the server once the patient pauses typing.
	useEffect(() => {
		const timer = setTimeout(() => setTerm(search.trim()), 350)
		return () => clearTimeout(timer)
	}, [search])

	const { packages, procedures, loading, error, retry } = useNursingCatalogue(care.key, term)
	const cart = useMemo(() => booking.items.map((i) => i.id), [booking.items])

	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = {}
		procedures.forEach((p) => {
			if (p.categoryId) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1
		})
		return counts
	}, [procedures])

	// A "Care for" group narrows the procedures to it; packages are not grouped, so they are left out while one is chosen.
	const visiblePackages = useMemo(() => (categoryId ? [] : packages), [packages, categoryId])
	const visibleProcedures = useMemo(() => (categoryId ? procedures.filter((p) => p.categoryId === categoryId) : procedures), [procedures, categoryId])
	const showPackages = type !== 'procedures' && visiblePackages.length > 0
	const showProcedures = type !== 'packages' && visibleProcedures.length > 0
	const shown = (showPackages ? visiblePackages.length : 0) + (showProcedures ? visibleProcedures.length : 0)
	const hasFilters = type !== 'all' || !!categoryId || !!search.trim()
	const unfiltered = !term && !categoryId

	const toggleItem = (item: NursingItem) => {
		if (nursingBooking.has(item.id)) {
			nursingBooking.removeItem(item.id)
			return
		}
		if (nursingBooking.conflictsWith(item)) {
			setReplacing(item)
			return
		}
		nursingBooking.addItem(item)
	}

	const clearAll = () => {
		setSearch('')
		setTerm('')
		setType('all')
		setCategoryId(null)
	}

	const typeCounts: Record<NursingTypeId, string> = {
		all: loading ? '' : String(visiblePackages.length + visibleProcedures.length),
		packages: loading ? '' : String(visiblePackages.length),
		procedures: loading ? '' : String(visibleProcedures.length),
	}

	const goBook = (mode: BookingMode) => {
		nursingBooking.set({ mode })
		navigate(carePath(care.key, 'schedule'))
	}

	return (
		<PatientPageShell hero={<NursingBrowseHero search={search} onSearch={setSearch} />}>
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: '24px', alignItems: { xs: 'stretch', lg: 'flex-start' } }}>
				<NursingFilters
					type={type}
					onType={setType}
					typeCounts={typeCounts}
					categories={categories}
					categoryId={categoryId}
					onCategory={setCategoryId}
					categoryCounts={categoryCounts}
					hasFilters={hasFilters}
					onClear={clearAll}
				/>
				<Box component="section" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '22px' }}>
					{error ? (
						<Box sx={{ ...BOOKING_CARD, p: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
							<Box component="b" sx={{ fontSize: 18 }}>
								We could not load the services
							</Box>
							<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
								{error}
							</Box>
							<Box sx={{ width: 160 }}>
								<DeskButton label="Try again" kind="primary" onClick={() => void retry()} />
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
								<NursingPromoCards packages={packages} procedures={procedures} cart={cart} helpline={care.hasHelpline ? helpline : null} onOpen={setOpened} onToggle={toggleItem} />
							) : null}

							{showPackages ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
									<Box sx={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
										<Box component="h2" sx={{ ...BOOKING_H2, whiteSpace: 'nowrap', flexShrink: 0 }}>
											Care packages
										</Box>
									</Box>
									{visiblePackages.map((item) => (
										<NursingPackageCard key={item.id} item={item} added={cart.includes(item.id)} onToggle={toggleItem} onOpen={setOpened} />
									))}
								</Box>
							) : null}

							{showProcedures ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
									<Box sx={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
										<Box component="h2" sx={{ ...BOOKING_H2, whiteSpace: 'nowrap', flexShrink: 0 }}>
											{care.servicesTitle}
										</Box>
									</Box>
									<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '14px' }}>
										{visibleProcedures.map((item) => (
											<NursingProcedureCard key={item.id} item={item} added={cart.includes(item.id)} onToggle={toggleItem} onOpen={setOpened} />
										))}
									</Box>
								</Box>
							) : null}

							{shown === 0 ? (
								<Box sx={{ ...BOOKING_CARD, borderStyle: 'dashed', p: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
									<Box component="b" sx={{ fontSize: 18 }}>
										No services match
									</Box>
									<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
										{care.emptySearchHint}
									</Box>
									<Box sx={{ mt: '6px', width: 220 }}>
										<DeskButton label="Clear search & filters" kind="secondary" onClick={clearAll} />
									</Box>
								</Box>
							) : null}
						</>
					) : null}
				</Box>
				<NursingBrowseCart onContinue={goBook} />
			</Box>

			<NursingDetailsDrawer item={opened} added={!!opened && cart.includes(opened.id)} onToggle={toggleItem} onClose={() => setOpened(undefined)} />

			<ConfirmModal
				open={!!replacing}
				onClose={() => setReplacing(null)}
				onConfirm={() => {
					if (replacing) nursingBooking.addItem(replacing)
					setReplacing(null)
				}}
				variant="confirm"
				title="Replace your booking?"
				description={
					replacing?.kind === 'package'
						? 'A care package is booked on its own. Adding it replaces the services in your booking.'
						: 'A care package is booked on its own. Adding a procedure replaces the package in your booking.'
				}
				confirmLabel="Replace"
			/>
		</PatientPageShell>
	)
}
