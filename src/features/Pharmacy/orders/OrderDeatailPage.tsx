import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardContent,
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
    AssignmentTurnedIn,
    Cancel,
    DeleteOutline,
    Emergency,
    Inventory2,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    LocalHospital,
    LocalShipping,
    NotificationsActive,
    Person,
    Phone,
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
import { customCardStyle } from '../../../styles/commonStyles'

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
    status: string
    bill_amount?: number
    created_at?: string
    delivery_type?: string
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

const statusOptions: StatusOption[] = [
    { value: 'pending', label: 'Pending', color: '#D97706', bg: '#FEF3C7' },
    { value: 'packed', label: 'Packed', color: '#2563EB', bg: '#DBEAFE' },
    { value: 'collected', label: 'Collected', color: '#16A34A', bg: '#DCFCE7' },
    { value: 'rejected', label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
]

const timelineSteps = [
    { key: 'order_created', label: 'Order Created', icon: <AssignmentTurnedIn fontSize="small" /> },
    { key: 'prescription_verified', label: 'Prescription Verified', icon: <Verified fontSize="small" /> },
    { key: 'packed', label: 'Packed', icon: <Inventory2 fontSize="small" /> },
    { key: 'collected', label: 'Collected', icon: <LocalShipping fontSize="small" /> },
]

const getCompletedSteps = (status: string): string[] => {
    switch (status) {
        case 'pending':
            return ['order_created', 'prescription_verified']
        case 'packed':
            return ['order_created', 'prescription_verified', 'packed']
        case 'collected':
            return ['order_created', 'prescription_verified', 'packed', 'collected']
        case 'rejected':
            return ['order_created']
        default:
            return ['order_created']
    }
}

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

    return medicines.map((medicine) => ({
        id: medicine.id || crypto.randomUUID(),
        medication: medicine.medication || '',
        frequency: medicine.frequency || '',
        totalTablets: Number(medicine.totalTablets || 0),
        purchasedTablets: Number(medicine.purchasedTablets || 0),
        instructions: medicine.instructions || '',
    }))
}

// const SectionCard = ({ title, children }: { title: string; children: ReactNode }) => (
//     <Card sx={{ ...customCardStyle, height: '100%' }}>
//         <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
//             <Typography variant="subtitle2" fontWeight={700} color="#1E2A2A" sx={{ mb: 1.25 }}>
//                 {title}
//             </Typography>
//             {children}
//         </CardContent>
//     </Card>
// )

