// src/features/lab/components/LabItemCards.tsx
//
// The two cards of the browse list: a health package (wide row with a picture panel, facts, price and Add) and a single test (card with a
// picture panel on top, price and Add at the bottom). The API has no pictures, so the panel is a tinted gradient with the item's icon.
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK, DESK_ICONS } from '../../../styles/deskTokens'
import { LAB_CONCERNS, LAB_ICONS, type LabItem } from '../labConstants'
import { inr } from '../labFormat'
import { LAB_CARD, fastingKnown, mediaOf, offLabel } from '../labStyles'
import LabAddButton from './LabAddButton'

interface LabItemCardProps {
	item: LabItem
	added: boolean
	onToggle: (item: LabItem) => void
	onOpen: (item: LabItem) => void
}

function Panel({ item, variant }: { item: LabItem; variant: 'side' | 'top' }) {
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
				...(side
					? { width: 170, m: '-20px 0 -20px -20px', borderRadius: '16px 0 0 16px' }
					: { height: 112, m: '-18px -18px 4px', borderRadius: '16px 16px 0 0' }),
			}}
		>
			<Box
				sx={{
					position: 'absolute',
					right: side ? -30 : -24,
					top: side ? -30 : -36,
					width: side ? 120 : 110,
					height: side ? 120 : 110,
					borderRadius: '9999px',
					bgcolor: '#FFFFFF59',
				}}
			/>
			{side ? (
				<Box
					sx={{
						position: 'absolute',
						left: -24,
						bottom: -40,
						width: 110,
						height: 110,
						borderRadius: '9999px',
						bgcolor: '#FFFFFF40',
					}}
				/>
			) : null}
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
			{side && item.tests ? (
				<Box
					component="span"
					sx={{
						position: 'absolute',
						left: 12,
						bottom: 12,
						p: '4px 9px',
						borderRadius: '8px',
						bgcolor: '#FFFFFFE6',
						color: DESK.ink,
						fontSize: 12,
						fontWeight: 800,
					}}
				>
					{item.tests} tests
				</Box>
			) : null}
			{!side && fastingKnown(item) ? (
				<Box
					component="span"
					sx={{
						position: 'absolute',
						right: 12,
						top: 12,
						height: 24,
						px: '8px',
						borderRadius: '6px',
						bgcolor: item.fasting ? DESK.warningSoft : DESK.successSoft,
						color: item.fasting ? DESK.warning : DESK.success,
						fontSize: 11,
						fontWeight: 800,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					{item.fasting ? `${item.fastingLabel ?? ''} fasting`.trim() : 'No fasting'}
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

function Price({ item, size }: { item: LabItem; size: number }) {
	const off = offLabel(item)
	return (
		<Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: size > 20 ? 'flex-end' : 'flex-start' }}>
			<Box component="b" sx={{ fontSize: size }}>
				{inr(item.price)}
			</Box>
			{off ? (
				<Box component="span" sx={{ fontSize: size > 20 ? 13 : 12 }}>
					<Box component="s" sx={{ color: DESK.faint }}>
						{inr(item.mrp)}
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

export function LabPackageCard({ item, added, onToggle, onOpen }: LabItemCardProps) {
	const concerns = LAB_CONCERNS.filter((c) => item.tags.includes(c.id)).slice(0, 4)
	return (
		<Box
			component="article"
			sx={{
				...LAB_CARD,
				border: `1.5px solid ${added ? DESK.primary : DESK.cardLine}`,
				p: '20px',
				overflow: 'hidden',
				display: 'flex',
				gap: '18px',
			}}
		>
			<Panel item={item} variant="side" />
			<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
				<Box component="span" sx={{ fontSize: 12, lineHeight: '16px', fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary }}>
					HEALTH PACKAGE
				</Box>
				<Box component="button" type="button" onClick={() => onOpen(item)} sx={{ ...nameButtonSx, fontSize: 19, lineHeight: '25px' }}>
					{item.name}
				</Box>
				{concerns.length ? (
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
						{concerns.map((c) => (
							<Box
								key={c.id}
								component="span"
								sx={{
									height: 26,
									px: '10px',
									borderRadius: '8px',
									bgcolor: DESK.chip,
									fontSize: 12,
									fontWeight: 700,
									display: 'flex',
									alignItems: 'center',
								}}
							>
								{c.label}
							</Box>
						))}
					</Box>
				) : null}
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 13, color: DESK.muted }}>
					{item.tests ? <Fact icon={LAB_ICONS.flask}>{`${item.tests} tests`}</Fact> : null}
					{fastingKnown(item) ? (
						<Fact icon={DESK_ICONS.clock}>
							{item.fasting ? `${item.fastingLabel ?? ''} fasting`.trim() : 'No fasting needed'}
						</Fact>
					) : null}
					<Fact icon={DESK_ICONS.file}>{item.report}</Fact>
				</Box>
			</Box>
			<Box
				sx={{
					flexShrink: 0,
					width: 124,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-end',
					justifyContent: 'space-between',
					gap: '10px',
				}}
			>
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

export function LabTestCard({ item, added, onToggle, onOpen }: LabItemCardProps) {
	return (
		<Box
			component="article"
			sx={{
				...LAB_CARD,
				border: `1.5px solid ${added ? DESK.primary : DESK.cardLine}`,
				p: '18px',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				gap: '8px',
			}}
		>
			<Panel item={item} variant="top" />
			<Box component="button" type="button" onClick={() => onOpen(item)} sx={{ ...nameButtonSx, fontSize: 16, lineHeight: '22px' }}>
				{item.name}
			</Box>
			<Box component="span" sx={{ fontSize: 13, lineHeight: '19px', color: DESK.muted }}>
				{item.sample} · {item.report}
			</Box>
			<Box sx={{ mt: 'auto', pt: '12px', borderTop: `1px dashed ${DESK.lineStrong}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
				<Box sx={{ flexGrow: 1 }}>
					<Price item={item} size={18} />
				</Box>
				<LabAddButton added={added} onClick={() => onToggle(item)} name={item.name} />
			</Box>
		</Box>
	)
}
