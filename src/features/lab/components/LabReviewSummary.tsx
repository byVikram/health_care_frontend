// src/features/lab/components/LabReviewSummary.tsx
//
// The teal summary card on the right of the Review page: the amount to pay at collection (with the saving), a dashed tear line, when and
// where, who the tests are for, and the lines of the bill (each test, and the free home collection).
import { Box } from '@mui/material'
import AvatarTile from '../../../components/common/Avatar/AvatarTile'
import { DESK } from '../../../styles/deskTokens'
import { inr } from '../../booking/bookingFormat'

const capsSx = { fontSize: 12, lineHeight: '16px', fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary } as const

interface LabReviewSummaryProps {
	total: number
	savings: number
	whenTime: string
	whenDate: string
	whereTitle: string
	whereSub: string
	patientName: string
	patientRelation: string
	items: { id: string; name: string; price: number }[]
	/** Home collection is free: a line for it. */
	isHome: boolean
}

export default function LabReviewSummary({
	total,
	savings,
	whenTime,
	whenDate,
	whereTitle,
	whereSub,
	patientName,
	patientRelation,
	items,
	isHome,
}: LabReviewSummaryProps) {
	return (
		<Box sx={{ borderRadius: '20px', bgcolor: DESK.primarySoft, overflow: 'hidden' }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', p: '20px', gap: '10px' }}>
				<Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
					<Box component="span" sx={capsSx}>
						AMOUNT TO PAY AT COLLECTION
					</Box>
					<Box component="b" sx={{ fontSize: 34, lineHeight: '42px', letterSpacing: '-0.01em' }}>
						{inr(total)}
					</Box>
				</Box>
				{savings > 0 ? (
					<Box
						component="span"
						sx={{
							mb: '8px',
							p: '4px 10px',
							borderRadius: '9999px',
							bgcolor: DESK.successSoft,
							color: DESK.success,
							fontSize: 12,
							fontWeight: 800,
							whiteSpace: 'nowrap',
						}}
					>
						You save {inr(savings)}
					</Box>
				) : null}
			</Box>
			<Box aria-hidden="true" sx={{ position: 'relative', height: 0, borderTop: `2px dashed ${DESK.mint}`, mx: '24px' }}>
				<Box
					component="span"
					sx={{ position: 'absolute', left: -36, top: -11, width: 20, height: 20, borderRadius: '9999px', bgcolor: DESK.page }}
				/>
				<Box
					component="span"
					sx={{ position: 'absolute', right: -36, top: -11, width: 20, height: 20, borderRadius: '9999px', bgcolor: DESK.page }}
				/>
			</Box>
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '14px', p: '20px 20px 14px' }}>
				<Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
					<Box component="span" sx={capsSx}>
						WHEN
					</Box>
					<Box component="b" sx={{ fontSize: 18 }}>
						{whenTime}
					</Box>
					<Box component="span" sx={{ fontSize: 13, color: DESK.muted }}>
						{whenDate}
					</Box>
				</Box>
				<Box component="span" sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
					<Box component="span" sx={capsSx}>
						WHERE
					</Box>
					<Box component="b" sx={{ fontSize: 15 }}>
						{whereTitle}
					</Box>
					<Box component="span" sx={{ fontSize: 13, color: DESK.muted, overflowWrap: 'anywhere' }}>
						{whereSub}
					</Box>
				</Box>
			</Box>
			<Box sx={{ p: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 14 }}>
					<AvatarTile
						initials={patientName.trim().charAt(0).toUpperCase()}
						size={26}
						radius="round"
						bg="#FFFFFF"
					/>
					<span>
						For <b>{patientName}</b>
						{patientRelation ? ` (${patientRelation})` : ''}
					</span>
				</Box>
				<Box sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 14 }}>
					{items.map((item) => (
						<Box key={item.id} component="span" sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
							<span>{item.name}</span>
							<b>{inr(item.price)}</b>
						</Box>
					))}
					{isHome ? (
						<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', color: DESK.muted }}>
							<span>Home sample collection</span>
							<Box component="b" sx={{ color: DESK.success }}>
								Free
							</Box>
						</Box>
					) : null}
				</Box>
			</Box>
		</Box>
	)
}
