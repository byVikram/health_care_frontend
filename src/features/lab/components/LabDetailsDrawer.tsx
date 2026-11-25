// src/features/lab/components/LabDetailsDrawer.tsx
//
// The details panel that slides in from the right when a card is opened: sample / fasting / report tiles, what the item is, what a package
// includes, the lab's preparation notes, and the price with the Add / Remove button. The content comes from the item's detail call, so the
// panel opens once it has loaded (useLabItemDetail's `ready`).
import { Box } from '@mui/material'
import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import type { LabItem } from '../labConstants'
import { LAB_ICONS } from '../labConstants'
import { inr } from '../../booking/bookingFormat'
import { fastingKnown, offLabel } from '../labStyles'
import { useLabItemDetail } from '../labCatalogue'
import AddToggleButton from '../../../components/common/Button/AddToggleButton'

interface LabDetailsDrawerProps {
	/** The card that was opened (undefined = closed). */
	item: LabItem | undefined
	addressId: string | null
	added: boolean
	onToggle: (item: LabItem) => void
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

export default function LabDetailsDrawer({ item, addressId, added, onToggle, onClose }: LabDetailsDrawerProps) {
	const { item: full, error, ready } = useLabItemDetail(item, addressId)
	const shown = full ?? item
	const open = !!item && ready && !!shown
	const isPackage = shown?.kind === 'package'
	const included = shown?.includedTests ?? []
	const off = shown ? offLabel(shown) : ''

	return (
		<AppDrawer
			open={open}
			onClose={onClose}
			title={shown?.name ?? ''}
			subtitle={isPackage ? 'HEALTH PACKAGE' : 'LAB TEST'}
			subtitleSx={{ fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary }}
			width={540}
			onConfirm={onClose}
			footerContent={
				shown ? (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
						<Box component="span" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
							<Box component="b" sx={{ fontSize: 22 }}>
								{inr(shown.price)}
							</Box>
							{off ? (
								<Box component="span" sx={{ fontSize: 13 }}>
									<Box component="s" sx={{ color: DESK.faint }}>
										{inr(shown.mrp)}
									</Box>{' '}
									<Box component="b" sx={{ color: DESK.success }}>
										{off}
									</Box>
								</Box>
							) : null}
						</Box>
						<AddToggleButton
							added={added}
							onClick={() => {
								onToggle(shown)
								// adding closes the drawer, so the patient is back on the list with the cart updated; removing keeps it open
								if (!added) onClose()
							}}
							labels={['Add to cart', 'Remove from cart']}
							height={48}
							minWidth={150}
						/>
					</Box>
				) : null
			}
		>
			{shown ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', py: '4px' }}>
					{error ? (
						<Box component="span" sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.warningSoft, color: DESK.warning, fontSize: 13 }}>
							We could not load the full details just now. The price and booking still work.
						</Box>
					) : null}
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
						<Tile icon={LAB_ICONS.drop} label="Sample" value={shown.sample} />
						<Tile
							icon={DESK_ICONS.clock}
							label="Fasting"
							value={!fastingKnown(shown) ? 'See preparation' : shown.fasting ? (shown.fastingLabel ?? 'Needed') : 'Not needed'}
						/>
						<Tile icon={DESK_ICONS.file} label="Report" value={shown.report.replace(/^Reports? in /, '')} />
					</Box>
					{shown.about ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
							<Box component="b" sx={headingSx}>
								About this {isPackage ? 'package' : 'test'}
							</Box>
							<Box component="span" sx={textSx}>
								{shown.about}
							</Box>
						</Box>
					) : null}
					{included.length > 0 ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
							<Box component="b" sx={headingSx}>
								What’s included · {shown.tests ?? included.length} tests
							</Box>
							{included.map((name) => (
								<Box
									key={name}
									sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: '10px', borderBottom: `1px solid ${DESK.lineSoft}`, fontSize: 14 }}
								>
									<Box component="span" sx={{ display: 'flex', color: DESK.success }}>
										<DeskIcon d={DESK_ICONS.tick} size={15} strokeWidth={2.6} />
									</Box>
									{name}
								</Box>
							))}
						</Box>
					) : null}
					{shown.preparations && shown.preparations.length > 0 ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
							<Box component="b" sx={headingSx}>
								Preparation
							</Box>
							<Box component="ul" sx={{ m: 0, pl: '20px', ...textSx, display: 'flex', flexDirection: 'column', gap: '4px' }}>
								{shown.preparations.map((line) => (
									<li key={line}>{line}</li>
								))}
							</Box>
						</Box>
					) : null}
					<Box
						component="span"
						sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.primarySoft, fontSize: 13, lineHeight: '19px', color: DESK.ink, display: 'flex', gap: '10px' }}
					>
						<Box component="span" sx={{ display: 'flex', color: DESK.primary, flexShrink: 0 }}>
							<DeskIcon d={DESK_ICONS.shield} size={18} />
						</Box>
						Processed at NABL-accredited labs. A trained phlebotomist collects your sample at home, free.
					</Box>
				</Box>
			) : null}
		</AppDrawer>
	)
}
