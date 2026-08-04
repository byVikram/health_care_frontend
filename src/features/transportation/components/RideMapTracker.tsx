// src/features/transportation/components/RideMapTracker.tsx
//
// Stylized premium SVG map simulation matching Uber/Ola aesthetics.
// Features:
//   • Beautiful full vector styled streets grid (Koramangala Rd, Outer Ring Rd, HAL Rd).
//   • Dotted/dashed main route path (bold teal suggested road) & alternative paths (grey dashed).
//   • Pulsing blue GPS user dot (Current Location).
//   • Green Map Pin (Pickup) and Red Map Pin (Clinic Destination).
//   • 4 nearby dummy cabs (🚕) pulsing/moving around streets to simulate active Uber/Ola drivers online.
//   • Drag-and-drop pins: User can drag the pickup/dropoff pins on booking page.
//   • Route hiding: Route path hidden during booking phase.

import { useEffect, useState, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'

interface RideMapTrackerProps {
  status: string // 'scheduled' | 'requesting' | 'dispatched' | 'in_transit' | 'completed'
  pickupLabel: string
  dropoffLabel: string
  isBookingMode?: boolean
  onPickupPinDrag?: (newAddress: string) => void
}

export default function RideMapTracker({ status, pickupLabel, dropoffLabel, isBookingMode = false, onPickupPinDrag }: RideMapTrackerProps) {
  const [carPosition, setCarPosition] = useState(0) // percentage along the path
  const containerRef = useRef<HTMLDivElement>(null)

  // Pin coordinate states
  const [pickupCoords, setPickupCoords] = useState({ x: 75, y: 160 })
  const [dropoffCoords, setDropoffCoords] = useState({ x: 330, y: 100 })
  
  // Drag state
  const [draggingPin, setDraggingPin] = useState<'pickup' | 'dropoff' | null>(null)

  useEffect(() => {
    if (status === 'in_transit') {
      const interval = setInterval(() => {
        setCarPosition((prev) => {
          if (prev >= 100) return 0
          return prev + 1.5
        })
      }, 150)
      return () => clearInterval(interval)
    } else if (status === 'completed') {
      setCarPosition(100)
    } else if (status === 'dispatched') {
      setCarPosition(0)
    } else {
      setCarPosition(0)
    }
  }, [status])

  // Mouse drag handlers
  const handleMouseDown = (pin: 'pickup' | 'dropoff') => (e: React.MouseEvent) => {
    if (!isBookingMode) return
    e.preventDefault()
    e.stopPropagation()
    setDraggingPin(pin)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingPin || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    // Calculate raw mouse bounds in pixels relative to container
    const rawX = e.clientX - rect.left
    const rawY = e.clientY - rect.top

    // Keep coordinates within map container bounds
    const newX = Math.max(30, Math.min(rect.width - 30, rawX))
    const newY = Math.max(30, Math.min(rect.height - 30, rawY))

    if (draggingPin === 'pickup') {
      setPickupCoords({ x: newX, y: newY })
    } else {
      setDropoffCoords({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    if (!draggingPin) return
    
    // Resolve address on drop end
    if (draggingPin === 'pickup' && onPickupPinDrag) {
      const { x, y } = pickupCoords
      let address = 'Jayanagar 4th Block, Bengaluru'
      
      // Determine simulated location zones based on drop coordinates
      if (x < 150) {
        address = '123 Indiranagar, Bengaluru'
      } else if (x >= 150 && x < 250) {
        if (y < 120) {
          address = 'MG Road Metro Station, Bengaluru'
        } else {
          address = 'Koramangala 4th Block, Bengaluru'
        }
      } else {
        if (y > 140) {
          address = 'HSR Layout Sector 2, Bengaluru'
        } else {
          address = 'Whitefield IT Park, Bengaluru'
        }
      }
      onPickupPinDrag(address)
    }

    setDraggingPin(null)
  }

  return (
    <Box
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 320,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        border: '1.5px solid',
        borderColor: 'divider',
        bgcolor: '#EBF3F3',
        boxShadow: 'inset 0 4px 20px rgba(12,124,124,0.06)',
        cursor: draggingPin ? 'grabbing' : 'default'
      }}
    >
      {/* ── Visual Map Vector Ground Shapes ── */}
      {/* Lake water body */}
      <Box sx={{ position: 'absolute', top: '-10px', right: '15%', width: '130px', height: '80px', bgcolor: '#CBEBFC', borderRadius: '10px 40px 30px 40px', opacity: 0.8, filter: 'blur(1px)', zIndex: 0 }} />
      {/* National Park block */}
      <Box sx={{ position: 'absolute', bottom: '10%', left: '8%', width: '180px', height: '110px', bgcolor: '#D9ECC8', borderRadius: '30px 20px 40px 10px', opacity: 0.9, filter: 'blur(2px)', zIndex: 0 }} />
      {/* City Forest Block */}
      <Box sx={{ position: 'absolute', top: '40%', right: '8%', width: '110px', height: '90px', bgcolor: '#D9ECC8', borderRadius: '15px 35px 25px 30px', opacity: 0.8, filter: 'blur(1px)', zIndex: 0 }} />

      {/* Lat/Lng grid coordinate grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.025) 1px, transparent 1px)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* ── Uber/Ola Vector Roads Grid ── */}
      {/* Main Highway (Outer Ring Road) */}
      <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 26, bgcolor: '#FFFFFF', borderTop: '2px solid rgba(0,0,0,0.05)', borderBottom: '2px solid rgba(0,0,0,0.05)', transform: 'rotate(-5deg)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: '7.5px', color: 'text.disabled', fontWeight: 800, letterSpacing: '0.1em' }}>OUTER RING ROAD</Typography>
      </Box>

      {/* Indiranagar 100ft Road */}
      <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: '25%', width: 22, bgcolor: '#FFFFFF', borderLeft: '2px solid rgba(0,0,0,0.05)', borderRight: '2px solid rgba(0,0,0,0.05)', transform: 'rotate(15deg)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: '7.5px', color: 'text.disabled', fontWeight: 800, letterSpacing: '0.1em', transform: 'rotate(90deg)', whiteSpace: 'nowrap' }}>INDIRANAGAR 100FT RD</Typography>
      </Box>

      {/* Koramangala 80ft Road */}
      <Box sx={{ position: 'absolute', top: 0, bottom: 0, right: '22%', width: 20, bgcolor: '#FFFFFF', borderLeft: '2px solid rgba(0,0,0,0.05)', borderRight: '2px solid rgba(0,0,0,0.05)', transform: 'rotate(-12deg)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: '7.5px', color: 'text.disabled', fontWeight: 800, letterSpacing: '0.1em', transform: 'rotate(90deg)', whiteSpace: 'nowrap' }}>KORAMANGALA 80FT RD</Typography>
      </Box>

      {/* HAL Hospital Access Link Road */}
      <Box sx={{ position: 'absolute', bottom: '25%', left: '40%', right: '10%', height: 16, bgcolor: '#FFFFFF', borderTop: '1.5px solid rgba(0,0,0,0.04)', borderBottom: '1.5px solid rgba(0,0,0,0.04)', transform: 'rotate(8deg)', zIndex: 1, display: 'flex', alignItems: 'center', px: 2 }}>
        <Typography sx={{ fontSize: '7.5px', color: 'text.disabled', fontWeight: 800, letterSpacing: '0.05em' }}>HAL ACCESS RD</Typography>
      </Box>

      {/* ── Dummy Nearby Cabs (Simulates Uber/Ola Drivers Online) ── */}
      <Box sx={{ position: 'absolute', left: '28%', top: '22%', zIndex: 3, fontSize: 16, animation: 'floatCab 4s infinite ease-in-out' }}>🚕</Box>
      <Box sx={{ position: 'absolute', left: '55%', top: '44%', zIndex: 3, fontSize: 16, animation: 'floatCab2 3.5s infinite ease-in-out' }}>🚕</Box>
      <Box sx={{ position: 'absolute', right: '25%', top: '65%', zIndex: 3, fontSize: 16, animation: 'floatCab 4.5s infinite ease-in-out' }}>🚕</Box>
      <Box sx={{ position: 'absolute', left: '46%', bottom: '20%', zIndex: 3, fontSize: 16, animation: 'floatCab2 5s infinite ease-in-out' }}>🚕</Box>

      {/* ── Active User Current GPS Location ── */}
      <Box
        sx={{
          position: 'absolute',
          left: '42%',
          top: '68%',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box sx={{ position: 'relative', width: 12, height: 12 }}>
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', bgcolor: '#0288d1', borderRadius: '50%', zIndex: 2, border: '2.5px solid #fff', boxShadow: '0 2px 8px rgba(2,136,209,0.5)' }} />
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(2,136,209,0.4)',
              borderRadius: '50%',
              zIndex: 1,
              animation: 'pulse 2s infinite ease-out'
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '8px', color: '#0288d1', fontWeight: 800, mt: 0.5, bgcolor: 'rgba(255,255,255,0.95)', px: 0.75, py: 0.2, borderRadius: '4px', border: '1px solid rgba(2,136,209,0.2)' }}>
          You
        </Typography>
      </Box>

      {/* ── Map Route Paths SVG (Hidden in Booking Mode) ── */}
      {!isBookingMode && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          {/* Alternative Route Path (Grey Dashed) */}
          <path
            d="M 60,180 C 120,240 280,180 340,110"
            fill="none"
            stroke="#90A4AE"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="6 6"
            opacity="0.7"
          />

          {/* Suggestion Main Route Path (Bold Teal suggested path) */}
          <path
            id="route-path"
            d="M 60,180 C 130,100 250,240 340,110"
            fill="none"
            stroke="#0c7c7c"
            strokeWidth="5"
            strokeLinecap="round"
            style={{
              transition: 'all 0.5s ease',
              animation: status === 'requesting' ? 'dash 1.5s linear infinite' : 'none'
            }}
          />
        </svg>
      )}

      {/* Alternative Route Marker Badge (Hidden in Booking Mode) */}
      {!isBookingMode && (
        <Box sx={{ position: 'absolute', left: '50%', bottom: '26%', zIndex: 3, bgcolor: '#FFFFFF', border: '1px solid #CFD8DC', borderRadius: '4px', px: 0.75, py: 0.2 }}>
          <Typography sx={{ fontSize: '7.5px', color: 'text.secondary', fontWeight: 700 }}>Alt Route • +3 mins</Typography>
        </Box>
      )}

      {/* ── Green Pickup Map Pin Marker ── */}
      <Box
        onMouseDown={handleMouseDown('pickup')}
        sx={{
          position: 'absolute',
          left: pickupCoords.x,
          top: pickupCoords.y,
          zIndex: 3,
          transform: 'translate(-50%, -100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: isBookingMode ? (draggingPin === 'pickup' ? 'grabbing' : 'grab') : 'default',
          transition: draggingPin === 'pickup' ? 'none' : 'left 0.2s, top 0.2s'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#00796b', color: '#fff', px: 1.2, py: 0.5, borderRadius: '6px', fontSize: '9px', fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(0,121,107,0.3)', border: '1px solid rgba(255,255,255,0.2)', userSelect: 'none' }}>
          🟢 {pickupLabel} {isBookingMode && '✊'}
        </Box>
        <LocationOnIcon sx={{ color: '#00796b', fontSize: 30, mt: -0.5, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
      </Box>

      {/* ── Red Destination Map Pin Marker ── */}
      <Box
        onMouseDown={handleMouseDown('dropoff')}
        sx={{
          position: 'absolute',
          left: dropoffCoords.x,
          top: dropoffCoords.y,
          zIndex: 3,
          transform: 'translate(-50%, -100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: isBookingMode ? (draggingPin === 'dropoff' ? 'grabbing' : 'grab') : 'default',
          transition: draggingPin === 'dropoff' ? 'none' : 'left 0.2s, top 0.2s'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#d32f2f', color: '#fff', px: 1.2, py: 0.5, borderRadius: '6px', fontSize: '9px', fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(211,47,47,0.3)', border: '1px solid rgba(255,255,255,0.2)', userSelect: 'none' }}>
          🏁 {dropoffLabel}
        </Box>
        <LocationOnIcon sx={{ color: '#d32f2f', fontSize: 30, mt: -0.5, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
      </Box>

      {/* ── Active Cab Indicator (Hidden in Booking Mode) ── */}
      {!isBookingMode && status !== 'scheduled' && status !== 'requesting' && (
        <Box
          sx={{
            position: 'absolute',
            zIndex: 4,
            width: 32,
            height: 32,
            bgcolor: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            border: '2px solid #0c7c7c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            ...calculateCoordinates(carPosition),
            transform: 'translate(-50%, -50%)',
            transition: status === 'in_transit' ? 'none' : 'all 0.5s ease-out'
          }}
        >
          🚕
        </Box>
      )}

      {/* Keyframe animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(2, 136, 209, 0.5);
          }
          70% {
            transform: scale(1.6);
            box-shadow: 0 0 0 10px rgba(2, 136, 209, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(2, 136, 209, 0);
          }
        }
        @keyframes floatCab {
          0%, 100% { transform: translate(0, 0) rotate(5deg); }
          50% { transform: translate(3px, -3px) rotate(-5deg); }
        }
        @keyframes floatCab2 {
          0%, 100% { transform: translate(0, 0) rotate(-5deg); }
          50% { transform: translate(-3px, 2px) rotate(5deg); }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -16;
          }
        }
      `}} />
    </Box>
  )
}

function calculateCoordinates(pct: number) {
  const t = pct / 100
  // Control points of Bezier curve M 60,180 C 130,100 250,240 340,110
  const x0 = 60, y0 = 180
  const x1 = 130, y1 = 100
  const x2 = 250, y2 = 240
  const x3 = 340, y3 = 110

  // Cubic Bezier formula
  const mt = 1 - t
  const x = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3
  const y = mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3

  return {
    left: `${x}px`,
    top: `${y}px`
  }
}
