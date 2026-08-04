// src/features/careTransit/components/CareTransitCard.tsx
//
// Shared, booking-type-agnostic transportation card.
// Drop this into any booking detail page to provide onward + return
// ride booking / tracking without knowing anything about the booking type.
//
// Props
//   bookingId    – appointment or radiology booking UUID
//   bookingType  – 'doctor' | 'radiology'  (namespaces localStorage keys)
//   bookingUrl   – base URL for book-ride navigation (without ?type=…)
//   isClinicVisit – render nothing for video / remote bookings

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Chip, Stack, Divider, Button } from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AppButton from '../../../components/common/Button/AppButton'

interface CareTransitCardProps {
  bookingId: string
  bookingType: 'doctor' | 'radiology'
  /** Full URL prefix, e.g. `/portal/appointments/abc-123/book-ride` */
  bookingUrl: string
  isClinicVisit?: boolean
}

const promoBox = {
  bgcolor: 'rgba(13, 148, 136, 0.02)',
  border: '1px dashed',
  borderColor: '#0c7c7c',
  borderRadius: '2px',
  p: { xs: 2, sm: 2.5 },
  mb: 3,
  textAlign: 'center' as const,
}

const summaryCard = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '16px',
  p: 2,
  mb: 3,
  bgcolor: 'background.paper',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}

