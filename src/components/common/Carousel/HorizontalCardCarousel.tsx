// src/components/common/Carousel/HorizontalCardCarousel.tsx
import { useEffect, useRef, useState, useCallback, ReactNode, Children } from 'react'
import { Box, IconButton } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

interface HorizontalCardCarouselProps {
	children: ReactNode
	gap?: number
	showProgressBar?: boolean
	ariaLabel?: string
}

export default function HorizontalCardCarousel({
	children,
	gap = 2,
	showProgressBar = true,
	ariaLabel = 'carousel',
}: HorizontalCardCarouselProps) {
	const scrollRef = useRef<HTMLDivElement | null>(null)
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)
	const [progress, setProgress] = useState({ segment: 1, offset: 0 })

	const updateScrollState = useCallback(() => {
		const el = scrollRef.current
		if (!el) return
		const { scrollLeft, scrollWidth, clientWidth } = el
		const maxScroll = scrollWidth - clientWidth
		setCanScrollLeft(scrollLeft > 4)
		setCanScrollRight(scrollLeft < maxScroll - 4)

		if (maxScroll <= 0) {
			setProgress({ segment: 1, offset: 0 })
		} else {
			const segment = Math.max(clientWidth / scrollWidth, 0.12)
			const offset = (scrollLeft / maxScroll) * (1 - segment)
			setProgress({ segment, offset })
		}
	}, [])

	useEffect(() => {
		updateScrollState()
		const el = scrollRef.current
		if (!el) return
		const observer = new ResizeObserver(updateScrollState)
		observer.observe(el)
		return () => observer.disconnect()
	}, [updateScrollState, children])

	const scrollByAmount = (direction: 'left' | 'right') => {
		const el = scrollRef.current
		if (!el) return
		const amount = el.clientWidth * 0.8
		el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
	}

	const childArray = Children.toArray(children)

	return (
		<Box sx={{ position: 'relative' }}>
			{canScrollLeft && (
				<IconButton
					aria-label={`scroll ${ariaLabel} left`}
					onClick={() => scrollByAmount('left')}
					sx={{
						display: { xs: 'none', sm: 'flex' },
						position: 'absolute',
						left: -18,
						top: '50%',
						transform: 'translateY(-50%)',
						zIndex: 2,
						bgcolor: 'background.paper',
						boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
						'&:hover': { bgcolor: 'background.paper' },
					}}
					size="small"
				>
					<ChevronLeftIcon fontSize="small" />
				</IconButton>
			)}

			{canScrollRight && (
				<IconButton
					aria-label={`scroll ${ariaLabel} right`}
					onClick={() => scrollByAmount('right')}
					sx={{
						display: { xs: 'none', sm: 'flex' },
						position: 'absolute',
						right: -18,
						top: '50%',
						transform: 'translateY(-50%)',
						zIndex: 2,
						bgcolor: 'background.paper',
						boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
						'&:hover': { bgcolor: 'background.paper' },
					}}
					size="small"
				>
					<ChevronRightIcon fontSize="small" />
				</IconButton>
			)}

			<Box
				ref={scrollRef}
				onScroll={updateScrollState}
				role="list"
				aria-label={ariaLabel}
				sx={{
					display: 'flex',
					gap,
					overflowX: 'auto',
					scrollSnapType: 'x proximity',
					scrollBehavior: 'smooth',
					WebkitOverflowScrolling: 'touch',
					'&::-webkit-scrollbar': { display: 'none' },
					scrollbarWidth: 'none',
					px: 0.5,
					py: 0.5,
				}}
			>
				{childArray.map((child, idx) => (
					<Box key={idx} role="listitem" sx={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
						{child}
					</Box>
				))}
			</Box>

			{showProgressBar && progress.segment < 1 && (
				<Box sx={{ mt: 1.5, height: 4, borderRadius: '4px', bgcolor: 'divider', position: 'relative', overflow: 'hidden' }}>
					<Box
						sx={{
							position: 'absolute',
							top: 0,
							bottom: 0,
							left: `${progress.offset * 100}%`,
							width: `${progress.segment * 100}%`,
							bgcolor: 'primary.main',
							borderRadius: '4px',
							transition: 'left 0.15s ease',
						}}
					/>
				</Box>
			)}
		</Box>
	)
}
