// src/features/admin/components/AdminAncillaryReassignModal.tsx
import { useEffect, useState } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Box,
	Stack,
	Button,
	Avatar,
	CircularProgress,
	Alert,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Chip,
} from '@mui/material'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

import {
	AdminAncillaryDetail,
	AvailableAncillaryProviderItem,
	getAvailableAncillaryProviders,
} from '../adminService'

interface AdminAncillaryReassignModalProps {
	open: boolean
	onClose: () => void
	request: AdminAncillaryDetail | null
	onConfirm: (providerId: string, reason?: string) => Promise<void>
}

export default function AdminAncillaryReassignModal({
	open,
	onClose,
	request,
	onConfirm,
}: AdminAncillaryReassignModalProps) {
	const [providers, setProviders] = useState<AvailableAncillaryProviderItem[]>([])
	const [selectedProviderId, setSelectedProviderId] = useState<string>('')
	const [reason, setReason] = useState<string>('')
	const [loadingProviders, setLoadingProviders] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (open && request) {
			setSelectedProviderId('')
			setReason('')
			setError(null)
			fetchProviders()
		}
	}, [open, request])

	const fetchProviders = async () => {
		setLoadingProviders(true)
		try {
			const res = await getAvailableAncillaryProviders(request?.service.procedure_id)
			if (res.success && res.data) {
				setProviders(res.data)
			}
		} catch (err: any) {
			console.error('Failed to fetch available providers:', err)
			setError(err?.message || 'Failed to load available nurses list.')
		} finally {
			setLoadingProviders(false)
		}
	}

	const handleSave = async () => {
		if (!selectedProviderId) return
		setSubmitting(true)
		setError(null)
		try {
			await onConfirm(selectedProviderId, reason.trim() || undefined)
			onClose()
		} catch (err: any) {
			setError(err?.message || 'Failed to reassign care provider.')
		} finally {
			setSubmitting(false)
		}
	}

	if (!request) return null

	return (
		<Dialog
			open={open}
			onClose={submitting ? undefined : onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: { borderRadius: 3, p: 1 },
			}}
		>
			<DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1 }}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar sx={{ bgcolor: '#e0f2fe', color: '#0369a1', width: 36, height: 36 }}>
						<SwapHorizIcon fontSize="small" />
					</Avatar>
					<Box>
						<Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
							Reassign Care Provider
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Request ID: {request.public_id} • {request.service.procedure_name || 'Care Visit'}
						</Typography>
					</Box>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ pt: 2 }}>
				<Stack spacing={2.5}>
					{error && (
						<Alert severity="error" sx={{ borderRadius: 2 }}>
							{error}
						</Alert>
					)}

					{/* Current Assignment Snapshot */}
					<Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
						<Typography variant="caption" fontWeight={700} color="#64748b" sx={{ textTransform: 'uppercase' }}>
							Current Assignment
						</Typography>
						<Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mt: 0.5 }}>
							Patient: {request.patient.name}
						</Typography>
						<Typography variant="body2" color="#475569">
							Current Nurse: {request.nurse ? `${request.nurse.name} (Lic: ${request.nurse.license_number || 'N/A'})` : '⚠️ Currently Unassigned'}
						</Typography>
					</Box>

					{/* Provider Selection */}
					{loadingProviders ? (
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3, gap: 1.5 }}>
							<CircularProgress size={24} sx={{ color: '#0d9488' }} />
							<Typography variant="body2" color="text.secondary">
								Finding qualified and verified nurses...
							</Typography>
						</Box>
					) : (
						<FormControl fullWidth size="small">
							<InputLabel id="provider-select-label">Select Qualified Nurse / Specialist</InputLabel>
							<Select
								labelId="provider-select-label"
								value={selectedProviderId}
								label="Select Qualified Nurse / Specialist"
								onChange={(e) => setSelectedProviderId(e.target.value)}
							>
								{providers.length === 0 ? (
									<MenuItem disabled value="">
										No available nurses found online for this procedure
									</MenuItem>
								) : (
									providers.map((p) => (
										<MenuItem key={p.provider_id} value={p.provider_id}>
											<Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', py: 0.5 }}>
												<Avatar sx={{ width: 28, height: 28, bgcolor: '#0d9488', fontSize: 12, fontWeight: 700 }}>
													{p.name.charAt(0)}
												</Avatar>
												<Box sx={{ flex: 1, minWidth: 0 }}>
													<Typography variant="body2" fontWeight={600} noWrap>
														{p.name}
													</Typography>
													<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
														{p.qualifications || p.specialty_name || 'Specialist'} {p.license_number ? `• Lic: ${p.license_number}` : ''}
													</Typography>
												</Box>
												{p.is_verified && (
													<Chip
														icon={<VerifiedUserIcon sx={{ fontSize: '11px !important' }} />}
														label="Verified"
														size="small"
														sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#dcfce7', color: '#15803d' }}
													/>
												)}
												<Chip
													label={p.is_online ? 'Online' : 'Offline'}
													size="small"
													sx={{
														height: 18,
														fontSize: '0.6rem',
														fontWeight: 700,
														bgcolor: p.is_online ? '#dcfce7' : '#f1f5f9',
														color: p.is_online ? '#15803d' : '#64748b',
													}}
												/>
											</Stack>
										</MenuItem>
									))
								)}
							</Select>
						</FormControl>
					)}

					{/* Reason Field */}
					<TextField
						label="Reassignment Reason / Operational Notes"
						multiline
						rows={3}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="e.g., Previous nurse stuck in traffic / Patient requested female nurse"
						fullWidth
						size="small"
					/>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={onClose} disabled={submitting} sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleSave}
					disabled={!selectedProviderId || submitting}
					sx={{
						bgcolor: '#0d9488',
						'&:hover': { bgcolor: '#0f766e' },
						textTransform: 'none',
						fontWeight: 700,
						borderRadius: 2,
					}}
				>
					{submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Confirm Reassignment'}
				</Button>
			</DialogActions>
		</Dialog>
	)
}
