// src/features/nursing/components/NursingItemCards.tsx
//
// The two cards of the browse list, laid out like the Lab tests cards: a care package (wide row with a picture panel, bullets, price and Add)
// and a nursing procedure (card with a picture panel on top, price and Add at the bottom). The API has no pictures, so the panel is a tinted
// gradient with an icon.
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import LabAddButton from '../../lab/components/LabAddButton'
import { inr, plural } from '../../lab/labFormat'
import { LAB_CARD } from '../../lab/labStyles'
import { mediaOf } from '../nursingConstants'
import { durationLabel, offLabel } from '../nursingFormat'
import type { NursingItem } from '../nursingService'
import { useCareService } from '../useCareService'

interface NursingItemCardProps {
	item: NursingItem
	added: boolean
	onToggle: (item: NursingItem) => void
	onOpen: (item: NursingItem) => void
}

function Panel({ item, variant }: { item: NursingItem; variant: 'side' | 'top' }) {
	const media = mediaOf(item)
	const side = variant === 'side'
	return (
		<Box
			aria-hidden="true"
			sx={{
				position: 'relative',
				flexShrink: 0,
				overflow: 'hidden',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: `linear-gradient(150deg, ${media.light} 0%, ${media.deep} 100%)`,
				color: media.ink,
				...(side ? { width: 170, m: '-20px 0 -20px -20px', borderRadius: '16px 0 0 16px' } : { height: 112, m: '-18px -18px 4px', borderRadius: '16px 16px 0 0' }),
			}}
		>
			<Box sx={{ position: 'absolute', right: side ? -30 : -24, top: side ? -30 : -36, width: side ? 120 : 110, height: side ? 120 : 110, borderRadius: '9999px', bgcolor: '#FFFFFF59' }} />
			{side ? <Box sx={{ position: 'absolute', left: -24, bottom: -40, width: 110, height: 110, borderRadius: '9999px', bgcolor: '#FFFFFF40' }} /> : null}
			<Box
				sx={{
					position: 'relative',
					width: side ? 84 : 66,
					height: side ? 84 : 66,
					borderRadius: '9999px',
					bgcolor: '#FFFFFF',
					boxShadow: `0 ${side ? 8 : 6}px ${side ? 20 : 16}px #12373E1F`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<DeskIcon d={media.icon} size={side ? 40 : 32} strokeWidth={1.7} />
			</Box>
			{side && item.visitsCount ? (
				<Box component="span" sx={{ position: 'absolute', left: 12, bottom: 12, p: '4px 9px', borderRadius: '8px', bgcolor: '#FFFFFFE6', color: DESK.ink, fontSize: 12, fontWeight: 800 }}>
					{plural(item.visitsCount, 'visit', 'visits')}
				</Box>
			) : null}
		</Box>
	)
}

function Fact({ icon, children }: { icon: string; children: string }) {
	return (
		<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
			<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
				<DeskIcon d={icon} size={15} />
			</Box>
			{children}
		</Box>
	)
}

function Price({ item, size, suffix }: { item: NursingItem; size: number; suffix?: string }) {
	const off = offLabel(item)
	return (
		<Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: size > 20 ? 'flex-end' : 'flex-start' }}>
			<Box component="b" sx={{ fontSize: size }}>
				{inr(item.price)}
				{suffix ? (
					<Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: DESK.muted }}>
						{' '}
						{suffix}
					</Box>
				) : null}
			</Box>
			{off ? (
				<Box component="span" sx={{ fontSize: size > 20 ? 13 : 12 }}>
					<Box component="s" sx={{ color: DESK.faint }}>
						{inr(item.mrp ?? 0)}
					</Box>{' '}
					<Box component="b" sx={{ color: DESK.success }}>
						{off}
					</Box>
				</Box>
			) : null}
		</Box>
	)
}

const nameButtonSx = {
	alignSelf: 'flex-start',
	p: 0,
	border: 0,
	bgcolor: 'transparent',
	color: DESK.ink,
	fontFamily: 'inherit',
	fontWeight: 800,
	textAlign: 'left',
	cursor: 'pointer',
	'&:hover': { color: DESK.primary },
} as const

export function NursingPackageCard({ item, added, onToggle, onOpen }: NursingItemCardProps) {
	const care = useCareService()
	const duration = durationLabel(item.durationMinutes)
	return (
		<Box component="article" sx={{ ...LAB_CARD, border: `1.5px solid ${added ? DESK.primary : DESK.cardLine}`, p: '20px', overflow: 'hidden', display: 'flex', gap: '18px' }}>
			<Panel item={item} variant="side" />
			<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
				<Box component="span" sx={{ fontSize: 12, lineHeight: '16px', fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary }}>
					CARE PACKAGE
				</Box>
				<Box component="button" type="button" onClick={() => onOpen(item)} sx={{ ...nameButtonSx, fontSize: 19, lineHeight: '25px' }}>
					{item.name}
				</Box>
				{item.about ? (
					<Box
						component="span"
						sx={{ fontSize: 13, lineHeight: '19px', color: DESK.muted, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
					>
						{item.about}
					</Box>
				) : null}
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 13, color: DESK.muted }}>
					{item.visitsCount ? <Fact icon={DESK_ICONS.calendar}>{plural(item.visitsCount, 'visit', 'visits')}</Fact> : null}
					{duration ? <Fact icon={DESK_ICONS.clock}>{`${duration} per visit`}</Fact> : null}
					{item.procedureCount ? <Fact icon={DESK_ICONS.check}>{plural(item.procedureCount, 'procedure', 'procedures')}</Fact> : null}
					<Fact icon={DESK_ICONS.user}>{`${care.nounTitle} visits you at home`}</Fact>
				</Box>
			</Box>
			<Box sx={{ flexShrink: 0, width: 124, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px' }}>
				<Price item={item} size={22} />
				<LabAddButton added={added} onClick={() => onToggle(item)} name={item.name} />
				<Box
					component="button"
					type="button"
					onClick={() => onOpen(item)}
					sx={{ p: 0, border: 0, bgcolor: 'transparent', color: DESK.primary, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
				>
					View details
				</Box>
			</Box>
		</Box>
	)
}

export function NursingProcedureCard({ item, added, onToggle, onOpen }: NursingItemCardProps) {
	const care = useCareService()
	const duration = durationLabel(item.durationMinutes)
	return (
		<Box component="article" sx={{ ...LAB_CARD, border: `1.5px solid ${added ? DESK.primary : DESK.cardLine}`, p: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '8px' }}>
			<Panel item={item} variant="top" />
			<Box component="span" sx={{ fontSize: 11, lineHeight: '14px', fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary }}>
				{care.serviceKind}
			</Box>
			<Box component="button" type="button" onClick={() => onOpen(item)} sx={{ ...nameButtonSx, fontSize: 16, lineHeight: '22px' }}>
				{item.name}
			</Box>
			<Box component="span" sx={{ fontSize: 13, lineHeight: '19px', color: DESK.muted }}>
				{[duration, 'At your home', care.key === 'nursing-care' ? 'Supplies included' : ''].filter(Boolean).join(' · ')}
			</Box>
			<Box sx={{ mt: 'auto', pt: '12px', borderTop: `1px dashed ${DESK.lineStrong}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
				<Box sx={{ flexGrow: 1 }}>
					<Price item={item} size={18} />
				</Box>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
					<LabAddButton added={added} onClick={() => onToggle(item)} name={item.name} />
					<Box
						component="button"
						type="button"
						onClick={() => onOpen(item)}
						sx={{ p: 0, border: 0, bgcolor: 'transparent', color: DESK.primary, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
					>
						View details
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
