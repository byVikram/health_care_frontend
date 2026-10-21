// src/features/careTransit/pages/RideTrackingPage.tsx
//
// Dedicated full-screen cab tracking experience.
// Left panel: Driver details, ETA, simulation action, safety SOS triggers.
// Right panel: Live map tracking using RideMapTracker.

import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Chip,
  Divider,
  Avatar,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Paper
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StarIcon from '@mui/icons-material/Star'
import PhoneIcon from '@mui/icons-material/Phone'
import ShieldIcon from '@mui/icons-material/Shield'
import WarningIcon from '@mui/icons-material/Warning'
import Grid from '@mui/material/Grid'
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi'

import AppButton from '../../../components/common/Button/AppButton'
import RideMapTracker from '../../transportation/components/RideMapTracker'
import { customScrollbar } from '../../../styles/commonStyles'

const RIDE_STATUSES = ['scheduled', 'requesting', 'dispatched', 'in_transit', 'completed']

function nextStatus(current: string): string {
  const idx = RIDE_STATUSES.indexOf(current)
  return idx >= 0 && idx < RIDE_STATUSES.length - 1 ? RIDE_STATUSES[idx + 1] : current
}

export default function RideTrackingPage() {
  const { bookingType, bookingId } = useParams<{ bookingType: 'doctor' | 'radiology'; bookingId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type') === 'return' ? 'return' : 'onward'

  const onwardKeyDefault = bookingType === 'doctor' ? `ride_${bookingId}` : `ride_${bookingType}_${bookingId}`
  const onwardKeyAlt = bookingType === 'doctor' ? `ride_doctor_${bookingId}` : undefined

  const returnKeyDefault = bookingType === 'doctor' ? `ride_return_${bookingId}` : `ride_return_${bookingType}_${bookingId}`
  const returnKeyAlt = bookingType === 'doctor' ? `ride_return_doctor_${bookingId}` : undefined

  const [activeKey, setActiveKey] = useState(onwardKeyDefault)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ride, setRide] = useState<any>(null)
  const [rideStatus, setRideStatus] = useState<string>('scheduled')
  const [sosOpen, setSosOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId || !bookingType) return

    const keyDefault = type === 'onward' ? onwardKeyDefault : returnKeyDefault
    const keyAlt = type === 'onward' ? onwardKeyAlt : returnKeyAlt

    const valDefault = localStorage.getItem(keyDefault)
    if (valDefault) {
      const p = JSON.parse(valDefault)
      setRide(p)
      setRideStatus(p.status ?? 'scheduled')
      setActiveKey(keyDefault)
    } else if (keyAlt && localStorage.getItem(keyAlt)) {
      const altVal = localStorage.getItem(keyAlt)!
      const p = JSON.parse(altVal)
      setRide(p)
      setRideStatus(p.status ?? 'scheduled')
      setActiveKey(altVal)
    } else {
      setRide(null)
      setRideStatus('scheduled')
      setActiveKey(keyDefault)
    }
    setLoading(false)
  }, [bookingId, bookingType, type, onwardKeyDefault, onwardKeyAlt, returnKeyDefault, returnKeyAlt])

  const advanceRide = () => {
    if (!ride) return
    const next = nextStatus(rideStatus)
    setRideStatus(next)
    const updated = { ...ride, status: next }
    setRide(updated)
    localStorage.setItem(activeKey, JSON.stringify(updated))
  }

  const handleBack = () => {
    if (bookingType === 'radiology') {
      navigate(`/radiology/bookings/${bookingId}`)
    } else {
      navigate(`/portal/appointments/${bookingId}`)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#0c7c7c' }} />
      </Box>
    )
  }

  if (!ride) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <LocalTaxiIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No active ride found for this booking.
        </Typography>
        <AppButton label="Go Back" onClick={handleBack} sx={{ mt: 2 }} />
      </Container>
    )
  }

  const pickupLabel = type === 'onward' ? 'Pickup' : 'Clinic'
  const dropoffLabel = type === 'onward' ? 'Clinic' : 'Home'

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Dark-Teal Navigation Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f4c4c, #0c7c7c)',
          px: { xs: 2.5, sm: 4 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          color: '#fff',
          boxShadow: '0 4px 16px rgba(12, 124, 124, 0.15)'
        }}
      >
        <IconButton
          size="small"
          onClick={handleBack}
          sx={{ color: '#fff', bgcolor: 'rgba(255, 255, 255, 0.1)', '&:focus': { outline: 'none' }, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' } }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Box>
          <Typography fontWeight={800} fontSize={16}>
            {type === 'onward' ? 'Onward Ride Live Tracking' : 'Return Ride Live Tracking'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
            CareTransit • {bookingType === 'radiology' ? 'Radiology Center' : 'Consulting Doctor Office'}
          </Typography>
        </Box>
      </Box>

      {/* Main split viewport layout */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', height: 'calc(100vh - 70px)' }}>
        <Grid container sx={{ flex: 1 }}>
          
          {/* Left Details Sidebar */}
          <Grid
            size={{ xs: 12, md: 5, lg: 4 }}
            sx={{
              borderRight: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              height: '100%',
              overflowY: 'auto',
              p: { xs: 3, sm: 4 },
              ...customScrollbar,
            }}
          >
            {/* Status indicators */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5 }}>
              <Typography variant="subtitle2" fontWeight={800} color="primary.dark">
                Ride Progress
              </Typography>
              <Chip
                label={
                  rideStatus === 'scheduled' ? 'Scheduled' :
                  rideStatus === 'requesting' ? 'Matching Driver' :
                  rideStatus === 'dispatched' ? 'En Route' :
                  rideStatus === 'in_transit' ? 'In Transit' : 'Completed'
                }
                size="small"
                sx={{
                  fontWeight: 700,
                  px: 1.2,
                  py: 0.2,
                  color: '#fff',
                  bgcolor:
                    rideStatus === 'scheduled' ? '#ed6c02' :
                    rideStatus === 'requesting' ? '#0288d1' :
                    rideStatus === 'dispatched' ? '#2e7d32' :
                    rideStatus === 'in_transit' ? '#0c7c7c' : 'text.disabled',
                }}
              />
            </Box>

            {/* Custom Vertical Timetrack Stepper */}
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4, pl: 4.5 }}>
              {/* Vertical timeline bar line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  bottom: 10,
                  left: 17,
                  width: '2px',
                  bgcolor: '#E2E8F0',
                  zIndex: 0
                }}
              />

              {/* Step 1: Matching */}
              <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Box sx={{
                  position: 'absolute',
                  left: -32,
                  top: 0,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: rideStatus !== 'scheduled' ? '#0c7c7c' : '#E2E8F0',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 2px ' + (rideStatus !== 'scheduled' ? '#0c7c7c' : '#E2E8F0'),
                  zIndex: 2
                }} />
                <Typography fontSize={12.5} fontWeight={700} color={rideStatus !== 'scheduled' ? 'text.primary' : 'text.secondary'}>
                  Matching Driver
                </Typography>
                <Typography fontSize={10.5} color="text.secondary">
                  Locating care-certified vehicle nearby
                </Typography>
              </Box>

              {/* Step 2: Dispatched */}
              <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Box sx={{
                  position: 'absolute',
                  left: -32,
                  top: 0,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: (rideStatus === 'dispatched' || rideStatus === 'in_transit' || rideStatus === 'completed') ? '#0c7c7c' : '#E2E8F0',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 2px ' + ((rideStatus === 'dispatched' || rideStatus === 'in_transit' || rideStatus === 'completed') ? '#0c7c7c' : '#E2E8F0'),
                  zIndex: 2
                }} />
                <Typography fontSize={12.5} fontWeight={700} color={(rideStatus === 'dispatched' || rideStatus === 'in_transit' || rideStatus === 'completed') ? 'text.primary' : 'text.secondary'}>
                  Driver En Route
                </Typography>
                <Typography fontSize={10.5} color="text.secondary">
                  Driver arriving at pickup location
                </Typography>
              </Box>

              {/* Step 3: In Transit */}
              <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Box sx={{
                  position: 'absolute',
                  left: -32,
                  top: 0,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: (rideStatus === 'in_transit' || rideStatus === 'completed') ? '#0c7c7c' : '#E2E8F0',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 2px ' + ((rideStatus === 'in_transit' || rideStatus === 'completed') ? '#0c7c7c' : '#E2E8F0'),
                  zIndex: 2
                }} />
                <Typography fontSize={12.5} fontWeight={700} color={(rideStatus === 'in_transit' || rideStatus === 'completed') ? 'text.primary' : 'text.secondary'}>
                  Trip in Transit
                </Typography>
                <Typography fontSize={10.5} color="text.secondary">
                  Heading to destination clinic porch
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Address Details */}
            <Stack spacing={2} sx={{ mb: 4 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
                  📍 PICKUP LOCATION
                </Typography>
                <Typography fontSize={13} fontWeight={600} color="text.primary">
                  {ride.pickup_address}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
                  🏁 DESTINATION
                </Typography>
                <Typography fontSize={13} fontWeight={600} color="text.primary">
                  {ride.dropoff_address}
                </Typography>
              </Box>
            </Stack>

            {/* Verified Driver Profile Section */}
            {(rideStatus === 'dispatched' || rideStatus === 'in_transit') && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#F8FCFC',
                  mb: 4
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: '#0c7c7c', color: '#fff', width: 44, height: 44, fontWeight: 700 }}>
                    {type === 'onward' ? 'RK' : 'AM'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize={14} fontWeight={800} color="text.primary" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      {type === 'onward' ? 'Rajesh Kumar' : 'Amit Mishra'}
                      <Chip
                        label="Care-Certified"
                        size="small"
                        icon={<ShieldIcon sx={{ '&&': { color: '#2e7d32', fontSize: 10 } }} />}
                        sx={{
                          height: 16,
                          fontSize: 8.5,
                          fontWeight: 700,
                          bgcolor: '#e8f5e9',
                          color: '#2e7d32',
                          border: '1px solid #4caf50',
                          borderRadius: '4px',
                          '& .MuiChip-label': { px: 0.5 }
                        }}
                      />
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <StarIcon sx={{ fontSize: 13, color: '#ffb300' }} />
                      <Typography fontSize={11} color="text.secondary" fontWeight={600}>
                        4.9 • Suzuki Dzire (KA-01-MJ-1234)
                      </Typography>
                    </Box>
                  </Box>
                  {rideStatus === 'dispatched' && (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '9px', fontWeight: 700 }}>
                        TRIP PIN
                      </Typography>
                      <Typography variant="body2" fontWeight={900} color="#0c7c7c">
                        {type === 'onward' ? '4829' : '8372'}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography fontSize={10} fontWeight={700} color="text.secondary">
                    {rideStatus === 'dispatched' ? 'ETA ARRIVAL' : 'TRIP PROGRESS'}
                  </Typography>
                  <Typography fontSize={11} fontWeight={800} color="#0c7c7c">
                    {rideStatus === 'dispatched' ? '5 Mins' : 'On the Way (1.2 km left)'}
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 6, bgcolor: 'divider', borderRadius: '3px', overflow: 'hidden', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: rideStatus === 'dispatched' ? '40%' : '80%',
                      height: '100%',
                      bgcolor: '#0c7c7c',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    sx={{
                      color: '#0c7c7c',
                      border: '1.5px solid',
                      borderColor: '#0c7c7c',
                      p: 1,
                      borderRadius: '10px',
                      '&:focus': { outline: 'none' },
                      '&:hover': { bgcolor: 'rgba(12, 124, 124, 0.04)' }
                    }}
                    onClick={() => window.open(type === 'onward' ? 'tel:+919876543210' : 'tel:+919876543211')}
                  >
                    <PhoneIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <AppButton
                    label="🚨 MEDICAL EMERGENCY SOS"
                    size="small"
                    onClick={() => setSosOpen(true)}
                    sx={{
                      flex: 1,
                      fontSize: 10.5,
                      fontWeight: 700,
                      bgcolor: '#d32f2f',
                      color: '#fff',
                      borderRadius: '10px',
                      '&:hover': { bgcolor: '#b71c1c' }
                    }}
                  />
                </Box>
              </Paper>
            )}

            {/* Completed Safety Info */}
            {rideStatus === 'completed' && (
              <Box sx={{ bgcolor: 'rgba(46, 125, 50, 0.04)', p: 2, borderRadius: '12px', border: '1px solid rgba(46,125,50,0.15)', mb: 4 }}>
                <Typography fontSize={12} color="#2e7d32" fontWeight={700}>
                  {type === 'onward' ? '✅ Arrived safely at the clinic.' : '✅ Returned safely to your home address. Thank you!'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  This ride fare has been fully verified and logged to your checkout sheet.
                </Typography>
              </Box>
            )}

            {/* Simulator action button (bottom sticky) */}
            {rideStatus !== 'completed' && (
              <Box sx={{ mt: 'auto', pt: 2 }}>
                <AppButton
                  label={
                    rideStatus === 'scheduled' ? 'Simulate Driver Dispatch' :
                    rideStatus === 'requesting' ? 'Simulate Driver Assignment' :
                    rideStatus === 'dispatched' ? 'Simulate Trip Start' : 'Simulate Trip Completed'
                  }
                  size="small"
                  onClick={advanceRide}
                  sx={{
                    width: '100%',
                    py: 1,
                    fontWeight: 700,
                    fontSize: 12,
                    bgcolor: 'rgba(12, 124, 124, 0.06)',
                    color: '#0c7c7c',
                    borderRadius: '8px',
                    border: '1.5px solid transparent',
                    '&:hover': {
                      bgcolor: 'rgba(12, 124, 124, 0.1)',
                      borderColor: '#0c7c7c',
                    }
                  }}
                />
              </Box>
            )}
          </Grid>

          {/* Right Map Panel */}
          <Grid
            size={{ xs: 12, md: 7, lg: 8 }}
            sx={{
              height: '100%',
              position: 'relative'
            }}
          >
            <RideMapTracker status={rideStatus} pickupLabel={pickupLabel} dropoffLabel={dropoffLabel} />
          </Grid>

        </Grid>
      </Box>

      {/* SOS Emergency Dialog */}
      <Dialog
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', overflow: 'hidden' } } }}
      >
        <Box sx={{ bgcolor: '#d32f2f', color: '#fff', p: 3, textAlign: 'center' }}>
          <WarningIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" fontWeight={800} fontSize={18}>
            MEDICAL EMERGENCY SOS
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mt: 0.5 }}>
            Critical safety protocols are now active.
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ bgcolor: 'rgba(211, 47, 47, 0.04)', p: 2, borderRadius: '8px', border: '1.5px dashed rgba(211, 47, 47, 0.2)' }}>
            <Typography variant="body2" fontWeight={700} color="#d32f2f" mb={0.5}>
              📍 Active GPS Coordinates:
            </Typography>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600} color="text.primary">
              12.9716° N, 77.5946° E (Bengaluru, IN)
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Emergency services and emergency contact have been sent this location link.
            </Typography>
          </Box>

          <Box>
            <Typography fontSize={13} fontWeight={700} color="text.primary" mb={1}>
              EMERGENCY CONTACT CHANNELS
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => window.open('tel:+919876543299')}
              sx={{
                bgcolor: '#d32f2f',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                mb: 1,
                '&:hover': { bgcolor: '#b71c1c' }
              }}
            >
              📞 Call Hospital ER Hotline (+91 98765 43299)
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => alert("Ambulance interception requested! Emergency service dispatched to vehicle location.")}
              sx={{
                borderColor: '#d32f2f',
                color: '#d32f2f',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { borderColor: '#b71c1c', bgcolor: 'rgba(211, 47, 47, 0.04)' }
              }}
            >
              🚨 Request Ambulance Intercept
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={() => setSosOpen(false)}
            sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none' }}
          >
            Cancel / False Alarm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
