import { useState, useEffect, useRef, useCallback } from 'react'
import { Box } from '@mui/material'

type Props = {
  images: string[]
  height?: number
  fit?: 'cover' | 'contain'
}

export default function DashboardCarousel({ images, height = 300, fit = 'contain' }: Props) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [direction, setDirection] = useState<'left' | 'right'>('left')
  const [animating, setAnimating] = useState(false)
  const currentRef = useRef(current)
  const animatingRef = useRef(animating)

  useEffect(() => { currentRef.current = current }, [current])
  useEffect(() => { animatingRef.current = animating }, [animating])

  const goTo = useCallback((index: number, dir: 'left' | 'right') => {
    if (animatingRef.current || index === currentRef.current) return
    setDirection(dir)
    setPrev(currentRef.current)
    setCurrent(index)
    setAnimating(true)
  }, [])

  useEffect(() => {
    if (!animating) return
    const t = setTimeout(() => {
      setAnimating(false)
      setPrev(null)
    }, 450)
    return () => clearTimeout(t)
  }, [animating])

  const inKeyframe  = direction === 'left' ? 'slideInRight' : 'slideInLeft'
  const outKeyframe = direction === 'left' ? 'slideOutLeft' : 'slideOutRight'

  const imgStyle = (isOut: boolean): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: fit,
    objectPosition: 'center',
    display: 'block',
    animation: isOut
      ? `${outKeyframe} 0.42s cubic-bezier(0.4,0,0.2,1) forwards`
      : animating
        ? `${inKeyframe} 0.42s cubic-bezier(0.4,0,0.2,1) forwards`
        : 'none',
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <style>{`
        @keyframes slideInRight  { from { transform: translateX(100%); }  to { transform: translateX(0); } }
        @keyframes slideInLeft   { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes slideOutLeft  { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%);  } }
      `}</style>

      <Box
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          width: '100%',
          height: `${height}px`,
          position: 'relative',
          bgcolor: '#f0f4f4',
        }}
      >
        {animating && prev !== null && (
          <img src={images[prev]} alt="carousel-out" style={imgStyle(true)} />
        )}
        <img key={current} src={images[current]} alt="carousel" style={imgStyle(false)} />
      </Box>

      {/* Dots */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        {images.map((_, i) => (
          <Box
            key={i}
            onClick={() => goTo(i, i > current ? 'left' : 'right')}
            sx={{
              width: i === current ? 20 : 10,
              height: 10,
              borderRadius: '5px',
              bgcolor: i === current ? '#0c7c7c' : '#d0d0d0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  )
}
