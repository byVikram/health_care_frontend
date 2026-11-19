// src/features/lab/components/LabFilters.tsx
//
// The filter card on the left of the browse page: "Show" (All / Packages / Single tests) and the health concerns, each with a count of
// what is loaded.
import { Box } from '@mui/material'
import DeskIcon from '../../../components/common/Icon/DeskIcon'
import { DESK } from '../../../styles/deskTokens'
import { LAB_CONCERNS, LAB_TYPES, type LabTypeId } from '../labConstants'
import { LAB_CARD } from '../labStyles'

interface LabFiltersProps {
	type: LabTypeId
	onType: (type: LabTypeId) => void
	/** Items loaded per kind ('' hides the count). */
	typeCounts: Record<LabTypeId, string>
	concerns: string[]
	onToggleConcern: (id: string) => void
	concernCounts: Record<string, number>
	hasFilters: boolean
	onClear: () => void
}

const legendSx = { p: 0, mb: '10px', fontSize: 14, fontWeight: 800 } as const
const groupSx = { m: 0, p: '14px 0', border: 0, borderTop: `1px solid ${DESK.lineSoft}`, minWidth: 0 } as const

export default function LabFilters({
	type,
	onType,
	typeCounts,
	concerns,
	onToggleConcern,
	concernCounts,
	hasFilters,
	onClear,
}: LabFiltersProps) {
	return (
		<Box
			component="aside"
			aria-label="Filters"
			sx={{
				...LAB_CARD,
				position: 'sticky',
				top: 20,
				width: 260,
				flexShrink: 0,
				p: '6px 18px 12px',
				boxSizing: 'border-box',
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', py: '12px' }}>
				<Box component="b" sx={{ flexGrow: 1, fontSize: 17 }}>
					Filters
				</Box>
				{hasFilters ? (
					<Box
						component="button"
						type="button"
						onClick={onClear}
						sx={{
							border: 0,
							p: 0,
							bgcolor: 'transparent',
							color: DESK.primary,
							fontFamily: 'inherit',
							fontSize: 14,
							fontWeight: 800,
							cursor: 'pointer',
						}}
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
					{LAB_TYPES.map((t) => {
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
			<Box component="fieldset" sx={{ ...groupSx, pb: '6px' }}>
				<Box component="legend" sx={legendSx}>
					Health concern
				</Box>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
					{LAB_CONCERNS.map((c) => (
						<Box
							key={c.id}
							component="label"
							sx={{
								height: 38,
								p: '0 6px',
								m: '0 -6px',
								borderRadius: '8px',
								display: 'flex',
								alignItems: 'center',
								gap: '10px',
								fontSize: 14,
								cursor: 'pointer',
								'&:hover': { bgcolor: DESK.page },
							}}
						>
							<Box
								component="input"
								type="checkbox"
								checked={concerns.includes(c.id)}
								onChange={() => onToggleConcern(c.id)}
								sx={{ width: 18, height: 18, m: 0, accentColor: DESK.primary }}
							/>
							<Box
								component="span"
								sx={{
									width: 26,
									height: 26,
									borderRadius: '8px',
									bgcolor: c.bg,
									color: c.ink,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<DeskIcon d={c.icon} size={15} />
							</Box>
							<Box component="span" sx={{ flexGrow: 1, minWidth: 0 }}>
								{c.label}
							</Box>
							<Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>
								{concernCounts[c.id] ? concernCounts[c.id] : ''}
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	)
}
