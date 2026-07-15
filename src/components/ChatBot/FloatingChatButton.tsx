import React, { useState, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import chatbotIcon from '../../assets/Banner/aichatbot.png'

interface FloatingChatButtonProps {
	onClick: () => void
	visible: boolean
}

export default function FloatingChatButton({ onClick, visible }: FloatingChatButtonProps) {
	const buttonRef = useRef<HTMLDivElement>(null)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const dragStart = useRef({ x: 0, y: 0 })
	const pointerStart = useRef({ x: 0, y: 0 })
	const hasDragged = useRef(false)

	// Initial position bottom-right
	useEffect(() => {
		const padding = 24
		const buttonSize = 72 // 72x72px is standard and fits the logo well
		setPosition({
			x: window.innerWidth - buttonSize - padding,
			y: window.innerHeight - buttonSize - padding,
		})
	}, [])

	// Handle screen resize to keep button in viewport
	useEffect(() => {
		const handleResize = () => {
			const padding = 24
			const buttonSize = 72
			setPosition((prev) => {
				const newX = prev.x > window.innerWidth / 2 
					? window.innerWidth - buttonSize - padding 
					: padding
				const newY = Math.max(
					padding, 
					Math.min(prev.y, window.innerHeight - buttonSize - padding)
				)
				return { x: newX, y: newY }
			})
		}
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		e.currentTarget.setPointerCapture(e.pointerId)
		setIsDragging(true)
		dragStart.current = { x: position.x, y: position.y }
		pointerStart.current = { x: e.clientX, y: e.clientY }
		hasDragged.current = false
	}

	const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!isDragging) return
		const dx = e.clientX - pointerStart.current.x
		const dy = e.clientY - pointerStart.current.y
		if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
			hasDragged.current = true
		}

		const buttonSize = 72
		const padding = 16

		// Calculate new position with boundary checks
		const newX = Math.max(padding, Math.min(dragStart.current.x + dx, window.innerWidth - buttonSize - padding))
		const newY = Math.max(padding, Math.min(dragStart.current.y + dy, window.innerHeight - buttonSize - padding))

		setPosition({ x: newX, y: newY })
	}

	const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!isDragging) return
		e.currentTarget.releasePointerCapture(e.pointerId)
		setIsDragging(false)

		if (!hasDragged.current) {
			onClick()
			return
		}

		// Snap to nearest edge
		const buttonSize = 72
		const padding = 24
		const midPoint = window.innerWidth / 2
		const currentCenterX = position.x + buttonSize / 2

		const snapX = currentCenterX < midPoint 
			? padding 
			: window.innerWidth - buttonSize - padding

		setPosition((prev) => ({
			x: snapX,
			y: prev.y,
		}))
	}

	if (!visible) return null

	return (
		<Box
			ref={buttonRef}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			sx={{
				position: 'fixed',
				left: position.x,
				top: position.y,
				width: 72,
				height: 72,
				zIndex: 9999,
				cursor: isDragging ? 'grabbing' : 'pointer',
				touchAction: 'none',
				userSelect: 'none',
				// Smooth transitions when not dragging
				transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				'&:hover img': {
					transform: 'scale(1.08)',
					boxShadow: '0 8px 24px rgba(43, 111, 113, 0.35)', // primary main shadow glow
				},
				'&:active img': {
					transform: 'scale(0.95)',
				}
			}}
		>
			<Box
				component="img"
				src={chatbotIcon}
				alt="CareAI"
				draggable={false}
				sx={{
					width: '100%',
					height: '100%',
					borderRadius: '16px',
					transition: 'transform 0.2s, box-shadow 0.2s',
					boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
					pointerEvents: 'none',
				}}
			/>
		</Box>
	)
}
