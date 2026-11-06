// src/features/doctor/components/AppointmentActionMenu.tsx
//
// The "More" (three dots) menu of an accepted appointment on the doctor's list: Reschedule / No-show / Cancel.
// It opens right below the button as a small floating card, laid out the way the Paramedicals menu on the portal page is: a Popper
// with a Grow animation over a frosted white Paper, the items side by side (icon above its label) fading up one after the other.
// Each item only reports the choice; the page opens the matching confirmation. A disabled item says why in a line under the items
// (a tooltip alone is never seen on a touch screen). The focus moves into the menu when it opens and back to its button when it closes.

import { useEffect, useRef, type ReactNode } from 'react'
import { Box, ClickAwayListener, Grow, keyframes, Paper, Popper, Tooltip, Typography } from '@mui/material'
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined'
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'

const BLUE = '#2463A8'
const SAND = '#8A5300'
const DANGER = '#B42318'

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

interface Props {
	/** The button the menu hangs from; the menu is open while this is set. */
	anchorEl: HTMLElement | null
	onClose: () => void
	/** The doctor can still ask the patient to reschedule (not once the patient has checked in). */
	rescheduleCanAsk: boolean
	/** The no-show window is open. */
	noShowCanMark: boolean
	/** Why it is not open ("Can be marked 1 hour after the start"); shown as the disabled item's tooltip. */
	noShowHint: string
	onReschedule: () => void
	onNoShow: () => void
	onCancel: () => void
}

type Item = {
	key: string
	label: string
	icon: ReactNode
	ink: string
	onClick: () => void
	hint?: string
}

function MenuItem({ item, index }: { item: Item; index: number }) {
	const disabled = Boolean(item.hint)
	return (
		<Tooltip title={item.hint ?? ''} placement="bottom" arrow disableHoverListener={!disabled}>
			<Box
				role="button"
				tabIndex={disabled ? -1 : 0}
				aria-disabled={disabled}
				aria-label={item.label}
				onClick={() => {
					if (!disabled) item.onClick()
				}}
				onKeyDown={(e) => {
					if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
						e.preventDefault()
						item.onClick()
					}
				}}
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 0.4,
					px: 0.5,
					minWidth: 52,
					cursor: disabled ? 'not-allowed' : 'pointer',
					opacity: 0,
					animation: `${fadeInUp} 0.4s ease forwards`,
					animationDelay: `${index * 60}ms`,
					transition: 'transform 0.2s ease',
					...(disabled ? { filter: 'grayscale(1)' } : { '&:hover': { transform: 'scale(1.05)' } }),
					'&:focus-visible': { outline: '2px solid #0c7c7c', outlineOffset: 2, borderRadius: '8px' },
					// the faded-in state is the item's resting state, so the disabled dimming has to come after the animation
					...(disabled ? { animationName: 'none', opacity: 0.5 } : {}),
				}}
			>
				<Box
					sx={{
						width: 26,
						height: 26,
						color: item.ink,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{item.icon}
				</Box>
				<Typography
					sx={{
						fontSize: '10px',
						fontWeight: 600,
						color: 'text.primary',
						textAlign: 'center',
						whiteSpace: 'nowrap',
					}}
				>
					{item.label}
				</Typography>
			</Box>
		</Tooltip>
	)
}

export default function AppointmentActionMenu({
	anchorEl,
	onClose,
	rescheduleCanAsk,
	noShowCanMark,
	noShowHint,
	onReschedule,
	onNoShow,
	onCancel,
}: Props) {
	const open = Boolean(anchorEl)
	const menuRef = useRef<HTMLDivElement | null>(null)
	const lastAnchor = useRef<HTMLElement | null>(null)

	// The first available item takes the focus when the menu opens; the button it hangs from gets it back when it closes.
	useEffect(() => {
		if (open) {
			lastAnchor.current = anchorEl
			const timer = window.setTimeout(() => {
				menuRef.current?.querySelector<HTMLElement>('[role="button"]:not([aria-disabled="true"])')?.focus()
			}, 0)
			return () => window.clearTimeout(timer)
		}
		lastAnchor.current?.focus()
		lastAnchor.current = null
	}, [open, anchorEl])

	// Escape closes it, like any menu.
	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [open, onClose])

	const items: Item[] = [
		{
			key: 'reschedule',
			label: 'Reschedule',
			icon: <EventRepeatOutlinedIcon sx={{ fontSize: 22 }} />,
			ink: BLUE,
			onClick: onReschedule,
			hint: rescheduleCanAsk ? undefined : 'Not possible once the patient has checked in',
		},
		{
			key: 'no-show',
			label: 'No-show',
			icon: <PersonOffOutlinedIcon sx={{ fontSize: 22 }} />,
			ink: SAND,
			onClick: onNoShow,
			hint: noShowCanMark ? undefined : noShowHint || 'Not available now',
		},
		{
			key: 'cancel',
			label: 'Cancel',
			icon: <EventBusyOutlinedIcon sx={{ fontSize: 22 }} />,
			ink: DANGER,
			onClick: onCancel,
		},
	]

	return (
		<Popper
			open={open}
			anchorEl={anchorEl}
			transition
			placement="bottom-end"
			modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
			sx={{ zIndex: 1300 }}
		>
			{({ TransitionProps }) => (
				<Grow {...TransitionProps} timeout={200} style={{ transformOrigin: 'top right' }}>
					<Paper
						elevation={0}
						sx={{
							p: 1.25,
							borderRadius: '8px',
							display: 'flex',
							gap: 1,
							background: 'rgba(255, 255, 255, 0.8)',
							backdropFilter: 'blur(200px)',
							WebkitBackdropFilter: 'blur(20px)',
							boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.2)',
						}}
					>
						{/* A click on the button itself is the button's own toggle, so it is not an "outside" click. */}
						<ClickAwayListener
							onClickAway={(e) => {
								if (anchorEl?.contains(e.target as Node)) return
								onClose()
							}}
						>
							<Box ref={menuRef} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
								<Box sx={{ display: 'flex', gap: 1 }}>
									{items.map((item, index) => (
										<MenuItem key={item.key} item={item} index={index} />
									))}
								</Box>
								{items
									.filter((item) => item.hint)
									.map((item) => (
										<Typography
											key={item.key}
											sx={{ fontSize: '10px', color: 'text.secondary', maxWidth: 190 }}
										>
											{item.label}: {item.hint}
										</Typography>
									))}
							</Box>
						</ClickAwayListener>
					</Paper>
				</Grow>
			)}
		</Popper>
	)
}
