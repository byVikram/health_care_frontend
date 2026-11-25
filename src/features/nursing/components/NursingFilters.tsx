// src/features/nursing/components/NursingFilters.tsx
//
// The filter card on the left of the browse page: "Show" (All / Packages / Procedures) and "Care for" (the server's categories, one chosen at a
// time, each with the number of procedures it holds). Same card as the Lab tests filters.
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK } from '../../../styles/deskTokens'
import { BOOKING_CARD } from '../../booking/bookingStyles'
import { CATEGORY_TINTS, NURSING_TYPES, iconFor, type NursingTypeId } from '../nursingConstants'
import type { NursingCategory } from '../nursingService'

interface NursingFiltersProps {
	type: NursingTypeId
	onType: (type: NursingTypeId) => void
	/** Items per type ('' hides the count). */
	typeCounts: Record<NursingTypeId, string>
	categories: NursingCategory[]
	categoryId: string | null
	onCategory: (id: string | null) => void
	categoryCounts: Record<string, number>
	hasFilters: boolean
	onClear: () => void
}

const legendSx = { p: 0, mb: '10px', fontSize: 14, fontWeight: 800 } as const
const groupSx = { m: 0, p: '14px 0', border: 0, borderTop: `1px solid ${DESK.lineSoft}`, minWidth: 0 } as const

export default function NursingFilters({ type, onType, typeCounts, categories, categoryId, onCategory, categoryCounts, hasFilters, onClear }: NursingFiltersProps) {
	return (
		<Box component="aside" aria-label="Filters" sx={{ ...BOOKING_CARD, position: { lg: 'sticky' }, top: 20, width: { xs: '100%', lg: 260 }, flexShrink: 0, p: '6px 18px 12px', boxSizing: 'border-box' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', py: '12px' }}>
				<Box component="b" sx={{ flexGrow: 1, fontSize: 17 }}>
					Filters
				</Box>
				{hasFilters ? (
					<Box
						component="button"
						type="button"
						onClick={onClear}
						sx={{ border: 0, p: 0, bgcolor: 'transparent', color: DESK.primary, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
					>
						Clear all
					</Box>
				) : null}
			</Box>
			<Box component="fieldset" sx={groupSx}>
				<Box component="legend" sx={legendSx}>
					Show
				</Box>
				<Box role="radiogroup" aria-label="Show" sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
					{NURSING_TYPES.map((t) => {
						const on = type === t.id
						return (
							<Box
								key={t.id}
								component="button"
								type="button"
								role="radio"
								aria-checked={on}
								onClick={() => onType(t.id)}
								sx={{
									height: 40,
									px: '10px',
									borderRadius: '10px',
									border: `1.5px solid ${on ? DESK.primary : 'transparent'}`,
									bgcolor: on ? DESK.primaryTint : DESK.raised,
									color: DESK.ink,
									fontFamily: 'inherit',
									fontSize: 14,
									fontWeight: on ? 800 : 600,
									display: 'flex',
									alignItems: 'center',
									gap: '10px',
									cursor: 'pointer',
								}}
							>
								<Box component="span" sx={{ display: 'flex', color: DESK.primary }}>
									<DeskIcon d={t.icon} size={17} />
								</Box>
								<Box component="span" sx={{ flexGrow: 1, textAlign: 'left' }}>
									{t.label}
								</Box>
								<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
									{typeCounts[t.id]}
								</Box>
							</Box>
						)
					})}
				</Box>
			</Box>
			{categories.length > 0 ? (
				<Box component="fieldset" sx={{ ...groupSx, pb: '6px' }}>
					<Box component="legend" sx={legendSx}>
						Care for
					</Box>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
						{categories.map((c, index) => {
							const tint = CATEGORY_TINTS[index % CATEGORY_TINTS.length]
							return (
								<Box
									key={c.id}
									component="label"
									sx={{ minHeight: 38, p: '6px', m: '0 -6px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: 14, lineHeight: '19px', textAlign: 'left', cursor: 'pointer', '&:hover': { bgcolor: DESK.page } }}
								>
									<Box
										component="input"
										type="checkbox"
										checked={categoryId === c.id}
										onChange={() => onCategory(categoryId === c.id ? null : c.id)}
										sx={{ width: 18, height: 18, m: 0, flexShrink: 0, accentColor: DESK.primary }}
									/>
									<Box component="span" sx={{ width: 26, height: 26, flexShrink: 0, borderRadius: '8px', bgcolor: tint.bg, color: tint.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
										<DeskIcon d={iconFor(c.label)} size={15} />
									</Box>
									<Box component="span" sx={{ flexGrow: 1, minWidth: 0 }}>
										{c.label}
									</Box>
									<Box component="span" sx={{ flexShrink: 0, minWidth: 14, textAlign: 'right', fontSize: 12, color: DESK.muted }}>
										{categoryCounts[c.id] ? categoryCounts[c.id] : ''}
									</Box>
								</Box>
							)
						})}
					</Box>
				</Box>
			) : null}
		</Box>
	)
}
