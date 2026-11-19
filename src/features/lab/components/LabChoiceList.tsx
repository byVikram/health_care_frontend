// src/features/lab/components/LabChoiceList.tsx
//
// The labs that can do the whole cart at the chosen address, cheapest first, each with its logo, report time, distance (a lab visit) and
// the total it charges for the cart. Picking one decides whose slots are listed in step 3 and which prices the booking carries.
import { Box } from '@mui/material'
import { DESK, DESK_TONES } from '../../../styles/deskTokens'
import { inr } from '../labFormat'
import type { ApiQuoteLab } from '../labService'
import { choiceSx } from '../labStyles'
import { LabRadioDot } from './LabCartSection'
import LabLogo from './LabLogo'

interface LabChoiceListProps {
	labs: ApiQuoteLab[]
	labId: number | null
	onPick: (lab: ApiQuoteLab) => void
	isHome: boolean
	logos: Record<number, string>
	distances: Record<number, number>
}

function Tag({ label, bg, fg }: { label: string; bg: string; fg: string }) {
	return (
		<Box component="span" sx={{ p: '2px 8px', borderRadius: '6px', bgcolor: bg, color: fg, fontSize: 11, fontWeight: 800 }}>
			{label}
		</Box>
	)
}

export default function LabChoiceList({ labs, labId, onPick, isHome, logos, distances }: LabChoiceListProps) {
	if (labs.length === 0) return null
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
			<Box component="span" sx={{ fontSize: 14, fontWeight: 800 }}>
				{isHome ? 'Sample collected by' : 'Choose a lab near you'}
				{labs.length > 1 ? ' · cheapest first' : ''}
			</Box>
			<Box role="radiogroup" aria-label="Lab" sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				{labs.map((lab) => {
					const on = lab.lab_id === labId
					const total = Number(lab.total)
					const mrp = Number(lab.total_mrp)
					const km = distances[lab.lab_id]
					return (
						<Box
							key={lab.lab_id}
							component="button"
							type="button"
							role="radio"
							aria-checked={on}
							onClick={() => onPick(lab)}
							sx={{ ...choiceSx(on), p: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}
						>
							<LabLogo url={lab.logo_url ?? logos[lab.lab_id]} />
							<Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
								<Box component="b" sx={{ fontSize: 15 }}>
									{lab.lab_name ?? 'Lab'}
								</Box>
								<Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
									{lab.tat_hours != null ? <Tag label={`Reports in ${lab.tat_hours} hrs`} bg={DESK_TONES.move.bg} fg={DESK_TONES.move.fg} /> : null}
									{!isHome && km != null ? <Tag label={`${km.toFixed(1)} km away`} bg={DESK_TONES.done.bg} fg={DESK_TONES.done.fg} /> : null}
								</Box>
							</Box>
							<Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
								<Box component="b" sx={{ fontSize: 16 }}>
									{inr(total)}
								</Box>
								{mrp > total ? (
									<Box component="s" sx={{ fontSize: 12, color: DESK.faint }}>
										{inr(mrp)}
									</Box>
								) : null}
							</Box>
							<LabRadioDot on={on} size={20} />
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}
