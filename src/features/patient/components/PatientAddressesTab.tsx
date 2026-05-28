import { useState, useEffect } from 'react'
import {
	Box,
	Typography,
	CircularProgress,
	Divider,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControlLabel,
	Checkbox,
	Grid,
	IconButton,
} from '@mui/material'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import { customCardStyle } from '../../../styles/commonStyles'
import { toast } from 'react-toastify'
import { getPatientAddresses, addPatientAddress, updatePatientAddress, PatientAddressOut } from '../patientService'


export default function PatientAddressesTab() {
	const [addresses, setAddresses] = useState<PatientAddressOut[]>([])
	const [loading, setLoading] = useState(true)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)

	// Form State
	const [label, setLabel] = useState('Home')
	const [addressLine, setAddressLine] = useState('')
	const [city, setCity] = useState('')
	const [stateName, setStateName] = useState('')
	const [pincode, setPincode] = useState('')
	const [isDefault, setIsDefault] = useState(false)

	const fetchAddresses = async () => {
		try {
			setLoading(true)
			const res = await getPatientAddresses()
			if (res.success) {
				setAddresses(res.data)
			}
		} catch (err) {
			console.error('Failed to fetch addresses', err)
			toast.error('Failed to load addresses')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchAddresses()
	}, [])

	const handleOpen = (addr?: PatientAddressOut) => {
		if (addr) {
			setEditingId(addr.id)
			setLabel(addr.label)
			setAddressLine(addr.address_line)
			setCity(addr.city)
			setStateName(addr.state)
			setPincode(addr.pincode)
			setIsDefault(addr.is_default)
		} else {
			setEditingId(null)
			setLabel('Home')
			setAddressLine('')
			setCity('')
			setStateName('')
			setPincode('')
			setIsDefault(addresses.length === 0)
		}
		setDialogOpen(true)
	}

	const handleClose = () => {
		setDialogOpen(false)
	}

	const handleSubmit = async () => {
		if (!addressLine || !city || !stateName || !pincode) {
			toast.error('Please fill in all required fields.')
			return
		}

		try {
			setSubmitting(true)
			const payload = {
				label,
				address_line: addressLine,
				city,
				state: stateName,
				pincode,
				is_default: isDefault,
			}
			if (editingId) {
				await updatePatientAddress(editingId, payload)
				toast.success('Address updated successfully')
			} else {
				await addPatientAddress(payload)
				toast.success('Address added successfully')
			}

			setDialogOpen(false)
			fetchAddresses()
		} catch (err) {
			console.error('Failed to add address', err)
			toast.error('Failed to add address')
		} finally {
			setSubmitting(false)
		}
	}

	const getIcon = (addrLabel: string) => {
		const lower = addrLabel.toLowerCase()
		if (lower.includes('office') || lower.includes('work')) return <BusinessOutlinedIcon fontSize="small" />
		if (lower.includes('home')) return <HomeOutlinedIcon fontSize="small" />
		return <LocationOnOutlinedIcon fontSize="small" />
	}

	return (
		<Box sx={{ ...customCardStyle, p: 2.5 }}>
			{/* Header – compact, one line */}
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
				<Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
					My Addresses
				</Typography>
				<AppButton variant="contained" size="small" label="+ Add Address" onClick={() => handleOpen()} />
			</Box>
			<Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
				Manage your saved addresses for home sample collection and medicine delivery.
			</Typography>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
					<CircularProgress size={28} sx={{ color: 'primary.main' }} />
				</Box>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
					{addresses.length === 0 ? (
						<Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
							No addresses saved yet. Add one to get started.
						</Typography>
					) : (
						addresses.map((addr, index) => (
							<Box key={addr.id}>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center', // center vertically for better compact alignment
										py: 1.5,
										px: 1,
										gap: 2,
										borderRadius: 2,
										transition: 'background-color 0.2s',
										'&:hover': {
											bgcolor: 'action.hover',
										},
									}}
								>
									{/* Icon */}
									<Box
										sx={{
											p: 1,
											borderRadius: 1.5,
											bgcolor: 'rgba(43,111,113,0.08)',
											color: 'primary.main',
											display: 'flex',
											flexShrink: 0,
										}}
									>
										{getIcon(addr.label)}
									</Box>

									{/* Address details */}
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
											<Typography
												variant="subtitle2"
												fontWeight={600}
												noWrap
												sx={{ maxWidth: { xs: '100%', sm: 200 } }}
											>
												{addr.label}
											</Typography>
											{addr.is_default && (
												<Chip
													label="Default"
													size="small"
													sx={{
														bgcolor: 'rgba(43,111,113,0.1)',
														color: 'primary.main',
														fontWeight: 600,
														fontSize: '0.65rem',
														height: 20,
														'& .MuiChip-label': { px: 0.8 },
													}}
												/>
											)}
										</Box>
										<Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
											{addr.address_line}
											{addr.city ? ' · ' : ''}
											{addr.city && addr.state ? `${addr.city}, ${addr.state}` : ''}
											{addr.pincode ? ` ${addr.pincode}` : ''}
										</Typography>
									</Box>

									{/* Edit button */}
									<IconButton
										size="small"
										onClick={() => handleOpen(addr)}
										sx={{ flexShrink: 0 }}
									>
										<EditOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
									</IconButton>
								</Box>
								{index < addresses.length - 1 && <Divider />}
							</Box>
						))
					)}
				</Box>
			)}

			<Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 600 }}>{editingId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
				<DialogContent dividers>
					<Grid container spacing={2} sx={{ mt: 0.5 }}>
						<Grid size={{ xs: 12 }}>
							<AppInput
								fullWidth
								label="Label (e.g. Home, Office)"
								value={label}
								onChange={(e) => setLabel(e.target.value)}
								size="small"
								required
							/>
						</Grid>
						<Grid size={{ xs: 12 }}>
							<AppInput
								fullWidth
								label="Address Line"
								value={addressLine}
								onChange={(e) => setAddressLine(e.target.value)}
								size="small"
								required
								multiline
								rows={2}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								fullWidth
								label="City"
								value={city}
								onChange={(e) => setCity(e.target.value)}
								size="small"
								required
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								fullWidth
								label="State"
								value={stateName}
								onChange={(e) => setStateName(e.target.value)}
								size="small"
								required
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								fullWidth
								label="Pincode"
								value={pincode}
								onChange={(e) => setPincode(e.target.value)}
								size="small"
								required
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControlLabel
								control={<Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
								label="Set as default address"
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions sx={{ p: 2, gap: 1 }}>
					<AppButton variant="outlined" onClick={handleClose} label="Cancel" />
					<AppButton
						variant="contained"
						onClick={handleSubmit}
						disabled={submitting}
						label={submitting ? 'Saving...' : (editingId ? 'Update Address' : 'Save Address')}
					/>
				</DialogActions>
			</Dialog>
		</Box>
	)
}