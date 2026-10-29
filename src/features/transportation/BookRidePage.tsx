// src/features/transportation/BookRidePage.tsx
//
// Stylized, premium cab booking form.
// Features:
//   • 2-Column Split Pane Layout: Left booking inputs, Right live RideMapTracker preview.
//   • Dynamic Map Pins: Pickup & Dropoff pins automatically align with chosen location.
//   • Autocomplete Location Input: User types search query, dropdown suggestions list matches Bengaluru hubs.
//   • Premium options, accessibility toggles, HSL shadows, clean theme styling.

import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useGoBack } from '../../hooks/useGoBack'
import {
  Box,
  Container,
  Typography,
  Divider,
  CircularProgress,
  Avatar,
  IconButton,
  Paper,
  Chip,
  MenuItem,
  Select,
  FormControl,
  Stack,
  Grid
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import AppButton from '../../components/common/Button/AppButton'
import AppSelect from '../../components/common/Select/AppSelect'
import AppInput from '../../components/common/Input/AppInput'
import ConfirmModal from '../../components/common/Modal/ConfirmModal'
import RideMapTracker from './components/RideMapTracker'
import { getAppointmentById } from '../../services/appointmentService'
import { getPatientAddresses, PatientAddressOut } from '../patient/patientService'
import { Appointment } from '../../types/appointment'
import { customScrollbar } from '../../styles/commonStyles'

interface RideEstimate {
  type: string
  label: string
  price: number
  eta: number
}

// Curated list of major Bengaluru hubs for custom address dummy dropdown autocomplete search
const BENGALURU_LOCATIONS = [
  '123 Indiranagar, Bengaluru',
  'Koramangala 4th Block, Bengaluru',
  'Whitefield IT Park, Bengaluru',
  'MG Road Metro Station, Bengaluru',
  'Jayanagar 4th Block, Bengaluru',
  'HSR Layout Sector 2, Bengaluru',
  'Electronic City Phase 1, Bengaluru'
]

export default function BookRidePage() {
  const { appointmentId, bookingId: radiologyBookingId } = useParams<{ appointmentId?: string; bookingId?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const goBack = useGoBack()

  const resolvedBookingId = appointmentId ?? radiologyBookingId ?? ''
  const bookingSource = (searchParams.get('source') ?? (appointmentId ? 'doctor' : 'radiology')) as 'doctor' | 'radiology'
  const bookingType = searchParams.get('type') === 'return' ? 'return' : 'onward'

  const [appt, setAppt] = useState<Appointment | null>(null)
  const [apptLoading, setApptLoading] = useState(true)
  const [apptError, setApptError] = useState<string | null>(null)

  const [savedAddresses, setSavedAddresses] = useState<PatientAddressOut[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  
  // Custom Address Autocomplete states
  const [customAddress, setCustomAddress] = useState(BENGALURU_LOCATIONS[0])
  const [customSearchQuery, setCustomSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [useCustomAddress, setUseCustomAddress] = useState(false)

  const [selectedRideOption, setSelectedRideOption] = useState<string | null>('economy')
  const [estimatesLoading, setEstimatesLoading] = useState(false)
  const [rideEstimates, setRideEstimates] = useState<RideEstimate[]>([])
  const [booking, setBooking] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const [wheelchair, setWheelchair] = useState(false)
  const [assistance, setAssistance] = useState(false)
  const [companion, setCompanion] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'pay_now' | 'hospital_bill' | 'insurance'>('pay_now')

  const getSuggestedPickupTime = (startTimeStr: string) => {
    if (!startTimeStr) return ''
    const parts = startTimeStr.split(':')
    if (parts.length < 2) return startTimeStr
    const [h, m] = parts
    let hour = parseInt(h, 10) - 1
    if (hour < 0) hour += 24
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${m || '00'} ${ampm}`
  }

  const clinicAddress = appt?.hospital?.address ?? 'Apollo Hospital, Bengaluru'

  useEffect(() => {
    if (!appointmentId) {
      setApptLoading(false)
      return
    }
    setApptLoading(true)
    getAppointmentById(appointmentId)
      .then((data) => {
        setAppt(data)
        setApptLoading(false)
      })
      .catch(() => {
        setApptError('Failed to load appointment details.')
        setApptLoading(false)
      })
  }, [appointmentId])

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await getPatientAddresses()
        if (res.success && res.data) {
          setSavedAddresses(res.data)
          const defaultAddr = res.data.find(addr => addr.is_default)
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id)
          } else if (res.data.length > 0) {
            setSelectedAddressId(res.data[0].id)
          }
        }
      } catch (err) {
        console.error("Failed to load patient addresses", err)
      }
    }
    fetchAddresses()
  }, [])

  useEffect(() => {
    const ready = !apptLoading && (appt !== null || bookingSource === 'radiology')
    if (!ready) return
    setEstimatesLoading(true)
    const timer = setTimeout(() => {
      const activeAddr = useCustomAddress ? customAddress : selectedAddressId
      const basePrice = activeAddr ? 180 + (parseInt(activeAddr.slice(-1), 16) || 5) * 15 : 220
      setRideEstimates([
        { type: 'economy', label: 'Budget Sedan', price: basePrice, eta: 5 },
        { type: 'comfort', label: 'Comfort SUV', price: basePrice + 120, eta: 7 },
        { type: 'medical', label: 'Accessible Medical Cab', price: basePrice + 220, eta: 11 }
      ])
      setEstimatesLoading(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [apptLoading, appt, bookingSource, selectedAddressId, useCustomAddress, customAddress])

  const selectedRideDetails = rideEstimates.find(e => e.type === selectedRideOption)

  const handleBookRide = () => {
    if (!selectedRideDetails || !resolvedBookingId) return
    setBooking(true)

    setTimeout(() => {
      const activeUserAddr = useCustomAddress
        ? customAddress
        : (savedAddresses.find(a => a.id === selectedAddressId)?.address_line ?? 'Home')

      const mockRide = {
        appointment_id: resolvedBookingId,
        pickup_address: bookingType === 'onward' ? activeUserAddr : clinicAddress,
        dropoff_address: bookingType === 'onward' ? clinicAddress : activeUserAddr,
        ride_provider: 'Uber',
        vehicle_type: selectedRideDetails.label,
        estimated_fare: selectedRideDetails.price,
        is_return_ride: bookingType === 'return',
        status: 'scheduled',
        wheelchair,
        assistance,
        companion,
        payment_method: paymentMethod,
      }

      const onwardKey = bookingSource === 'doctor' ? `ride_${resolvedBookingId}` : `ride_${bookingSource}_${resolvedBookingId}`
      const returnStorageKey = bookingType === 'return'
        ? (bookingSource === 'doctor' ? `ride_return_${resolvedBookingId}` : `ride_return_${bookingSource}_${resolvedBookingId}`)
        : onwardKey
      localStorage.setItem(returnStorageKey, JSON.stringify(mockRide))

      setBooking(false)
      setSuccessOpen(true)
    }, 1000)
  }

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (apptLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#0c7c7c' }} />
      </Box>
    )
  }

  if (apptError || (bookingSource === 'doctor' && !appt)) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">{apptError ?? 'Appointment not found'}</Typography>
        <AppButton label="Go Back" onClick={() => goBack()} sx={{ mt: 2 }} />
      </Box>
    )
  }

  // Derive active addresses for map pins
  const activeUserAddrLabel = useCustomAddress
    ? (customAddress ? customAddress.split(',')[0] : 'Custom Pickup')
    : (savedAddresses.find(a => a.id === selectedAddressId)?.label ?? 'Home')

  const pickupLabel = bookingType === 'onward' ? activeUserAddrLabel : 'Clinic'
  const dropoffLabel = bookingType === 'onward' ? 'Clinic' : activeUserAddrLabel

  // Suggestion list filtering logic
  const filteredSuggestions = BENGALURU_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(customSearchQuery.toLowerCase())
  )

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4, px: { xs: 2, md: 3 }, ...customScrollbar }}>
      <Container maxWidth="lg">
        
        {/* Context Top Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => goBack()} sx={{ color: 'text.secondary', bgcolor: 'background.paper', border: '1px solid #E2E8F0', '&:focus': { outline: 'none' } }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography fontWeight={800} fontSize={18} color="primary.dark">
              {bookingType === 'return' ? 'Book Return Ride' : 'Book Ride to Clinic'}
            </Typography>
            <Typography fontSize={11.5} color="text.secondary">
              CareTransit • Shared Transportation Module
            </Typography>
          </Box>
        </Box>

        {/* 2-Column Layout */}
        <Grid container spacing={4} alignItems="stretch">
          
          {/* Left Panel: Inputs and selectors */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 32px rgba(12, 124, 124, 0.06)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header Summary Info */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: '#E0F2F1', color: '#00796B', width: 48, height: 48, fontSize: 22, fontWeight: 700, borderRadius: '12px' }}>
                  {bookingType === 'return' ? '🏁' : '🚗'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={800} fontSize={15} color="text.primary">
                    {bookingType === 'return' ? 'Ride Back Home (Post-Consultation)' : 'Ride to Health Clinic'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appt ? `With ${appt.doctor?.name ?? 'your Doctor'} on ${appt.appointment_date}` : 'Ride to your healthcare booking visit'}
                  </Typography>
                  {bookingType !== 'return' && appt?.start_time && (
                    <Box sx={{ mt: 1, px: 1.5, py: 1, bgcolor: 'rgba(12, 124, 124, 0.04)', borderRadius: '8px', border: '1px solid rgba(12, 124, 124, 0.1)' }}>
                      <Typography fontSize={11.5} color="#0c7c7c" fontWeight={700}>
                        ⏰ Suggested Pickup: {getSuggestedPickupTime(appt.start_time)}
                      </Typography>
                      <Typography fontSize={9.5} color="text.secondary" sx={{ mt: 0.2 }}>
                        Includes 30 mins travel time + 30 mins hospital intake check-in buffer.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Connected Route Map Timeline */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4, position: 'relative' }}>
                {/* Dotted connecting line */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 26,
                    bottom: 26,
                    left: 17,
                    width: '2px',
                    borderLeft: '2px dashed rgba(12, 124, 124, 0.3)',
                    zIndex: 0
                  }}
                />

                {/* PICKUP ROW */}
                <Box sx={{ display: 'flex', gap: 2.5, zIndex: 1 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#e0f2f1', color: '#00796b', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: 2 }}>
                    🟢
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5, letterSpacing: '0.04em' }}>
                      PICKUP FROM
                    </Typography>
                    {bookingType === 'return' ? (
                      <Typography fontSize={13.5} fontWeight={600} color="text.primary">
                        {clinicAddress}
                      </Typography>
                    ) : (
                      <Box sx={{ position: 'relative' }}>
                        {!useCustomAddress ? (
                          <Box>
                            {savedAddresses.length > 0 ? (
                              <AppSelect
                                value={selectedAddressId}
                                onChange={(e) => setSelectedAddressId(e.target.value as string)}
                                options={savedAddresses.map(addr => ({
                                  value: addr.id,
                                  label: `${addr.label}: ${addr.address_line}`
                                }))}
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, mb: 0.5 }}
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 0.5 }}>
                                No saved addresses found.
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              color="primary.main"
                              onClick={() => {
                                setUseCustomAddress(true)
                                setCustomSearchQuery('')
                              }}
                              sx={{ cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
                            >
                              + Type custom address (autocomplete)
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            {/* Type-to-Search Autocomplete Input field */}
                            <AppInput
                              placeholder="Type custom pickup location..."
                              value={customSearchQuery || customAddress}
                              onChange={(e) => {
                                setCustomSearchQuery(e.target.value)
                                setShowSuggestions(true)
                              }}
                              onFocus={() => setShowSuggestions(true)}
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />
                            
                            {/* Floating Dropdown suggestions */}
                            {showSuggestions && customSearchQuery.length > 0 && (
                              <Paper
                                elevation={4}
                                sx={{
                                  position: 'absolute',
                                  top: '42px',
                                  left: 0,
                                  right: 0,
                                  zIndex: 10,
                                  maxHeight: 200,
                                  overflowY: 'auto',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: '8px',
                                  ...customScrollbar
                                }}
                              >
                                {filteredSuggestions.length > 0 ? (
                                  filteredSuggestions.map((suggestion) => (
                                    <Box
                                      key={suggestion}
                                      onClick={() => {
                                        setCustomAddress(suggestion)
                                        setCustomSearchQuery(suggestion)
                                        setShowSuggestions(false)
                                      }}
                                      sx={{
                                        p: 1.25,
                                        fontSize: 12.5,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'rgba(12, 124, 124, 0.05)', color: '#0c7c7c' },
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        '&:last-child': { borderBottom: 'none' }
                                      }}
                                    >
                                      📍 {suggestion}
                                    </Box>
                                  ))
                                ) : (
                                  <Box sx={{ p: 1.5, fontSize: 12, color: 'text.secondary', textAlign: 'center' }}>
                                    No matching locations found
                                  </Box>
                                )}
                              </Paper>
                            )}

                            {savedAddresses.length > 0 && (
                              <Typography
                                variant="caption"
                                color="primary.main"
                                onClick={() => setUseCustomAddress(false)}
                                sx={{ cursor: 'pointer', fontWeight: 700, mt: 0.5, display: 'inline-block', '&:hover': { textDecoration: 'underline' } }}
                              >
                                Back to saved addresses
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* DROPOFF ROW */}
                <Box sx={{ display: 'flex', gap: 2.5, zIndex: 1, mt: 1 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#ffebee', color: '#d32f2f', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: 2 }}>
                    🏁
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5, letterSpacing: '0.04em' }}>
                      DROPOFF DESTINATION
                    </Typography>
                    {bookingType === 'onward' ? (
                      <Typography fontSize={13.5} fontWeight={600} color="text.primary">
                        {clinicAddress}
                      </Typography>
                    ) : (
                      <Box sx={{ position: 'relative' }}>
                        {!useCustomAddress ? (
                          <Box>
                            {savedAddresses.length > 0 ? (
                              <AppSelect
                                value={selectedAddressId}
                                onChange={(e) => setSelectedAddressId(e.target.value as string)}
                                options={savedAddresses.map(addr => ({
                                  value: addr.id,
                                  label: `${addr.label}: ${addr.address_line}`
                                }))}
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, mb: 0.5 }}
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 0.5 }}>
                                No saved addresses found.
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              color="primary.main"
                              onClick={() => {
                                setUseCustomAddress(true)
                                setCustomSearchQuery('')
                              }}
                              sx={{ cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
                            >
                              + Type custom address (autocomplete)
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            {/* Type-to-Search Autocomplete Input field */}
                            <AppInput
                              placeholder="Type custom dropoff location..."
                              value={customSearchQuery || customAddress}
                              onChange={(e) => {
                                setCustomSearchQuery(e.target.value)
                                setShowSuggestions(true)
                              }}
                              onFocus={() => setShowSuggestions(true)}
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />

                            {/* Floating Dropdown suggestions */}
                            {showSuggestions && customSearchQuery.length > 0 && (
                              <Paper
                                elevation={4}
                                sx={{
                                  position: 'absolute',
                                  top: '42px',
                                  left: 0,
                                  right: 0,
                                  zIndex: 10,
                                  maxHeight: 200,
                                  overflowY: 'auto',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: '8px',
                                  ...customScrollbar
                                }}
                              >
                                {filteredSuggestions.length > 0 ? (
                                  filteredSuggestions.map((suggestion) => (
                                    <Box
                                      key={suggestion}
                                      onClick={() => {
                                        setCustomAddress(suggestion)
                                        setCustomSearchQuery(suggestion)
                                        setShowSuggestions(false)
                                      }}
                                      sx={{
                                        p: 1.25,
                                        fontSize: 12.5,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'rgba(12, 124, 124, 0.05)', color: '#0c7c7c' },
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        '&:last-child': { borderBottom: 'none' }
                                      }}
                                    >
                                      📍 {suggestion}
                                    </Box>
                                  ))
                                ) : (
                                  <Box sx={{ p: 1.5, fontSize: 12, color: 'text.secondary', textAlign: 'center' }}>
                                    No matching locations found
                                  </Box>
                                )}
                              </Paper>
                            )}

                            {savedAddresses.length > 0 && (
                              <Typography
                                variant="caption"
                                color="primary.main"
                                onClick={() => setUseCustomAddress(false)}
                                sx={{ cursor: 'pointer', fontWeight: 700, mt: 0.5, display: 'inline-block', '&:hover': { textDecoration: 'underline' } }}
                              >
                                Back to saved addresses
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Ride Options selection grid cards */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block', letterSpacing: '0.04em' }}>
                  CHOOSE RIDE OPTION
                </Typography>
                {estimatesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={24} sx={{ color: '#0c7c7c' }} />
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {rideEstimates.map((opt) => {
                      const active = selectedRideOption === opt.type
                      return (
                        <Box
                          key={opt.type}
                          onClick={() => setSelectedRideOption(opt.type)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderRadius: '16px',
                            border: '2px solid',
                            borderColor: active ? '#0c7c7c' : 'divider',
                            bgcolor: active ? 'rgba(12, 124, 124, 0.03)' : 'background.paper',
                            boxShadow: active ? '0 4px 12px rgba(12, 124, 124, 0.08)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#0c7c7c',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: active ? '#0c7c7c' : '#F4F9F9', color: active ? '#fff' : '#0c7c7c', width: 40, height: 40, borderRadius: '10px' }}>
                              {opt.type === 'economy' ? <DirectionsCarIcon /> : opt.type === 'comfort' ? <FlightTakeoffIcon /> : <AirportShuttleIcon />}
                            </Avatar>
                            <Box>
                              <Typography fontSize={13.5} fontWeight={700} color="text.primary">
                                {opt.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ETA: {opt.eta} mins • Clean & disinfected NEMT
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography fontSize={15} fontWeight={800} color="text.primary">
                              {formatINR(opt.price)}
                            </Typography>
                            {active && (
                              <Chip
                                label="Selected"
                                size="small"
                                color="primary"
                                icon={<CheckCircleIcon sx={{ '&&': { fontSize: 11, color: '#fff' } }} />}
                                sx={{ height: 16, fontSize: 8.5, fontWeight: 700, mt: 0.5, bgcolor: '#0c7c7c' }}
                              />
                            )}
                          </Box>
                        </Box>
                      )
                    })}
                  </Stack>
                )}
              </Box>

              {/* Medical support requirement pill chips */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block', letterSpacing: '0.04em' }}>
                  ACCESSIBILITY & BOARDING SUPPORT
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                  <Chip
                    label="♿ Wheelchair Access Space"
                    clickable
                    onClick={() => setWheelchair(!wheelchair)}
                    sx={{
                      fontWeight: 700,
                      fontSize: 11.5,
                      borderRadius: '10px',
                      py: 1.8,
                      px: 0.5,
                      bgcolor: wheelchair ? '#00796b' : 'transparent',
                      color: wheelchair ? '#fff' : 'text.primary',
                      border: '1.5px solid',
                      borderColor: wheelchair ? '#00796b' : 'divider',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: wheelchair ? '#004d40' : 'rgba(0,0,0,0.03)' }
                    }}
                  />
                  <Chip
                    label="🤝 Support Helper Assistance"
                    clickable
                    onClick={() => setAssistance(!assistance)}
                    sx={{
                      fontWeight: 700,
                      fontSize: 11.5,
                      borderRadius: '10px',
                      py: 1.8,
                      px: 0.5,
                      bgcolor: assistance ? '#00796b' : 'transparent',
                      color: assistance ? '#fff' : 'text.primary',
                      border: '1.5px solid',
                      borderColor: assistance ? '#00796b' : 'divider',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: assistance ? '#004d40' : 'rgba(0,0,0,0.03)' }
                    }}
                  />
                  <Chip
                    label="👥 Family Caregiver Accompanying"
                    clickable
                    onClick={() => setCompanion(!companion)}
                    sx={{
                      fontWeight: 700,
                      fontSize: 11.5,
                      borderRadius: '10px',
                      py: 1.8,
                      px: 0.5,
                      bgcolor: companion ? '#00796b' : 'transparent',
                      color: companion ? '#fff' : 'text.primary',
                      border: '1.5px solid',
                      borderColor: companion ? '#00796b' : 'divider',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: companion ? '#004d40' : 'rgba(0,0,0,0.03)' }
                    }}
                  />
                </Box>
              </Box>

              {/* Payment coverage dropdown */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block', letterSpacing: '0.04em' }}>
                  PAYMENT COVERAGE
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    sx={{
                      borderRadius: '10px',
                      fontSize: 13,
                      bgcolor: 'background.default',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0c7c7c' }
                    }}
                  >
                    <MenuItem value="pay_now">💳 Pay Now (Card/UPI Online)</MenuItem>
                    <MenuItem value="hospital_bill">📄 Charge to Hospital Bill (Pay at Discharge)</MenuItem>
                    <MenuItem value="insurance">🏥 Claim under Health Insurance (Cashless NEMT)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Price checkout footer */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                    TOTAL FARE
                  </Typography>
                  <Typography fontWeight={900} fontSize={22} color="text.primary">
                    {selectedRideDetails ? formatINR(selectedRideDetails.price) : '—'}
                  </Typography>
                </Box>

                <AppButton
                  label={booking ? 'Booking...' : 'Confirm Cab booking'}
                  disabled={booking || !selectedRideOption}
                  onClick={handleBookRide}
                  borderRadius="12px"
                  sx={{ px: 4, py: 1.2, fontWeight: 700, bgcolor: '#0c7c7c', '&:hover': { bgcolor: '#0f4c4c' } }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel: Split Pane map preview */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 32px rgba(12, 124, 124, 0.06)',
                overflow: 'hidden',
                flex: 1,
                minHeight: { xs: 300, md: '100%' },
                p: 2,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} color="primary.dark" sx={{ mb: 2 }}>
                Live Cab Route & Pin Drops
              </Typography>
                <RideMapTracker
                  status="scheduled"
                  pickupLabel={pickupLabel}
                  dropoffLabel={dropoffLabel}
                  isBookingMode={true}
                  onPickupPinDrag={(address) => {
                    setUseCustomAddress(true)
                    setCustomAddress(address)
                    setCustomSearchQuery(address)
                  }}
                />
            </Paper>
          </Grid>
          
        </Grid>
      </Container>

      {/* Confirmation dialog redirection override */}
      <ConfirmModal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false)
          if (bookingSource === 'radiology') {
            navigate(`/radiology/bookings/${resolvedBookingId}`)
          } else {
            navigate(`/portal/appointments/${resolvedBookingId}`)
          }
        }}
        onConfirm={() => {
          setSuccessOpen(false)
          if (bookingSource === 'radiology') {
            navigate(`/radiology/bookings/${resolvedBookingId}`)
          } else {
            navigate(`/portal/appointments/${resolvedBookingId}`)
          }
        }}
        variant="success"
        title="Cab Booked Successfully"
        description={
          bookingType === 'return'
            ? "Your return ride is confirmed. You can track the driver from your booking details page."
            : "Your onward ride is confirmed. Driver details will be visible on your booking details page shortly."
        }
        confirmLabel="View Ride Status"
        hideCancelButton
      />
    </Box>
  )
}
