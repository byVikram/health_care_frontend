// src/components/common/Carousel/DashboardCarousel.tsx
//
// The web counterpart of the native app's AppCarousel (Home "Offers" banner): one full-width slide at a time that slides in, pill page dots (the active
// one 20px wide in the primary teal), and optional auto-play (the native design: every 4500 ms) that loops endlessly and pauses while the mouse is over
// the banner or a slide has focus. Give it `images` (the original use) or `slides` (any content, e.g. promo cards); a single slide shows no dots.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Box } from '@mui/material'

type Props = {
	/** Image slides (the original use). */
	images?: string[]
	/** Any content as slides: each is stretched to the banner's size. Wins over `images` when both are given. */
	slides?: ReactNode[]
	/** The banner's height in px. */
	height?: number
	/** How an image fills its slide. */
	fit?: 'cover' | 'contain'
	/** Advance by itself every `autoPlayInterval` ms, looping from the last slide to the first. */
	autoPlay?: boolean
	autoPlayInterval?: number
	/** Said by screen readers for the whole carousel ("Offers"). */
	ariaLabel?: string
	/** Rounded corners of the banner (the slides use their own when they are cards: pass 0). */
	radius?: number
}

const PRIMARY = '#2B6F71'

export default function DashboardCarousel({ images = [], slides, height = 300, fit = 'contain', autoPlay = false, autoPlayInterval = 4500, ariaLabel = 'carousel', radius = 16 }: Props) {
	const items: ReactNode[] = slides ?? images.map((src, i) => <img key={src + i} src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, objectPosition: 'center', display: 'block' }} />)
	const count = items.length

	const [current, setCurrent] = useState(0)
	const [prev, setPrev] = useState<number | null>(null)
	const [direction, setDirection] = useState<'left' | 'right'>('left')
	const [animating, setAnimating] = useState(false)
	const [paused, setPaused] = useState(false)
	const currentRef = useRef(current)
	const animatingRef = useRef(animating)

	useEffect(() => {
		currentRef.current = current
	}, [current])
	useEffect(() => {
		animatingRef.current = animating
	}, [animating])

	const goTo = useCallback((index: number, dir: 'left' | 'right') => {
		if (animatingRef.current || index === currentRef.current) return
		setDirection(dir)
		setPrev(currentRef.current)
		setCurrent(index)
		setAnimating(true)
	}, [])

	// the slide-in lasts 0.42 s; then the old slide is dropped
	useEffect(() => {
		if (!animating) return
		const t = setTimeout(() => {
			setAnimating(false)
			setPrev(null)
		}, 450)
		return () => clearTimeout(t)
	}, [animating])

	// auto-play: next slide, looping; stopped while hovered / focused and when there is nothing to slide to
	useEffect(() => {
		if (!autoPlay || paused || count < 2) return
		const id = setInterval(() => goTo((currentRef.current + 1) % count, 'left'), autoPlayInterval)
		return () => clearInterval(id)
	}, [autoPlay, autoPlayInterval, paused, count, goTo])

	if (count === 0) return null
	const shown = Math.min(current, count - 1)

	const inKeyframe = direction === 'left' ? 'slideInRight' : 'slideInLeft'
	const outKeyframe = direction === 'left' ? 'slideOutLeft' : 'slideOutRight'
	const slideSx = (isOut: boolean) => ({
		position: 'absolute' as const,
		inset: 0,
		width: '100%',
		height: '100%',
		animation: isOut ? `${outKeyframe} 0.42s cubic-bezier(0.4,0,0.2,1) forwards` : animating ? `${inKeyframe} 0.42s cubic-bezier(0.4,0,0.2,1) forwards` : 'none',
	})

	return (
		<Box
			role="region"
			aria-roledescription="carousel"
			aria-label={ariaLabel}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocusCapture={() => setPaused(true)}
			onBlurCapture={() => setPaused(false)}
			sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
		>
			<style>{`
        @keyframes slideInRight  { from { transform: translateX(100%); }  to { transform: translateX(0); } }
        @keyframes slideInLeft   { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes slideOutLeft  { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%);  } }
      `}</style>

			<Box sx={{ borderRadius: `${radius}px`, overflow: 'hidden', width: '100%', height: `${height}px`, position: 'relative', ...(slides ? {} : { bgcolor: '#f0f4f4' }) }}>
				{animating && prev !== null && prev < count ? (
					<Box aria-hidden="true" sx={slideSx(true)}>
						{items[prev]}
					</Box>
				) : null}
				<Box key={shown} aria-label={`Slide ${shown + 1} of ${count}`} aria-live={autoPlay ? 'off' : 'polite'} sx={slideSx(false)}>
					{items[shown]}
				</Box>
			</Box>

			{/* Dots */}
			{count > 1 ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
					{items.map((_, i) => (
						<Box
							key={i}
							component="button"
							type="button"
							aria-label={`Go to slide ${i + 1}`}
							aria-current={i === shown}
							onClick={() => goTo(i, i > shown ? 'left' : 'right')}
							sx={{
								p: 0,
								border: 0,
								width: i === shown ? 20 : 10,
								height: 10,
								borderRadius: '5px',
								bgcolor: i === shown ? PRIMARY : '#d0d0d0',
								cursor: 'pointer',
								transition: 'all 0.3s ease',
							}}
						/>
					))}
				</Box>
			) : null}
		</Box>
	)
}
