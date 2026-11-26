// src/features/legal/LegalAccordionPage.tsx
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, ButtonBase, Collapse, Container, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ROUTES } from '../../constants/routes'
import { DESK } from '../../styles/deskTokens'

export type LegalSection = {
	title: string
	summary: string
	/** Full text shown when the section is open. */
	body?: string
}

type Props = {
	title: string
	sections: LegalSection[]
	related?: { label: string; to: string }
	/** Indexes of the sections open on first render. */
	defaultOpen?: number[]
	/** Background colour of the page body. */
	bodyBg?: string
	/** Middle crumb between Home and the title, e.g. "Legal". */
	breadcrumbParent?: string
	/** Line under the title. */
	subtitle?: string
}

const PLACEHOLDER_BODY = '[Full legal text for this section, from your legal team]'

export default function LegalAccordionPage({
	title,
	sections,
	related,
	defaultOpen = [],
	bodyBg = '#fff',
	breadcrumbParent,
	subtitle = 'Last updated [date] · Applies to patients, doctors and care providers',
}: Props) {
	const [open, setOpen] = useState<number[]>(defaultOpen)
	const allOpen = open.length === sections.length

	const toggle = (index: number) => {
		setOpen((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
	}

	const toggleAll = () => {
		setOpen(allOpen ? [] : sections.map((_, i) => i))
	}

	return (
		<Box sx={{ bgcolor: bodyBg }}>
			{/* Title band */}
			<Box
				sx={{
					background: `linear-gradient(180deg, ${DESK.primarySoft} 0%, ${DESK.primaryTint} 100%)`,
					borderBottom: `1px solid ${DESK.lineSoft}`,
					py: { xs: 3, md: 4 },
				}}
			>
				<Container maxWidth="lg">
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 14, color: DESK.muted, mb: 2 }}>
						<Box
							component={RouterLink}
							to={ROUTES.ROOT}
							sx={{ color: DESK.primary, fontWeight: 600, textDecoration: 'none' }}
						>
							Home
						</Box>
						<span>/</span>
						{breadcrumbParent && (
							<>
								<span>{breadcrumbParent}</span>
								<span>/</span>
							</>
						)}
						<span>{title}</span>
					</Box>
					<Typography
						variant="h3"
						component="h1"
						sx={{ fontWeight: 800, color: DESK.ink, fontSize: { xs: 30, md: 40 } }}
					>
						{title}
					</Typography>
					<Typography sx={{ color: DESK.muted, mt: 1 }}>{subtitle}</Typography>
				</Container>
			</Box>

			{/* Accordion */}
			<Container maxWidth="md" sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 3, md: 4 } }}>
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
					<ButtonBase
						onClick={toggleAll}
						sx={{
							px: 2.5,
							py: 1.25,
							borderRadius: '12px',
							border: `1px solid ${DESK.lineStrong}`,
							bgcolor: DESK.raised,
							color: DESK.ink,
							fontWeight: 700,
							fontSize: 15,
						}}
					>
						{allOpen ? 'Collapse all' : 'Expand all'}
					</ButtonBase>
				</Box>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{sections.map((section, index) => {
						const isOpen = open.includes(index)
						return (
							<Box
								key={section.title}
								sx={{
									bgcolor: DESK.raised,
									borderRadius: '16px',
									border: `1px solid ${isOpen ? DESK.primary : DESK.lineSoft}`,
									overflow: 'hidden',
								}}
							>
								<ButtonBase
									onClick={() => toggle(index)}
									aria-expanded={isOpen}
									sx={{
										width: '100%',
										display: 'flex',
										alignItems: 'center',
										gap: 2,
										px: 3,
										py: 2,
										textAlign: 'left',
									}}
								>
									<Box
										sx={{
											flexShrink: 0,
											width: 38,
											height: 38,
											borderRadius: '10px',
											bgcolor: DESK.primarySoft,
											color: DESK.primary,
											display: 'grid',
											placeItems: 'center',
											fontWeight: 700,
										}}
									>
										{index + 1}
									</Box>
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Typography sx={{ fontWeight: 700, fontSize: 18, color: DESK.ink }}>
											{section.title}
										</Typography>
										<Typography sx={{ color: DESK.muted, fontSize: 15 }}>
											{section.summary}
										</Typography>
									</Box>
									<ExpandMoreIcon
										sx={{
											color: DESK.primary,
											transition: 'transform .2s',
											transform: isOpen ? 'rotate(180deg)' : 'none',
										}}
									/>
								</ButtonBase>
								<Collapse in={isOpen} unmountOnExit>
									<Box sx={{ px: 3, pb: 3, pl: { xs: 3, sm: '78px' } }}>
										<Box
											sx={{
												bgcolor: DESK.page,
												borderRadius: '10px',
												px: 2.5,
												py: 2,
												color: DESK.inkSoft,
											}}
										>
											{section.body ?? PLACEHOLDER_BODY}
										</Box>
									</Box>
								</Collapse>
							</Box>
						)
					})}
				</Box>

				{/* Help card */}
				<Box
					sx={{
						mt: 4,
						p: 3,
						borderRadius: '16px',
						bgcolor: DESK.primarySoft,
						display: 'flex',
						flexDirection: { xs: 'column', sm: 'row' },
						alignItems: { sm: 'center' },
						justifyContent: 'space-between',
						gap: 2,
					}}
				>
					<Box>
						<Typography sx={{ fontWeight: 800, fontSize: 20, color: DESK.ink }}>
							Still have a question?
						</Typography>
						<Typography sx={{ color: DESK.inkSoft }}>
							{related ? (
								<>
									Read our{' '}
									<Box
										component={RouterLink}
										to={related.to}
										sx={{ color: DESK.primary, fontWeight: 700, textDecoration: 'underline' }}
									>
										{related.label}
									</Box>{' '}
									or talk to support.
								</>
							) : (
								'Talk to support.'
							)}
						</Typography>
					</Box>
					<ButtonBase
						component={RouterLink}
						to={ROUTES.PUBLIC.CONTACT}
						sx={{
							px: 3,
							py: 1.75,
							borderRadius: '12px',
							bgcolor: DESK.primary,
							color: '#fff',
							fontWeight: 700,
							fontSize: 16,
							'&:hover': { bgcolor: DESK.primaryDark },
						}}
					>
						Contact support
					</ButtonBase>
				</Box>
			</Container>
		</Box>
	)
}