export default function PharmacyPrescriptionDashboard() {
    const { orderId } = useParams<{ orderId: string }>()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [orderData, setOrderData] = useState<OrderData | null>(null)
    const [status, setStatus] = useState('pending')
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [savingMedicines, setSavingMedicines] = useState(false)
    const [sendingReminder, setSendingReminder] = useState(false)
    const [medicineRows, setMedicineRows] = useState<MedicineRow[]>([])
    const [selectedPrescriptionIndex, setSelectedPrescriptionIndex] = useState(0)
    const [reminderDate, setReminderDate] = useState(
        () => new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    )
    const [autoNotify, setAutoNotify] = useState(true)
    const [toast, setToast] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'info' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success',
    })

    const showToast = useCallback((message: string, severity: 'success' | 'info' | 'error') => {
        setToast({ open: true, message, severity })
    }, [])

    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) {
            setError('Order ID is missing. Please check the route configuration.')
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
            const currentStatus = order.status?.toLowerCase() || 'pending'

            setOrderData(order)
            setStatus(currentStatus)
            setMedicineRows(normalizeMedicines(order.medicines))
            setSelectedPrescriptionIndex(0)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load order details')
        } finally {
            setLoading(false)
        }
    }, [orderId])

    useEffect(() => {
        fetchOrderDetails()
    }, [fetchOrderDetails])

    const prescriptionSources = useMemo(() => {
        const sources: string[] = []

        orderData?.prescriptions?.forEach((item) => {
            const directUrl = item.url || item.image_url || item.imageUrl
            const s3Key = item.s3_key || item.prescription_s3_key
            const resolvedUrl = directUrl || buildS3Url(s3Key)

            if (resolvedUrl) sources.push(resolvedUrl)
        })

        orderData?.prescription_urls?.forEach((url) => {
            if (url) sources.push(url)
        })

        orderData?.prescription_s3_keys?.forEach((key) => {
            const url = buildS3Url(key)
            if (url) sources.push(url)
        })

        const singlePrescription = buildS3Url(orderData?.prescription_s3_key)
        if (singlePrescription) sources.push(singlePrescription)

        return sources.length ? Array.from(new Set(sources)) : [prescriptionImage, prescriptionImage]
    }, [orderData])

    const patientData = useMemo(() => {
        const patient = orderData?.patient

        return {
            id: patient?.id || orderData?.id || '-',
            name: patient?.name || 'Patient',
            age: patient?.age ?? '—',
            gender: patient?.gender || '—',
            bloodGroup: patient?.blood_group || '—',
            weight: patient?.weight ? `${patient.weight}` : '—',
            lastVisit: orderData?.created_at ? new Date(orderData.created_at).toLocaleDateString() : '—',
            allergies: patient?.allergies || 'NKA (No Known Allergies)',
            imageUrl: patient?.avatar_s3_key
                ? buildS3Url(patient.avatar_s3_key) || 'https://i.pravatar.cc/80?img=12'
                : 'https://i.pravatar.cc/80?img=12',
            phone: patient?.mobile || patient?.phone || '—',
            emergencyContact: patient?.emergency_contact || '—',
        }
    }, [orderData])

    const clinicData = useMemo(
        () => ({
            name: orderData?.clinic?.name || orderData?.pharmacy?.name || 'Clinic',
            doctorName: orderData?.clinic?.doctor_name || 'Doctor',
            phone: orderData?.clinic?.phone || orderData?.pharmacy?.alternate_mobile || '—',
        }),
        [orderData]
    )

    const prescribedDays = useMemo(() => {
        if (!medicineRows.length) return 0
        return Math.max(...medicineRows.map((row) => Number(row.totalTablets || 0)))
    }, [medicineRows])

    const purchasedDays = useMemo(() => {
        if (!medicineRows.length) return 0
        return Math.max(...medicineRows.map((row) => Number(row.purchasedTablets || 0)))
    }, [medicineRows])

    const reminderOffsetDays = Math.max(purchasedDays - 2, 0)

    const saveMedicines = useCallback(
        async (rows: MedicineRow[]) => {
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

                if (!result.success) {
                    throw new Error(result.message || 'Failed to save medicines')
                }
            } catch (err) {
                showToast(err instanceof Error ? err.message : 'Failed to save medicines', 'error')
            } finally {
                setSavingMedicines(false)
            }
        },
        [orderData, showToast]
    )

    const addMedicineRow = useCallback(() => {
        setMedicineRows((prev) => [...prev, createEmptyMedicineRow()])
        showToast('New medicine row added', 'info')
    }, [showToast])

    const removeMedicineRow = useCallback(
        async (id: string) => {
            const updatedRows = medicineRows.filter((row) => row.id !== id)
            setMedicineRows(updatedRows)
            await saveMedicines(updatedRows)
            showToast('Medicine row removed', 'info')
        },
        [medicineRows, saveMedicines, showToast]
    )

    const updateMedicineRow = useCallback((id: string, field: keyof MedicineRow, value: string | number) => {
        setMedicineRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
    }, [])

    const handleMedicineBlur = useCallback(async () => {
        const validRows = medicineRows.filter((row) => row.medication.trim())
        if (!validRows.length) return
        await saveMedicines(medicineRows)
    }, [medicineRows, saveMedicines])

    const handleStatusChange = async (event: SelectChangeEvent) => {
        if (!orderData) return

        const newStatus = event.target.value
        setUpdatingStatus(true)

        try {
            const result = await updatePharmacyOrderStatus(orderData.id, { status: newStatus })

            if (!result.success) {
                throw new Error(result.message || 'Status update failed')
            }

            setStatus(newStatus)
            setOrderData((prev) => (prev ? { ...prev, status: newStatus } : prev))
            showToast(`Order status updated to ${statusOptions.find((s) => s.value === newStatus)?.label}`, 'info')
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to update status', 'error')
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleSendReminder = async () => {
        if (!orderData) return

        setSendingReminder(true)

        try {
            const result = await sendPharmacyOrderReminder(orderData.id, {
                reminderDate,
                autoNotify,
            })

            if (!result.success) {
                throw new Error(result.message || 'Reminder failed')
            }

            showToast(`Reminder sent! Next reminder on ${new Date(reminderDate).toLocaleDateString()}`, 'success')
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to send reminder', 'error')
        } finally {
            setSendingReminder(false)
        }
    }

    const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }))

    const handlePreviousPrescription = () => {
        setSelectedPrescriptionIndex((prev) => (prev === 0 ? prescriptionSources.length - 1 : prev - 1))
    }

    const handleNextPrescription = () => {
        setSelectedPrescriptionIndex((prev) => (prev === prescriptionSources.length - 1 ? 0 : prev + 1))
    }

    const medicineColumns = useMemo(
        () => [
            {
                field: 'medication',
                label: 'Medication',
                render: (_value: unknown, row: MedicineTableRow) => (
                    <AppInput
                        value={row.medication}
                        onBlur={handleMedicineBlur}
                        onChange={(e) => updateMedicineRow(row.id, 'medication', e.target.value)}
                        placeholder="e.g., Augmentin 625mg"
                    />
                ),
            },
            {
                field: 'frequency',
                label: 'Frequency',
                render: (_value: unknown, row: MedicineTableRow) => (
                    <AppInput
                        value={row.frequency}
                        onBlur={handleMedicineBlur}
                        onChange={(e) => updateMedicineRow(row.id, 'frequency', e.target.value)}
                        placeholder="e.g., 1-0-1"
                    />
                ),
            },
            {
                field: 'totalTablets',
                label: 'Total Tablets',
                render: (_value: unknown, row: MedicineTableRow) => (
                    <AppInput
                        type="number"
                        value={row.totalTablets}
                        onBlur={handleMedicineBlur}
                        onChange={(e) => updateMedicineRow(row.id, 'totalTablets', parseInt(e.target.value) || 0)}
                    />
                ),
            },
            {
                field: 'purchasedTablets',
                label: 'Purchased Tablets',
                render: (_value: unknown, row: MedicineTableRow) => (
                    <AppInput
                        type="number"
                        value={row.purchasedTablets}
                        onBlur={handleMedicineBlur}
                        onChange={(e) => updateMedicineRow(row.id, 'purchasedTablets', parseInt(e.target.value) || 0)}
                    />
                ),
            },
            {
                field: 'instructions',
                label: 'Instructions',
                render: (_value: unknown, row: MedicineTableRow) => (
                    <AppInput
                        value={row.instructions}
                        onBlur={handleMedicineBlur}
                        onChange={(e) => updateMedicineRow(row.id, 'instructions', e.target.value)}
                        placeholder="e.g., After food"
                    />
                ),
            },
            {
                field: 'actions',
                label: '',
                align: 'center' as const,
                render: (_value: unknown, row: MedicineTableRow) => (
                    <Tooltip title="Remove">
                        <IconButton onClick={() => removeMedicineRow(row.id)} size="small" color="error">
                            <DeleteOutline fontSize="small" />
                        </IconButton>
                    </Tooltip>
                ),
            },
        ],
        [handleMedicineBlur, removeMedicineRow, updateMedicineRow]
    )

    if (loading) {
        return (
            <Box
                sx={{
                    p: 2,
                    bgcolor: '#F4F9F9',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress sx={{ color: '#00796B' }} />
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{ p: 2, bgcolor: '#F4F9F9', minHeight: '100vh' }}>
                <Alert
                    severity="error"
                    action={
                        <AppButton
                            label="Retry"
                            size="small"
                            onClick={fetchOrderDetails}
                            sx={{ color: 'inherit', bgcolor: 'transparent', boxShadow: 'none' }}
                        />
                    }
                >
                    {error}
                </Alert>
            </Box>
        )
    }

    return (
        <Box sx={{ p: { xs: 1.5, md: 2 }, bgcolor: '#F4F9F9', minHeight: '100vh' }}>
            <Grid container spacing={2} alignItems="flex-start">
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={2}>
                        <SectionCard title="Patient Details">
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
                                <Avatar
                                    src={patientData.imageUrl}
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: '#00796B',
                                        borderRadius: '10px',
                                        border: '2px solid #E0F2F1',
                                    }}
                                >
                                    {patientData.name.charAt(0)}
                                </Avatar>

                                <Box sx={{ flex: 1 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: 0.75,
                                            mb: 0.75,
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight={700} color="#1E2A2A">
                                            {patientData.name}
                                        </Typography>
                                        {/* <Typography variant="caption" color="#5F7F7F">
                                            ({patientData.id})
                                        </Typography> */}
                                        <Chip
                                            label={
                                                patientData.allergies !== 'NKA (No Known Allergies)'
                                                    ? patientData.allergies
                                                    : 'No Allergies'
                                            }
                                            size="small"
                                            sx={{
                                                height: 22,
                                                bgcolor:
                                                    patientData.allergies !== 'NKA (No Known Allergies)'
                                                        ? '#FFE4E2'
                                                        : '#E8F5E9',
                                                color:
                                                    patientData.allergies !== 'NKA (No Known Allergies)'
                                                        ? '#D32F2F'
                                                        : '#2E7D32',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </Box>

                                    <Grid container spacing={1.25} sx={{ mt: 0.25 }}>
                                        {[
                                            ['Age/Gender', `${patientData.age} yrs / ${patientData.gender}`],
                                            ['Blood Group', patientData.bloodGroup],
                                            ['Weight', patientData.weight],
                                            ['Last Visit', patientData.lastVisit || '—'],
                                        ].map(([label, value]) => (
                                            <Grid key={label} size={{ xs: 6, sm: 3 }}>
                                                <Typography variant="caption" color="#5F7F7F">
                                                    {label}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {value}
                                                </Typography>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Box>
                        </SectionCard>

                        <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <SectionCard title="Patient Contact">
                                    <Stack spacing={1.25}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Phone sx={{ fontSize: 17, color: '#5F7F7F' }} />
                                            <Typography variant="body2" fontWeight={500}>
                                                {patientData.phone}
                                            </Typography>
                                            <AppButton
                                                label="Call"
                                                size="small"
                                                onClick={() => {
                                                    window.location.href = `tel:${String(patientData.phone).replace(/\s/g, '')}`
                                                }}
                                                sx={{
                                                    ml: 'auto',
                                                    minWidth: 48,
                                                    px: 1,
                                                    py: 0.25,
                                                    bgcolor: 'transparent',
                                                    color: '#00796B',
                                                    boxShadow: 'none',
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Emergency sx={{ fontSize: 17, color: '#E57373' }} />
                                            <Typography variant="body2" fontWeight={500}>
                                                Emergency: {patientData.emergencyContact}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </SectionCard>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <SectionCard title="Clinic Contact">
                                    <Stack spacing={1.25}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocalHospital sx={{ fontSize: 17, color: '#5F7F7F' }} />
                                            <Typography variant="body2" fontWeight={500}>
                                                {clinicData.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Person sx={{ fontSize: 17, color: '#5F7F7F' }} />
                                            <Typography variant="body2" fontWeight={500}>
                                                {clinicData.doctorName}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Phone sx={{ fontSize: 17, color: '#5F7F7F' }} />
                                            <Typography variant="body2" fontWeight={500}>
                                                {clinicData.phone}
                                            </Typography>
                                            <AppButton
                                                label="Call"
                                                size="small"
                                                onClick={() => {
                                                    window.location.href = `tel:${String(clinicData.phone).replace(/\s/g, '')}`
                                                }}
                                                sx={{
                                                    ml: 'auto',
                                                    minWidth: 48,
                                                    px: 1,
                                                    py: 0.25,
                                                    bgcolor: 'transparent',
                                                    color: '#00796B',
                                                    boxShadow: 'none',
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                </SectionCard>
                            </Grid>
                        </Grid>

                        <SectionCard title="Previous Prescription Notes">
                            <Card
                                elevation={0}
                                sx={{
                                    bgcolor: '#F8FCFC',
                                    borderRadius: 1.5,
                                    border: '1px solid #E2E8F0',
                                    position: 'relative',
                                    minHeight: 240,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    p: 1,
                                }}
                            >
                                {prescriptionSources.length > 1 && (
                                    <Tooltip title="Previous prescription">
                                        <IconButton
                                            size="small"
                                            onClick={handlePreviousPrescription}
                                            sx={{
                                                position: 'absolute',
                                                left: 8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                bgcolor: '#FFFFFF',
                                                boxShadow: '0 3px 10px rgba(15, 23, 42, 0.12)',
                                                '&:hover': { bgcolor: '#E0F2F1' },
                                            }}
                                        >
                                            <KeyboardArrowLeft />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                <img
                                    src={prescriptionSources[selectedPrescriptionIndex]}
                                    alt={`Prescription ${selectedPrescriptionIndex + 1}`}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '260px',
                                        objectFit: 'contain',
                                        borderRadius: '8px',
                                    }}
                                />

                                {prescriptionSources.length > 1 && (
                                    <>
                                        <Tooltip title="Next prescription">
                                            <IconButton
                                                size="small"
                                                onClick={handleNextPrescription}
                                                sx={{
                                                    position: 'absolute',
                                                    right: 8,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    bgcolor: '#FFFFFF',
                                                    boxShadow: '0 3px 10px rgba(15, 23, 42, 0.12)',
                                                    '&:hover': { bgcolor: '#E0F2F1' },
                                                }}
                                            >
                                                <KeyboardArrowRight />
                                            </IconButton>
                                        </Tooltip>

                                        <Chip
                                            label={`${selectedPrescriptionIndex + 1} / ${prescriptionSources.length}`}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                bottom: 8,
                                                right: 8,
                                                height: 22,
                                                bgcolor: '#FFFFFF',
                                                color: '#00796B',
                                                fontWeight: 700,
                                            }}
                                        />
                                    </>
                                )}
                            </Card>
                        </SectionCard>

                        <Card sx={{ ...customCardStyle }}>
                            <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.25 }}>
                                    <AppButton
                                        label="Add Medicine"
                                        size="small"
                                        startIcon={<AddCircleOutline />}
                                        onClick={addMedicineRow}
                                        disabled={savingMedicines}
                                        sx={{ bgcolor: '#00796B', '&:hover': { bgcolor: '#00695C' } }}
                                    />
                                </Box>

                                <AppTable<MedicineTableRow>
                                    columns={medicineColumns}
                                    rows={medicineRows as MedicineTableRow[]}
                                    emptyMessage="No medicines added. Click Add Medicine to start."
                                />
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={2}>
                        <SectionCard title="Order Status">
                            <Stack spacing={2}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="caption" color="#5F7F7F" sx={{ mb: 0.5 }}>
                                        Status
                                    </Typography>
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
                                                    <Box
                                                        sx={{
                                                            width: 9,
                                                            height: 9,
                                                            borderRadius: '50%',
                                                            bgcolor: option.color,
                                                        }}
                                                    />
                                                    {option.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box sx={{ position: 'relative', pl: 1 }}>
                                    {timelineSteps.map((step, idx) => {
                                        const completedSteps = getCompletedSteps(status)
                                        const isCompleted = completedSteps.includes(step.key)
                                        const isLast = idx === timelineSteps.length - 1
                                        const isRejected = status === 'rejected' && step.key === 'order_created'

                                        return (
                                            <Box key={step.key} sx={{ position: 'relative', pb: isLast ? 0 : 2 }}>
                                                {!isLast && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            left: 4,
                                                            top: 22,
                                                            bottom: 0,
                                                            width: 2,
                                                            bgcolor: isCompleted ? '#00796B' : '#E2E8F0',
                                                            zIndex: 0,
                                                        }}
                                                    />
                                                )}

                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                                                    <Box
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: '50%',
                                                            bgcolor: isCompleted ? '#E0F2F1' : '#F1F5F9',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            zIndex: 1,
                                                            color: isCompleted ? '#00796B' : '#94A3B8',
                                                        }}
                                                    >
                                                        {isRejected ? <Cancel fontSize="small" /> : step.icon}
                                                    </Box>

                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={isCompleted ? 600 : 400}
                                                            color={isCompleted ? '#1E2A2A' : '#94A3B8'}
                                                        >
                                                            {step.label}
                                                        </Typography>
                                                        <Typography variant="caption" color="#94A3B8">
                                                            {isCompleted
                                                                ? status === 'rejected' && step.key === 'order_created'
                                                                    ? 'Rejected'
                                                                    : 'Completed'
                                                                : 'Pending'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )
                                    })}

                                    {status === 'rejected' && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    bgcolor: '#FEE2E2',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#DC2626',
                                                }}
                                            >
                                                <Cancel fontSize="small" />
                                            </Box>
                                            <Typography variant="body2" fontWeight={600} color="#DC2626">
                                                Order Rejected
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Stack>
                        </SectionCard>

                        <SectionCard title="Medicine Reminder">
                            <Stack spacing={1.75}>
                                <Box sx={{ bgcolor: '#F0FDF4', p: 1.25, borderRadius: 1.5 }}>
                                    <Typography variant="body2" color="#166534" fontWeight={500}>
                                        Doctor prescribed: {prescribedDays} days
                                    </Typography>
                                    <Typography variant="body2" color="#166534" fontWeight={500}>
                                        Purchased: {purchasedDays} days
                                    </Typography>
                                    <Typography variant="body2" color="#B45309" fontWeight={500} sx={{ mt: 0.25 }}>
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
                                        sendingReminder ? (
                                            <CircularProgress size={18} sx={{ color: '#FFFFFF' }} />
                                        ) : (
                                            <NotificationsActive />
                                        )
                                    }
                                    onClick={handleSendReminder}
                                    disabled={sendingReminder}
                                    sx={{ width: '100%', bgcolor: '#00796B', '&:hover': { bgcolor: '#00695C' } }}
                                />
                            </Stack>
                        </SectionCard>
                    </Stack>
                </Grid>
            </Grid>

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
