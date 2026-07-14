import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Alert,
    Avatar,
    Box,
    Card,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    MenuItem,
    Select,
    SelectChangeEvent,
    Snackbar,
    Stack,
    Switch,
    Tooltip,
    Typography,
} from '@mui/material'
import {
    AddCircleOutline,
    ArrowBack,
    AssignmentTurnedIn,
    Cancel,
    CheckCircle,
    DeleteOutline,
    Inventory2,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    LocalShipping,
    NotificationsActive,
    Verified,
} from '@mui/icons-material'

import AppButton from '../../../components/common/Button/AppButton'
import AppDatePicker from '../../../components/common/DatePicker/AppDatePicker'
import AppInput from '../../../components/common/Input/AppInput'
import AppTable from '../../../components/common/Table/AppTable'
import SectionCard from '../../../components/common/Card/SectionCard'
import prescriptionImage from '../../../assets/Pharmacy/Prescription.svg'
import { buildS3Url } from '../../../utils/s3'

import {
    getPharmacyOrderById,
    sendPharmacyOrderReminder,
    updatePharmacyOrderMedicines,
    updatePharmacyOrderStatus,
} from '../pharmacyService'
import { useAuth } from '../../../hooks/useAuth'
import { USER_ROLES } from '../../../constants/constants'

// ── Types ────────────────────────────────────────────────────────────────────

interface MedicineRow {
    id: string
    medication: string
    frequency: string
    totalTablets: number
    purchasedTablets: number
    instructions: string
}

type MedicineTableRow = MedicineRow & Record<string, unknown>

interface StatusOption {
    value: string
    label: string
    color: string
    bg: string
}

interface PrescriptionItem {
    id?: string
    url?: string
    image_url?: string
    imageUrl?: string
    s3_key?: string
    prescription_s3_key?: string
}

interface OrderData {
    id: string
    public_id?: string
    status: string
    bill_amount?: number
    created_at?: string
    delivery_type?: string
    delivery_address?: string | null
    notes?: string | null
    medicines?: Partial<MedicineRow>[]
    prescriptions?: PrescriptionItem[]
    prescription_urls?: string[]
    prescription_s3_keys?: string[]
    prescription_s3_key?: string | null

    patient?: {
        id?: string
        name?: string
        avatar_s3_key?: string | null
        gender?: string | null
        age?: number | null
        blood_group?: string | null
        weight?: string | number | null
        allergies?: string | null
        mobile?: string | null
        phone?: string | null
        emergency_contact?: string | null
    }

    pharmacy?: {
        id?: string
        name?: string
        avatar_s3_key?: string | null
        alternate_mobile?: string | null
        address?: string | null
        city?: string | null
    }

