// src/features/nursing/components/NursingDetailsDrawer.tsx
//
// The "Service details" panel that slides in from the right when a card is opened (the design's frame 1a): fact tiles (Duration / Visit by /
// Supplies / Where, or Visits / Per visit / Valid for for a package), what the service is, who it is good for, what is included, "Before the
// nurse arrives" and the price with the Add / Remove button. A package that lists nothing itself shows the procedures it bundles
// (GET /packages/{id}). Only what the API sends is shown: a missing field hides its row.
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import AddToggleButton from '../../../components/common/Button/AddToggleButton'
import { inr, plural } from '../../booking/bookingFormat'
import { fetchPackageDetail, type NursingItem } from '../nursingService'
import { durationLabel, offLabel } from '../nursingFormat'
import { useCareService } from '../useCareService'

interface NursingDetailsDrawerProps {
	/** The card that was opened (undefined = closed). */
	item: NursingItem | undefined
	added: boolean
	onToggle: (item: NursingItem) => void
	onClose: () => void
}

function Tile({ icon, label, value }: { icon: string; label: string; value: string }) {
	return (
		<Box component="span" sx={{ p: '12px', borderRadius: '12px', bgcolor: DESK.page, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
			<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
				<DeskIcon d={icon} size={18} />
			</Box>
			<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
				{label}
			</Box>
			<Box component="b" sx={{ fontSize: 14 }}>
				{value}
			</Box>
		</Box>
	)
}

const headingSx = { fontSize: 16 } as const
const textSx = { fontSize: 15, lineHeight: '23px', color: DESK.inkSoft } as const
const BOX = 'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8'

export default function NursingDetailsDrawer({ item: opened, added: openedAdded, onToggle, onClose }: NursingDetailsDrawerProps) {
	const care = useCareService()
	// The panel slides out slowly, so it keeps showing the last card until it is gone (otherwise it empties the moment it starts to close).
	const [last, setLast] = useState<{ item: NursingItem; added: boolean } | undefined>(undefined)
	if (opened && (last?.item !== opened || last.added !== openedAdded)) setLast({ item: opened, added: openedAdded })
	const item = opened ?? last?.item
	const added = opened ? openedAdded : (last?.added ?? false)
	// The procedures a package bundles, for the one that was loaded last (kept with its id, so a stale answer is never shown for another card).
	const [bundle, setBundle] = useState<{ id: string; procedures: { id: string; label: string }[] } | null>(null)
	const needsBundle = !!item && item.kind === 'package' && item.includes.length === 0
	const bundled = needsBundle && bundle?.id === item.id ? bundle.procedures : []
	const loadingBundle = needsBundle && bundle?.id !== item.id

	// A package without its own list shows the procedures it bundles.
	useEffect(() => {
		if (!item || !needsBundle) return
		let alive = true
		void (async () => {
			const detail = await fetchPackageDetail(item.id)
			if (alive) setBundle({ id: item.id, procedures: detail?.procedures ?? [] })
		})()
		return () => {
			alive = false
		}
	}, [item, needsBundle])

	const isPackage = item?.kind === 'package'
	const off = item ? offLabel(item) : ''
	const duration = item ? durationLabel(item.durationMinutes) : ''
	const included = item ? (item.includes.length > 0 ? item.includes : bundled.map((b) => b.label)) : []
	const about = item?.about ? (/[.!?]$/.test(item.about) ? item.about : `${item.about}.`) : ''

	return (
		<AppDrawer
			open={!!opened}
			transitionDuration={{ enter: 300, exit: 450 }}
			onClose={onClose}
			title={item?.name ?? ''}
			subtitle={isPackage ? care.packageKind : care.serviceKind}
			subtitleSx={{ fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary }}
			width={540}
			onConfirm={onClose}
			footerContent={
				item ? (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
						<Box component="span" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
							<Box component="b" sx={{ fontSize: 22 }}>
								{inr(item.price)}
							</Box>
							{off ? (
								<Box component="span" sx={{ fontSize: 13 }}>
									<Box component="s" sx={{ color: DESK.faint }}>
										{inr(item.mrp ?? 0)}
									</Box>{' '}
									<Box component="b" sx={{ color: DESK.success }}>
										{off}
									</Box>
								</Box>
							) : null}
						</Box>
						<AddToggleButton noun="booking" added={added} onClick={() => {
									onToggle(item)
									// adding closes the drawer, so the patient is back on the list with the cart updated; removing keeps it open
									if (!added) onClose()
								}} labels={['Add to booking', 'Added to booking']} height={48} minWidth={170} />
					</Box>
				) : null
			}
		>
			{item ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', py: '4px' }}>
					<Box sx={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(0, 1fr)', gap: '10px' }}>
						{isPackage ? (
							<>
								{item.visitsCount ? <Tile icon={DESK_ICONS.calendar} label="Visits" value={plural(item.visitsCount, 'visit', 'visits')} /> : null}
								{duration ? <Tile icon={DESK_ICONS.clock} label="Per visit" value={duration} /> : null}
								{item.validityDays ? <Tile icon={BOX} label="Valid for" value={plural(item.validityDays, 'day', 'days')} /> : null}
								<Tile icon={DESK_ICONS.user} label="Visit by" value={care.nounTitle} />
							</>
						) : (
							<>
								{duration ? <Tile icon={DESK_ICONS.clock} label="Duration" value={duration} /> : null}
								<Tile icon={DESK_ICONS.user} label="Visit by" value={care.nounTitle} />
								<Tile icon={BOX} label="Supplies" value="Included" />
								<Tile icon={DESK_ICONS.home} label="Where" value="At your home" />
							</>
						)}
					</Box>
					{about ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
							<Box component="b" sx={headingSx}>
								About this service
							</Box>
							<Box component="span" sx={textSx}>
								{about}
							</Box>
							{item.goodFor ? (
								<Box component="span" sx={textSx}>
									<b>Good for:</b> {item.goodFor}
								</Box>
							) : null}
						</Box>
					) : item.goodFor ? (
						<Box component="span" sx={textSx}>
							<b>Good for:</b> {item.goodFor}
						</Box>
					) : null}
					{included.length > 0 || loadingBundle ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
							<Box component="b" sx={headingSx}>
								What’s included
							</Box>
							{loadingBundle ? (
								<Box component="span" sx={{ fontSize: 14, color: DESK.muted, py: '8px' }}>
									Loading…
								</Box>
							) : null}
							{included.map((name) => (
								<Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: '10px', borderBottom: `1px solid ${DESK.lineSoft}`, fontSize: 14 }}>
									<Box component="span" sx={{ display: 'flex', color: DESK.success }}>
										<DeskIcon d={DESK_ICONS.tick} size={15} strokeWidth={2.6} />
									</Box>
									{name}
								</Box>
							))}
						</Box>
					) : null}
					{item.prepSteps.length > 0 ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<Box component="b" sx={headingSx}>
								Before the {care.noun} arrives
							</Box>
							{item.prepSteps.map((step, index) => (
								<Box key={step} sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
									<Box component="span" sx={{ width: 24, height: 24, flexShrink: 0, borderRadius: '9999px', bgcolor: DESK.primarySoft, color: DESK.primary, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
										{index + 1}
									</Box>
									<Box component="span" sx={textSx}>
										{step}
									</Box>
								</Box>
							))}
						</Box>
					) : null}
					<Box component="span" sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.primarySoft, fontSize: 13, lineHeight: '19px', color: DESK.ink, display: 'flex', gap: '10px' }}>
						{care.key === 'nursing-care' ? 'A verified, qualified nurse comes to your home with sterile supplies.' : `A verified ${care.noun} comes to your home.`} You pay after the visit.
					</Box>
				</Box>
			) : null}
		</AppDrawer>
	)
}
