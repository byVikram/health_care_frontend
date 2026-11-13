// src/features/patient/PatientAppointmentDetailPage.tsx
//
// Full-page appointment details view for the patient portal.
// Navigated to from the All Appointments tab when a patient clicks
// the info icon on any appointment row.
//
// Data sources:
//   • GET /api/appointments/:id           → appointment details
//   • GET /api/treatments/appointment/:id → treatment / prescription record (optional, 404 is expected)
//
// The prescription section reuses PrescriptionView.tsx, which already
// mirrors the ConsultationNotes.tsx header and card layout used by the
// doctor — so the patient sees exactly the same prescription the doctor
// created during the consultation.

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGoBack } from '../../hooks/useGoBack'
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  Skeleton,
  IconButton,
  Container,
  CircularProgress,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import VideocamIcon from '@mui/icons-material/Videocam'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import SickIcon from '@mui/icons-material/Sick'
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AppButton from '../../components/common/Button/AppButton'
import CareTransitCard from '../careTransit/components/CareTransitCard'

import { getAppointmentById } from '../../services/appointmentService'
import { getTreatmentByAppointment, Treatment } from '../../services/treatmentService'
import { Appointment } from '../../types/appointment'
import { ConsultationDoctor } from '../../types/consultation'
import PrescriptionView from '../consultation/components/PrescriptionView'
import { buildS3Url } from '../../utils/s3'
import { customScrollbar } from '../../styles/commonStyles'
import StatusReasonNote from '../appointments/components/StatusReasonNote'

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`
}

function capitalise(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getStatusSx(status: string): { color: string; bgcolor: string } {
  const s = status.toLowerCase()
  if (s === 'confirmed') return { color: '#2e7d32', bgcolor: '#e8f5e9' }
  if (s === 'cancelled') return { color: '#c62828', bgcolor: '#ffebee' }
  if (s === 'completed') return { color: '#1565c0', bgcolor: '#e3f2fd' }
  if (s === 'rescheduled') return { color: '#e65100', bgcolor: '#fff8e1' }
  return { color: '#6a1b9a', bgcolor: '#f3e5f5' }
}

/** Build a ConsultationDoctor from appointment data to feed into PrescriptionView */
function buildConsultationDoctor(appt: Appointment): ConsultationDoctor {
  const doctor = appt.doctor
  return {
    name: doctor?.name ?? 'Unknown Doctor',
    degree: doctor?.degree ?? '',
    specialization:
      doctor?.speciality ?? doctor?.specialty ?? doctor?.specialization ?? 'Specialist',
    clinicName: appt.hospital?.name ?? '',
    clinicAddress: appt.hospital?.address ?? '',
  }
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Skeleton variant="circular" width={36} height={36} />
        <Skeleton variant="text" width={200} height={28} />
      </Box>

      {/* Doctor card skeleton */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          p: 3,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={64} height={64} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="55%" height={22} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
            <Skeleton variant="text" width="35%" height={16} sx={{ mt: 0.3 }} />
          </Box>
        </Box>
        <Skeleton variant="rounded" height={40} sx={{ borderRadius: '10px' }} />
      </Box>

      {/* Consultation details skeleton */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          p: 3,
          mb: 3,
        }}
      >
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
            <Skeleton variant="circular" width={18} height={18} sx={{ mt: 0.3, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="30%" height={13} />
              <Skeleton variant="text" width="55%" height={18} sx={{ mt: 0.2 }} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Prescription skeleton */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          overflow: 'hidden',
          minHeight: 200,
        }}
      >
        <Skeleton variant="rectangular" height={64} />
        <Box sx={{ p: 2.5 }}>
          <Skeleton variant="text" width="50%" height={18} />
          <Skeleton variant="text" width="35%" height={14} sx={{ mt: 0.5 }} />
          <Skeleton variant="rounded" height={100} sx={{ mt: 2 }} />
        </Box>
      </Box>
    </Container>
  )
}

// ── Info row used in Consultation Details card ─────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.75 }}>
      <Box sx={{ mt: 0.25, color: 'text.secondary', flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: 'block' }}>
          {label}
        </Typography>
        <Typography fontSize={13.5} fontWeight={500} color="text.primary">
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PatientAppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const goBack = useGoBack()

  const [appt, setAppt] = useState<Appointment | null>(null)
  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [apptLoading, setApptLoading] = useState(Boolean(appointmentId))
  const [treatmentLoading, setTreatmentLoading] = useState(Boolean(appointmentId))
  const [apptError, setApptError] = useState<string | null>(null)

  // Fetch appointment details
  useEffect(() => {
    // No appointmentId: leave apptLoading/treatmentLoading at their initial
    // (false) value instead of calling setState synchronously in the effect body.
    if (!appointmentId) return

    let cancelled = false

    const fetchAll = async () => {
      setApptLoading(true)
      setTreatmentLoading(true)
      setApptError(null)

      // Appointment fetch
      getAppointmentById(appointmentId)
        .then((data) => {
          if (!cancelled) setAppt(data)
        })
        .catch(() => {
          if (!cancelled) setApptError('Failed to load appointment details. Please try again.')
        })
        .finally(() => {
          if (!cancelled) setApptLoading(false)
        })

      // Treatment fetch — 404 is normal (not every appointment has a treatment yet)
      getTreatmentByAppointment(appointmentId)
        .then((data) => {
          if (!cancelled) setTreatment(data)
        })
        .catch(() => {
          if (!cancelled) setTreatment(null)
        })
        .finally(() => {
          if (!cancelled) setTreatmentLoading(false)
        })
    }

    fetchAll()

    return () => {
      cancelled = true
    }
  }, [appointmentId])

  // ── Derived values ───────────────────────────────────────────────────────────

  const rawStatus = appt
    ? typeof appt.status === 'string'
      ? appt.status
      : (appt.status as { label: string }).label
    : ''

  const statusSx = getStatusSx(rawStatus)

  const isVideo = appt?.appointment_mode === 'video call'

  const symptoms =
    appt?.pre_intake?.symptoms ||
    appt?.symptoms ||
    null

  const consultationDoctor: ConsultationDoctor | null = appt ? buildConsultationDoctor(appt) : null

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (apptLoading) return <PageSkeleton />

  // ── Error ────────────────────────────────────────────────────────────────────

  if (apptError || !appt) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 4,
        }}
      >
        <MedicalInformationIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
        <Typography fontWeight={600} fontSize={16} color="text.secondary" textAlign="center">
          {apptError ?? 'Appointment not found.'}
        </Typography>
        <Typography
          fontSize={13}
          color="primary.main"
          sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
          onClick={() => goBack()}
        >
          ← Go Back
        </Typography>
      </Box>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        overflowY: 'auto',
        ...customScrollbar,
      }}
    >
      {/* ── Sticky page header ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <IconButton
          size="small"
          onClick={() => goBack()}
          sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 15 }} />
        </IconButton>
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          Appointment Details
        </Typography>
        {rawStatus && (
          <Chip
            label={capitalise(rawStatus)}
            size="small"
            sx={{
              ml: 'auto',
              height: 24,
              fontSize: 11,
              fontWeight: 700,
              borderRadius: '8px',
              ...statusSx,
              '& .MuiChip-label': { px: 1.2 },
            }}
          />
        )}
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 4 } }}>
        <Grid container spacing={3} alignItems="stretch">
          {/* ── LEFT COLUMN: Doctor Info + Consultation Details ───────────── */}
          <Grid size={{ xs: 12, md: 5 }}>
            {/* Shared CareTransit Card */}
            {appt?.id && (
              <CareTransitCard
                bookingId={appt.id}
                bookingType="doctor"
                bookingUrl={`/portal/appointments/${appt.id}/book-ride`}
                isClinicVisit={appt.appointment_mode === 'clinic visit' || appt.appointment_mode === 'clinic_visit'}
              />
            )}

            {/* Doctor Information Card */}
            <Box
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                overflow: 'hidden',
                mb: 3,
              }}
            >
              {/* Teal accent bar */}
              <Box sx={{ height: 4, bgcolor: 'primary.main' }} />

              <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Typography
                  variant="overline"
                  sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em' }}
                >
                  Doctor Information
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: 1.5 }}>
                  {/* Doctor avatar */}
                  <Avatar
                    src={buildS3Url(appt.doctor?.avatar_s3_key) || undefined}
                    alt={appt.doctor?.name ?? 'Doctor'}
                    sx={{
                      width: 68,
                      height: 68,
                      border: '2px solid',
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                      fontSize: 24,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(appt.doctor?.name ?? 'D').charAt(0).toUpperCase()}
                  </Avatar>

                  {/* Doctor info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={16} color="text.primary" sx={{ lineHeight: 1.3 }}>
                      {appt.doctor?.name ?? 'Unknown Doctor'}
                      {appt.doctor?.degree ? (
                        <Typography
                          component="span"
                          sx={{ fontWeight: 400, fontSize: 12.5, color: 'text.secondary', ml: 0.75 }}
                        >
                          {appt.doctor.degree}
                        </Typography>
                      ) : null}
                    </Typography>

                    {(appt.doctor?.speciality || appt.doctor?.specialty || appt.doctor?.specialization) && (
                      <Typography fontSize={12.5} color="primary.main" fontWeight={500} sx={{ mt: 0.3 }}>
                        {appt.doctor.speciality ?? appt.doctor.specialty ?? appt.doctor.specialization}
                      </Typography>
                    )}

                    {appt.hospital && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 0.75 }}>
                        <LocationOnIcon sx={{ fontSize: 13, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
                        <Box>
                          <Typography fontSize={12.5} fontWeight={600} color="text.primary">
                            {appt.hospital.name}
                          </Typography>
                          {appt.hospital.address && (
                            <Typography fontSize={11.5} color="text.secondary">
                              {appt.hospital.address}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Consultation Details Card */}
            <Box
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                p: { xs: 2, sm: 2.5 },
              }}
            >
              <Typography
                variant="overline"
                sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em', display: 'block', mb: 1 }}
              >
                Consultation Details
              </Typography>

              <Divider sx={{ mb: 1.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <InfoRow
                  icon={<CalendarTodayIcon sx={{ fontSize: 15 }} />}
                  label="Date"
                  value={formatDate(appt.appointment_date)}
                />

                <InfoRow
                  icon={<AccessTimeIcon sx={{ fontSize: 15 }} />}
                  label="Time"
                  value={`${formatTime(appt.start_time)}${appt.end_time ? ' – ' + formatTime(appt.end_time) : ''}`}
                />

                <InfoRow
                  icon={isVideo ? <VideocamIcon sx={{ fontSize: 15 }} /> : <LocalHospitalIcon sx={{ fontSize: 15 }} />}
                  label="Consultation Type"
                  value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography fontSize={13} fontWeight={500}>
                        {isVideo ? 'Video Consultation' : 'In-Person / Clinic Visit'}
                      </Typography>
                      <Chip
                        label={isVideo ? 'Online' : 'In-Person'}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 600,
                          bgcolor: isVideo ? '#e3f2fd' : '#e8f5e9',
                          color: isVideo ? '#1565c0' : '#2e7d32',
                          '& .MuiChip-label': { px: 0.8 },
                        }}
                      />
                    </Box>
                  }
                />

                <InfoRow
                  icon={<MedicalInformationIcon sx={{ fontSize: 15 }} />}
                  label="Status"
                  value={
                    <Chip
                      label={capitalise(rawStatus || 'pending')}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: '8px',
                        ...statusSx,
                        '& .MuiChip-label': { px: 1.2 },
                      }}
                    />
                  }
                />

                <StatusReasonNote status={rawStatus} title={appt.status_reason_title} reason={appt.status_reason} />

                {appt.fees != null && (
                  <InfoRow
                    icon={<CurrencyRupeeIcon sx={{ fontSize: 15 }} />}
                    label="Consultation Fee"
                    value={`₹${appt.fees}`}
                  />
                )}

                {symptoms && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <InfoRow
                      icon={<SickIcon sx={{ fontSize: 15 }} />}
                      label="Symptoms / Reason for Visit"
                      value={
                        <Typography fontSize={13} fontWeight={400} color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {symptoms}
                        </Typography>
                      }
                    />
                  </>
                )}
              </Box>
            </Box>
          </Grid>

          {/* ── RIGHT COLUMN: Prescription & Consultation Notes ───────────── */}
          <Grid size={{ xs: 12, md: 7 }} display="flex" flexDirection="column">
            <Typography
              variant="overline"
              sx={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'text.secondary',
                letterSpacing: '0.08em',
                display: 'block',
                mb: 1.5,
              }}
            >
              Doctor's Prescription &amp; Consultation Notes
            </Typography>

            {/* PrescriptionView grows to fill the remaining column height */}
            {consultationDoctor && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <PrescriptionView
                  doctor={consultationDoctor}
                  treatment={treatment}
                  loading={treatmentLoading}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