export default function CareTransitCard({
  bookingId,
  bookingType,
  bookingUrl,
  isClinicVisit = true,
}: CareTransitCardProps) {
  const navigate = useNavigate()

  // Use namespaced keys for radiology/future types, but keep native keys for doctor appointments to prevent breaking them
  const onwardKeyDefault = bookingType === 'doctor' ? `ride_${bookingId}` : `ride_${bookingType}_${bookingId}`
  const onwardKeyAlt = bookingType === 'doctor' ? `ride_doctor_${bookingId}` : undefined

  const returnKeyDefault = bookingType === 'doctor' ? `ride_return_${bookingId}` : `ride_return_${bookingType}_${bookingId}`
  const returnKeyAlt = bookingType === 'doctor' ? `ride_return_doctor_${bookingId}` : undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ride, setRide] = useState<any>(null)
  const [rideStatus, setRideStatus] = useState<string>('scheduled')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [returnRide, setReturnRide] = useState<any>(null)
  const [returnRideStatus, setReturnRideStatus] = useState<string>('scheduled')

  useEffect(() => {
    if (!bookingId) return

    const onward = localStorage.getItem(onwardKeyDefault)
    if (onward) {
      const p = JSON.parse(onward)
      setRide(p)
      setRideStatus(p.status ?? 'scheduled')
    } else if (onwardKeyAlt && localStorage.getItem(onwardKeyAlt)) {
      const p = JSON.parse(localStorage.getItem(onwardKeyAlt)!)
      setRide(p)
      setRideStatus(p.status ?? 'scheduled')
    } else {
      setRide(null)
      setRideStatus('scheduled')
    }

    const ret = localStorage.getItem(returnKeyDefault)
    if (ret) {
      const p = JSON.parse(ret)
      setReturnRide(p)
      setReturnRideStatus(p.status ?? 'scheduled')
    } else if (returnKeyAlt && localStorage.getItem(returnKeyAlt)) {
      const p = JSON.parse(localStorage.getItem(returnKeyAlt)!)
      setReturnRide(p)
      setReturnRideStatus(p.status ?? 'scheduled')
    } else {
      setReturnRide(null)
      setReturnRideStatus('scheduled')
    }
  }, [bookingId, onwardKeyDefault, onwardKeyAlt, returnKeyDefault, returnKeyAlt])

  if (!isClinicVisit) return null

  // If neither ride is booked, show a single clean promo block
  if (!ride && !returnRide) {
    return (
      <Box sx={summaryCard}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <DirectionsCarIcon sx={{ color: '#0c7c7c', fontSize: 24 }} />
          <Typography fontWeight={700} fontSize={14} color="text.primary">
            Need transportation?
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Book a safe, reliable cab to get you to and from your visit.
        </Typography>
        <AppButton
          label="Book Onward Ride"
          size="small"
          onClick={() => navigate(`${bookingUrl}?type=onward`)}
          sx={{ width: '100%', py: 0.6, fontSize: 11.5, bgcolor: '#0c7c7c' }}
        />
      </Box>
    )
  }

  // Otherwise, render a single container card showing status/actions for both booked rides
  return (
    <Box sx={summaryCard}>
      <Typography variant="overline" sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
        Transit Booking
      </Typography>
      
      <Stack spacing={1.5} divider={<Divider />}>
        {/* Onward Ride Row */}
        {ride ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography fontSize={12} fontWeight={700} color="text.primary">
                  Onward Cab
                </Typography>
                <Chip
                  label={
                    rideStatus === 'scheduled' ? 'Scheduled' :
                    rideStatus === 'requesting' ? 'Matching' :
                    rideStatus === 'dispatched' ? 'En Route' :
                    rideStatus === 'in_transit' ? 'In Transit' : 'Completed'
                  }
                  size="small"
                  sx={{
                    height: 15,
                    fontSize: 8,
                    fontWeight: 700,
                    color: '#fff',
                    bgcolor:
                      rideStatus === 'scheduled' ? '#ed6c02' :
                      rideStatus === 'requesting' ? '#0288d1' :
                      rideStatus === 'dispatched' ? '#2e7d32' :
                      rideStatus === 'in_transit' ? '#0c7c7c' : 'text.disabled',
                  }}
                />
              </Box>
              <Typography fontSize={11} color="text.secondary" noWrap sx={{ maxWidth: '180px' }}>
                {ride.pickup_address?.split(',')[0]} → {ride.dropoff_address?.split(',')[0]}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/portal/transit/track/${bookingType}/${bookingId}?type=onward`)}
              sx={{
                fontSize: 10,
                py: 0.25,
                px: 1,
                minWidth: 'auto',
                borderColor: '#0c7c7c',
                color: '#0c7c7c',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '6px',
                '&:hover': { bgcolor: 'rgba(12, 124, 124, 0.04)', borderColor: '#0c7c7c' }
              }}
            >
              {rideStatus === 'completed' ? 'Receipt' : 'Track'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography fontSize={12} fontWeight={600} color="text.secondary">
                Onward Cab
              </Typography>
              <Typography fontSize={10} color="text.disabled">Not booked</Typography>
            </Box>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate(`${bookingUrl}?type=onward`)}
              sx={{ fontSize: 10, textTransform: 'none', color: '#0c7c7c', fontWeight: 600 }}
            >
              Book Now
            </Button>
          </Box>
        )}

        {/* Return Ride Row */}
        {returnRide ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography fontSize={12} fontWeight={700} color="text.primary">
                  Return Cab
                </Typography>
                <Chip
                  label={
                    returnRideStatus === 'scheduled' ? 'Scheduled' :
                    returnRideStatus === 'requesting' ? 'Matching' :
                    returnRideStatus === 'dispatched' ? 'En Route' :
                    returnRideStatus === 'in_transit' ? 'In Transit' : 'Completed'
                  }
                  size="small"
                  sx={{
                    height: 15,
                    fontSize: 8,
                    fontWeight: 700,
                    color: '#fff',
                    bgcolor:
                      returnRideStatus === 'scheduled' ? '#ed6c02' :
                      returnRideStatus === 'requesting' ? '#0288d1' :
                      returnRideStatus === 'dispatched' ? '#2e7d32' :
                      returnRideStatus === 'in_transit' ? '#0c7c7c' : 'text.disabled',
                  }}
                />
              </Box>
              <Typography fontSize={11} color="text.secondary" noWrap sx={{ maxWidth: '180px' }}>
                {returnRide.pickup_address?.split(',')[0]} → {returnRide.dropoff_address?.split(',')[0]}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/portal/transit/track/${bookingType}/${bookingId}?type=return`)}
              sx={{
                fontSize: 10,
                py: 0.25,
                px: 1,
                minWidth: 'auto',
                borderColor: '#0c7c7c',
                color: '#0c7c7c',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '6px',
                '&:hover': { bgcolor: 'rgba(12, 124, 124, 0.04)', borderColor: '#0c7c7c' }
              }}
            >
              {returnRideStatus === 'completed' ? 'Receipt' : 'Track'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography fontSize={12} fontWeight={600} color="text.secondary">
                Return Cab
              </Typography>
              <Typography fontSize={10} color="text.disabled">Not booked</Typography>
            </Box>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate(`${bookingUrl}?type=return`)}
              sx={{ fontSize: 10, textTransform: 'none', color: '#0c7c7c', fontWeight: 600 }}
            >
              Book Now
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