    clinic?: {
        name?: string
        doctor_name?: string
        phone?: string
    }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const statusOptions: StatusOption[] = [
    { value: 'pending',   label: 'Pending',   color: '#D97706', bg: '#FEF3C7' },
    { value: 'packed',    label: 'Packed',    color: '#2563EB', bg: '#DBEAFE' },
    { value: 'collected', label: 'Collected', color: '#16A34A', bg: '#DCFCE7' },
    { value: 'rejected',  label: 'Rejected',  color: '#DC2626', bg: '#FEE2E2' },
]

const getStatusChipSx = (status: string) => {
    const opt = statusOptions.find((s) => s.value === status.toLowerCase())
    return opt ? { bgcolor: opt.bg, color: opt.color } : { bgcolor: '#F5F5F5', color: '#616161' }
}

const timelineSteps = [
    { key: 'order_created',          label: 'Order Created',          icon: <AssignmentTurnedIn fontSize="small" /> },
    { key: 'prescription_verified',  label: 'Prescription Verified',  icon: <Verified fontSize="small" /> },
    { key: 'packed',                 label: 'Packed',                 icon: <Inventory2 fontSize="small" /> },
    { key: 'collected',              label: 'Collected / Delivered',  icon: <LocalShipping fontSize="small" /> },
]

const getCompletedSteps = (status: string): string[] => {
    switch (status.toLowerCase()) {
        case 'pending':   return ['order_created', 'prescription_verified']
        case 'packed':    return ['order_created', 'prescription_verified', 'packed']
        case 'collected': return ['order_created', 'prescription_verified', 'packed', 'collected']
        case 'rejected':  return ['order_created']
        default:          return ['order_created']
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const createEmptyMedicineRow = (): MedicineRow => ({
    id: crypto.randomUUID(),
    medication: '',
    frequency: '',
    totalTablets: 0,
    purchasedTablets: 0,
    instructions: '',
})

const normalizeMedicines = (medicines?: Partial<MedicineRow>[]): MedicineRow[] => {
    if (!medicines?.length) return []
    return medicines.map((m) => ({
        id: m.id || crypto.randomUUID(),
        medication: m.medication || '',
        frequency: m.frequency || '',
        totalTablets: Number(m.totalTablets || 0),
        purchasedTablets: Number(m.purchasedTablets || 0),
        instructions: m.instructions || '',
    }))
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PharmacyPrescriptionDashboard() {
    const { orderId } = useParams<{ orderId: string }>()
    const navigate = useNavigate()
    const { role } = useAuth()
    const isPharmacyStaff = role === USER_ROLES.PHARMACY

    // Core state
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [orderData, setOrderData] = useState<OrderData | null>(null)
    const [status, setStatus] = useState('pending')
    const [updatingStatus, setUpdatingStatus] = useState(false)

    // Medicine table state
    const [medicineRows, setMedicineRows] = useState<MedicineRow[]>([])
    const [savingMedicines, setSavingMedicines] = useState(false)

    // Prescription carousel state
    const [selectedPrescriptionIndex, setSelectedPrescriptionIndex] = useState(0)

    // Reminder state
    const [reminderDate, setReminderDate] = useState(
        () => new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    )
    const [autoNotify, setAutoNotify] = useState(true)
    const [sendingReminder, setSendingReminder] = useState(false)

    // Toast
    const [toast, setToast] = useState<{
        open: boolean; message: string; severity: 'success' | 'info' | 'error'
    }>({ open: false, message: '', severity: 'success' })

    const showToast = useCallback((message: string, severity: 'success' | 'info' | 'error') => {
        setToast({ open: true, message, severity })
    }, [])

    // ── Data fetch ────────────────────────────────────────────────────────────

    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) {
            setError('Order ID is missing.')
            setLoading(false)
            return
        }
        setLoading(true)
        setError(null)
        try {
            const result = await getPharmacyOrderById(orderId)
            if (!result.success || !result.data) {
                throw new Error(result.message || 'Failed to load order details')
            }
            const order = result.data as OrderData
            setOrderData(order)
            setStatus(order.status?.toLowerCase() || 'pending')
            setMedicineRows(normalizeMedicines(order.medicines))
            setSelectedPrescriptionIndex(0)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load order details')
        } finally {
            setLoading(false)
        }
    }, [orderId])

    useEffect(() => { fetchOrderDetails() }, [fetchOrderDetails])

    // ── Prescription sources ───────────────────────────────────────────────────

    const prescriptionSources = useMemo(() => {
        const sources: string[] = []
        orderData?.prescriptions?.forEach((item) => {
            const directUrl = item.url || item.image_url || item.imageUrl
            const s3Key = item.s3_key || item.prescription_s3_key
            const resolved = directUrl || buildS3Url(s3Key)
            if (resolved) sources.push(resolved)
        })
        orderData?.prescription_urls?.forEach((url) => { if (url) sources.push(url) })
        orderData?.prescription_s3_keys?.forEach((key) => {
            const url = buildS3Url(key)
            if (url) sources.push(url)
        })
        const single = buildS3Url(orderData?.prescription_s3_key)
        if (single) sources.push(single)
        const unique = Array.from(new Set(sources))
        return unique.length ? unique : null
    }, [orderData])

    // ── Derived data ──────────────────────────────────────────────────────────

    const patientData = useMemo(() => {
        const p = orderData?.patient
        return {
            name: p?.name || 'Patient',
            id: p?.id || orderData?.id || '—',
            age: p?.age ?? '—',
            gender: p?.gender || '—',
            bloodGroup: p?.blood_group || '—',
            weight: p?.weight ? `${p.weight} kg` : '—',
            allergies: p?.allergies || 'No Known Allergies',
            phone: p?.mobile || p?.phone || '—',
            emergencyContact: p?.emergency_contact || '—',
            avatarUrl: p?.avatar_s3_key
                ? buildS3Url(p.avatar_s3_key) || undefined
                : p?.avatar
                    ? buildS3Url(p.avatar) || undefined
                    : undefined,
            orderDate: orderData?.created_at
                ? new Date(orderData.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—',
            clinicName: orderData?.clinic?.name || orderData?.clinic?.doctor_name || '—',
            pharmacyName: orderData?.pharmacy?.name || '—',
        }
    }, [orderData])

    const prescribedDays = useMemo(
        () => (medicineRows.length ? Math.max(...medicineRows.map((r) => Number(r.totalTablets || 0))) : 0),
        [medicineRows]
    )
    const purchasedDays = useMemo(
        () => (medicineRows.length ? Math.max(...medicineRows.map((r) => Number(r.purchasedTablets || 0))) : 0),
        [medicineRows]
    )
    const reminderOffsetDays = Math.max(purchasedDays - 2, 0)

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleStatusChange = async (event: SelectChangeEvent) => {
        if (!orderData) return
        const newStatus = event.target.value
        setUpdatingStatus(true)
        try {
            const result = await updatePharmacyOrderStatus(orderData.id, { status: newStatus })
            if (!result.success) throw new Error(result.message || 'Status update failed')
            setStatus(newStatus)
            setOrderData((prev) => (prev ? { ...prev, status: newStatus } : prev))
            showToast(`Status updated to ${statusOptions.find((s) => s.value === newStatus)?.label}`, 'success')
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to update status', 'error')
        } finally {
            setUpdatingStatus(false)
        }
    }

    const saveMedicines = useCallback(async (rows: MedicineRow[]) => {
        if (!orderData) return
        setSavingMedicines(true)
        try {
            const result = await updatePharmacyOrderMedicines(orderData.id, {
                medicines: rows.map((row) => ({
                    id: row.id,
                    medication: row.medication.trim(),
                    frequency: row.frequency.trim(),
                    totalTablets: Number(row.totalTablets || 0),
                    purchasedTablets: Number(row.purchasedTablets || 0),
                    instructions: row.instructions.trim(),
                })),
            })
            if (!result.success) throw new Error(result.message || 'Failed to save medicines')
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to save medicines', 'error')
        } finally {
            setSavingMedicines(false)
        }
    }, [orderData, showToast])

    const addMedicineRow = useCallback(() => {
        setMedicineRows((prev) => [...prev, createEmptyMedicineRow()])
    }, [])

    const removeMedicineRow = useCallback(async (id: string) => {
        const updated = medicineRows.filter((r) => r.id !== id)
        setMedicineRows(updated)
        await saveMedicines(updated)
        showToast('Medicine row removed', 'info')
    }, [medicineRows, saveMedicines, showToast])

    const updateMedicineRow = useCallback((id: string, field: keyof MedicineRow, value: string | number) => {
        setMedicineRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
    }, [])

    const handleMedicineBlur = useCallback(async () => {
        const validRows = medicineRows.filter((r) => r.medication.trim())
        if (!validRows.length) return
        await saveMedicines(medicineRows)
    }, [medicineRows, saveMedicines])

    const handleSendReminder = async () => {
        if (!orderData) return
        setSendingReminder(true)
        try {
            const result = await sendPharmacyOrderReminder(orderData.id, { reminderDate, autoNotify })
            if (!result.success) throw new Error(result.message || 'Reminder failed')
            showToast(`Reminder scheduled for ${new Date(reminderDate).toLocaleDateString()}`, 'success')
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to send reminder', 'error')
        } finally {
            setSendingReminder(false)
        }
    }

    const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }))

    const medicineColumns = useMemo(() => [
        {
            field: 'medication',
            label: 'Medication',
            render: (_: unknown, row: MedicineTableRow) =>
                isPharmacyStaff ? (
                    <AppInput
                        value={row.medication}
                        onBlur={handleMedicineBlur}
                        onChange={(e) => updateMedicineRow(row.id, 'medication', e.target.value)}
                        placeholder="e.g., Augmentin 625mg"
                    />
                ) : (
                    <Typography fontSize={13} fontWeight={600}>{row.medication || '—'}</Typography>
                ),
        },
        {
            field: 'frequency',
            label: 'Frequency',
            render: (_: unknown, row: MedicineTableRow) =>
                isPharmacyStaff ? (
                    <AppInput
                        value={row.frequency}
                        onBlur={handleMedicineBlur}
                        onChange={(e) => updateMedicineRow(row.id, 'frequency', e.target.value)}
                        placeholder="e.g., 1-0-1"
                    />
                ) : (
                    <Typography fontSize={13}>{row.frequency || '—'}</Typography>
                ),
        },
        {
            field: 'totalTablets',
            label: 'Total',
            render: (_: unknown, row: MedicineTableRow) =>
                isPharmacyStaff ? (
                    <AppInput
                        type="number"
                        value={row.totalTablets}
                        onBlur={handleMedicineBlur}
                        onChange={(e) => updateMedicineRow(row.id, 'totalTablets', parseInt(e.target.value) || 0)}
                    />
                ) : (
                    <Typography fontSize={13}>{row.totalTablets}</Typography>
                ),
        },
        {
            field: 'purchasedTablets',
            label: 'Dispensed',
            render: (_: unknown, row: MedicineTableRow) =>
                isPharmacyStaff ? (
                    <AppInput
                        type="number"
                        value={row.purchasedTablets}
                        onBlur={handleMedicineBlur}
                        onChange={(e) => updateMedicineRow(row.id, 'purchasedTablets', parseInt(e.target.value) || 0)}
                    />
                ) : (
                    <Typography fontSize={13}>{row.purchasedTablets}</Typography>
                ),
        },
        {
            field: 'instructions',
            label: 'Instructions',
            render: (_: unknown, row: MedicineTableRow) =>
                isPharmacyStaff ? (
                    <AppInput
                        value={row.instructions}
                        onBlur={handleMedicineBlur}
                        onChange={(e) => updateMedicineRow(row.id, 'instructions', e.target.value)}
                        placeholder="e.g., After food"
                    />
                ) : (
                    <Typography fontSize={13}>{row.instructions || '—'}</Typography>
                ),
        },
        ...(isPharmacyStaff ? [{
            field: 'actions',
            label: '',
            align: 'center' as const,
            render: (_: unknown, row: MedicineTableRow) => (
                <Tooltip title="Remove">
                    <IconButton onClick={() => removeMedicineRow(row.id)} size="small" color="error">
                        <DeleteOutline fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        }] : []),
    ], [handleMedicineBlur, isPharmacyStaff, removeMedicineRow, updateMedicineRow])

    // ── Loading / Error states ─────────────────────────────────────────────────

    if (loading && !orderData) {
        return (
            <Box sx={{ p: 4, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#00796B' }} />
            </Box>
        )
    }

    if (error || !orderData) {
        return (
            <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#F4F9F9' }}>
                <AppButton
                    label="Back to Orders"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/pharmacy/orders')}
                    sx={{ mb: 2 }}
                />
                <Alert severity="error" action={
                    <AppButton label="Retry" size="small" onClick={fetchOrderDetails}
                        sx={{ color: 'inherit', bgcolor: 'transparent', boxShadow: 'none' }}
                    />
                }>
                    {error || 'Order details not found.'}
                </Alert>
            </Box>
        )
    }

    const completedSteps = getCompletedSteps(status)

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F4F9F9', minHeight: '100vh' }}>

            {/* ── Page header ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color="primary.dark">
                            Order Details
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Ref: {orderData.public_id || orderData.id}
                        </Typography>
                    </Box>
                </Box>
                <Chip
                    label={statusOptions.find((s) => s.value === status)?.label || status}
                    sx={{ ...getStatusChipSx(status), fontWeight: 700, px: 1 }}
                />
            </Box>

            <Grid container spacing={3}>

                {/* ══ LEFT COLUMN (8/12) ══════════════════════════════════════ */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>

                        {/* Patient Details */}
                        <SectionCard title="Patient Details">
                            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                                {/* Avatar */}
                                <Avatar
                                    src={patientData.avatarUrl}
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        background: patientData.avatarUrl ? undefined : 'linear-gradient(135deg, #00796B 0%, #004D40 100%)',
                                        fontWeight: 700,
                                        fontSize: 22,
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 14px rgba(0,121,107,0.25)',
                                        border: '2px solid #E0F2F1',
                                    }}
                                >
                                    {patientData.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                            {patientData.name}
                                        </Typography>
                                        {patientData.allergies !== 'No Known Allergies' && (
                                            <Chip
                                                label={patientData.allergies}
                                                size="small"
                                                sx={{ height: 22, bgcolor: '#FFE4E2', color: '#D32F2F', fontWeight: 500 }}
                                            />
                                        )}
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6, sm: 4 }}>
                                            <Typography variant="caption" color="text.secondary">Order Date</Typography>
                                            <Typography variant="body2" fontWeight={600}>{patientData.orderDate}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 4 }}>
                                            <Typography variant="caption" color="text.secondary">Delivery Type</Typography>
                                            <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                                                {orderData.delivery_type ? orderData.delivery_type.replace(/_/g, ' ') : '—'}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 4 }}>
                                            <Typography variant="caption" color="text.secondary">Age / Gender</Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {patientData.age !== '—' ? `${patientData.age} yrs` : '—'} / {patientData.gender}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 4 }}>
                                            <Typography variant="caption" color="text.secondary">Phone</Typography>
                                            <Typography variant="body2" fontWeight={600}>{patientData.phone}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 4 }}>
                                            <Typography variant="caption" color="text.secondary">Clinic</Typography>
                                            <Typography variant="body2" fontWeight={600}>{patientData.clinicName}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 4 }}>
                                            <Typography variant="caption" color="text.secondary">Pharmacy</Typography>
                                            <Typography variant="body2" fontWeight={600}>{patientData.pharmacyName}</Typography>
                                        </Grid>
                                    </Grid>
                                    {/* Notes row */}
                                    {orderData.notes && (
                                        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#F8FCFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>Patient Notes:</Typography>
                                            <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>{orderData.notes}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </SectionCard>

                        {/* Prescription */}
                        <SectionCard title="Prescription">
                            <Card
                                elevation={0}
                                sx={{
                                    bgcolor: '#F8FCFC',
                                    borderRadius: 1.5,
                                    border: '1px solid #E2E8F0',
                                    position: 'relative',
                                    minHeight: 220,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    p: 1,
                                }}
                            >
                                {/* Prev arrow */}
                                {prescriptionSources && prescriptionSources.length > 1 && (
                                    <Tooltip title="Previous">
                                        <IconButton
                                            size="small"
                                            onClick={() => setSelectedPrescriptionIndex((p) => (p === 0 ? prescriptionSources.length - 1 : p - 1))}
                                            sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: '#FFFFFF', boxShadow: '0 3px 10px rgba(15,23,42,.12)', '&:hover': { bgcolor: '#E0F2F1' } }}
                                        >
                                            <KeyboardArrowLeft />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                <img
                                    src={prescriptionSources ? prescriptionSources[selectedPrescriptionIndex] : prescriptionImage}
                                    alt={`Prescription ${selectedPrescriptionIndex + 1}`}
                                    style={{ maxWidth: '100%', maxHeight: '260px', objectFit: 'contain', borderRadius: '8px' }}
                                />

                                {/* Next arrow + counter */}
                                {prescriptionSources && prescriptionSources.length > 1 && (
                                    <>
                                        <Tooltip title="Next">
                                            <IconButton
                                                size="small"
                                                onClick={() => setSelectedPrescriptionIndex((p) => (p === prescriptionSources.length - 1 ? 0 : p + 1))}
                                                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: '#FFFFFF', boxShadow: '0 3px 10px rgba(15,23,42,.12)', '&:hover': { bgcolor: '#E0F2F1' } }}
                                            >
                                                <KeyboardArrowRight />
                                            </IconButton>
                                        </Tooltip>
                                        <Chip
                                            label={`${selectedPrescriptionIndex + 1} / ${prescriptionSources.length}`}
                                            size="small"
                                            sx={{ position: 'absolute', bottom: 8, right: 8, height: 22, bgcolor: '#FFFFFF', color: '#00796B', fontWeight: 700 }}
                                        />
                                    </>
                                )}

                                {!prescriptionSources && (
                                    <Typography variant="body2" color="text.secondary" sx={{ position: 'absolute', bottom: 10 }}>
                                        No prescription attached
                                    </Typography>
                                )}
                            </Card>
                        </SectionCard>

                        {/* Medicines */}
                        <SectionCard title="Medicines">
                            {isPharmacyStaff && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                                    <AppButton
                                        label="Add Medicine"
                                        size="small"
                                        startIcon={<AddCircleOutline />}
                                        onClick={addMedicineRow}
                                        disabled={savingMedicines}
                                        sx={{ bgcolor: '#00796B', '&:hover': { bgcolor: '#00695C' } }}
                                    />
                                </Box>
                            )}
                            <AppTable<MedicineTableRow>
                                columns={medicineColumns}
                                rows={medicineRows as MedicineTableRow[]}
                                emptyMessage={isPharmacyStaff ? 'No medicines added. Click Add Medicine to start.' : 'No medicines listed.'}
                            />
                            {orderData.bill_amount != null && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={700} color="primary.dark">
                                        Bill Amount: ₹{orderData.bill_amount.toLocaleString('en-IN')}
                                    </Typography>
                                </Box>
                            )}
                        </SectionCard>

                    </Stack>
                </Grid>

                {/* ══ RIGHT COLUMN (4/12) ═════════════════════════════════════ */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>

                        {/* Order Status */}
                        <SectionCard title="Order Status">
                            {/* Status change dropdown — pharmacy staff only */}
                            {isPharmacyStaff ? (
                                <Box sx={{ mb: 2.5 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.75, display: 'block' }}>
                                        Change Status
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={status}
                                            onChange={handleStatusChange}
                                            disabled={updatingStatus}
                                            sx={{
                                                '& .MuiSelect-select': {
                                                    py: 1,
                                                    bgcolor: statusOptions.find((s) => s.value === status)?.bg,
                                                    color: statusOptions.find((s) => s.value === status)?.color,
                                                    fontWeight: 600,
                                                },
                                            }}
                                        >
                                            {statusOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: option.color }} />
                                                        {option.label}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            ) : (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Current Status</Typography>
                                    <Box sx={{
                                        mt: 0.5, px: 1.5, py: 0.75, borderRadius: 2, display: 'inline-block',
                                        bgcolor: statusOptions.find((s) => s.value === status)?.bg || '#F5F5F5',
                                        color: statusOptions.find((s) => s.value === status)?.color || '#616161',
                                        fontWeight: 700, fontSize: 13,
                                    }}>
                                        {statusOptions.find((s) => s.value === status)?.label || status}
                                    </Box>
                                </Box>
                            )}

                            {/* Workflow timeline */}
                            <Box sx={{ pl: 1 }}>
                                {timelineSteps.map((step, idx) => {
                                    const isCompleted = completedSteps.includes(step.key)
                                    const isLast = idx === timelineSteps.length - 1
                                    const isRejected = status === 'rejected' && step.key === 'order_created'
                                    return (
                                        <Box key={step.key} sx={{ position: 'relative', pb: isLast ? 0 : 2.5 }}>
                                            {!isLast && (
                                                <Box sx={{
                                                    position: 'absolute', left: 12, top: 24, bottom: 0, width: 2,
                                                    bgcolor: isCompleted ? '#00796B' : '#E2E8F0', zIndex: 0,
                                                }} />
                                            )}
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <Box sx={{
                                                    width: 26, height: 26, borderRadius: '50%', zIndex: 1,
                                                    bgcolor: isRejected ? '#FEE2E2' : isCompleted ? '#E0F2F1' : '#F1F5F9',
                                                    color: isRejected ? '#DC2626' : isCompleted ? '#00796B' : '#94A3B8',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {isRejected ? <Cancel fontSize="small" /> : step.icon}
                                                </Box>
                                                <Box sx={{ flex: 1, mt: 0.25 }}>
                                                    <Typography variant="body2" fontWeight={isCompleted ? 600 : 400}
                                                        color={isCompleted ? 'text.primary' : 'text.secondary'}>
                                                        {step.label}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {isCompleted
                                                            ? (isRejected ? 'Rejected' : 'Done')
                                                            : 'Pending'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )
                                })}

                                {status === 'rejected' && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                                        <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                                            <Cancel fontSize="small" />
                                        </Box>
                                        <Typography variant="body2" fontWeight={600} color="error.main">Order Rejected</Typography>
                                    </Box>
                                )}
                                {status === 'collected' && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                                        <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                                            <CheckCircle fontSize="small" />
                                        </Box>
                                        <Typography variant="body2" fontWeight={600} color="success.main">Order Completed</Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Delivery info */}
                            {orderData.delivery_type && (
                                <Box sx={{ mt: 2.5, p: 1.5, bgcolor: '#F8FCFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Delivery Type</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize', mt: 0.25 }}>
                                        {orderData.delivery_type.replace(/_/g, ' ')}
                                    </Typography>
                                    {orderData.delivery_address && (
                                        <>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mt: 1, display: 'block' }}>Address</Typography>
                                            <Typography variant="body2" sx={{ mt: 0.25 }}>{orderData.delivery_address}</Typography>
                                        </>
                                    )}
                                </Box>
                            )}
                        </SectionCard>

                        {/* Medicine Reminder — pharmacy staff only */}
                        {isPharmacyStaff && (
                            <SectionCard title="Medicine Reminder">
                                <Stack spacing={1.75}>
                                    <Box sx={{ bgcolor: '#F0FDF4', p: 1.25, borderRadius: 1.5 }}>
                                        <Typography variant="body2" color="success.dark" fontWeight={500}>
                                            Doctor prescribed: {prescribedDays} days
                                        </Typography>
                                        <Typography variant="body2" color="success.dark" fontWeight={500}>
                                            Dispensed: {purchasedDays} days
                                        </Typography>
                                        <Typography variant="body2" color="warning.dark" fontWeight={500} sx={{ mt: 0.25 }}>
                                            Remind patient after {reminderOffsetDays} days (stock low)
                                        </Typography>
                                    </Box>

                                    <AppDatePicker
                                        label="Reminder Date"
                                        value={reminderDate}
                                        onChange={(value) => setReminderDate(value || '')}
                                        format="YYYY-MM-DD"
                                    />

                                    <FormControlLabel
                                        sx={{ m: 0 }}
                                        control={
                                            <Switch
                                                size="small"
                                                checked={autoNotify}
                                                onChange={(e) => setAutoNotify(e.target.checked)}
                                                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00796B' } }}
                                            />
                                        }
                                        label="Auto Notify Patient"
                                    />

                                    <AppButton
                                        label={sendingReminder ? 'Sending...' : 'Send Reminder Now'}
                                        size="small"
                                        startIcon={
                                            sendingReminder
                                                ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} />
                                                : <NotificationsActive />
                                        }
                                        onClick={handleSendReminder}
                                        disabled={sendingReminder}
                                        sx={{ width: '100%', bgcolor: '#00796B', '&:hover': { bgcolor: '#00695C' } }}
                                    />
                                </Stack>
                            </SectionCard>
                        )}

                    </Stack>
                </Grid>
            </Grid>

            {/* Toast */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 7 }}
            >
                <Alert
                    onClose={handleCloseToast}
                    severity={toast.severity}
                    sx={{ width: '100%', borderRadius: 1.5, boxShadow: 3 }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}
