import React, { useState } from 'react'
import {
	Box,
	Card,
	CardContent,
	Typography,
	Avatar,
	Chip,
	Button,
	Grid,
	Paper,
	Snackbar,
	Alert,
	IconButton,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Switch,
	FormControlLabel,
	Stack,
	Tooltip,
	SelectChangeEvent,
	List,
	ListItemButton,
	ListItemText,
	Divider,
} from '@mui/material'
import {
	Phone,
	Email,
	Emergency,
	LocalHospital,
	Person,
	AccessTime,
	DeleteOutline,
	AddCircleOutline,
	NotificationsActive,
	Cancel,
	Inventory2,
	Verified,
	LocalShipping,
	AssignmentTurnedIn,
	CalendarToday,
} from '@mui/icons-material'
import { customCardStyle } from '../../styles/commonStyles'

// Import the prescription image (adjust path if needed)
import prescriptionImage from '../../assets/Pharmacy/Prescription.svg'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MedicineRow {
	id: string
	medication: string
	frequency: string
	totalTablets: number
	purchasedTablets: number
	instructions: string
}

interface StatusOption {
	value: string
	label: string
	color: string
	bg: string
}

// ─── Previous Visit Data (with dates only, image is now static) ─────────────────

interface PastVisit {
	id: string
	date: string // display format
	rawDate: Date // for sorting
}

const pastVisitsData: PastVisit[] = [
	{
		id: 'visit3',
		date: '22 Nov 2025',
		rawDate: new Date(2025, 10, 22),
	},
	{
		id: 'visit2',
		date: '10 Nov 2025',
		rawDate: new Date(2025, 10, 10),
	},
	{
		id: 'visit1',
		date: '28 Oct 2025',
		rawDate: new Date(2025, 9, 28),
	},
]

// Sort visits: latest first
const sortedVisits = [...pastVisitsData].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())

// ─── Status Configuration ──────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PharmacyPrescriptionDashboard() {
	// States
	const [status, setStatus] = useState<string>('pending')
	const [selectedVisitId, setSelectedVisitId] = useState<string>(sortedVisits[0].id)
	const [medicineRows, setMedicineRows] = useState<MedicineRow[]>([
		{
			id: '1',
			medication: 'Augmentin 625mg',
			frequency: '1-0-1',
			totalTablets: 30,
			purchasedTablets: 15,
			instructions: 'After food',
		},
		{
			id: '2',
			medication: 'Paracetamol 500mg',
			frequency: '1-1-1',
			totalTablets: 20,
			purchasedTablets: 20,
			instructions: 'As needed for fever',
		},
	])
	const [reminderDate, setReminderDate] = useState<string>(
		new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
	)
	const [autoNotify, setAutoNotify] = useState<boolean>(true)
	const [toast, setToast] = useState<{
		open: boolean
		message: string
		severity: 'success' | 'info' | 'error'
	}>({
		open: false,
		message: '',
		severity: 'success',
	})

	const selectedVisit = sortedVisits.find((v) => v.id === selectedVisitId)!

	// Handlers
	const showToast = (message: string, severity: 'success' | 'info' | 'error') => {
		setToast({ open: true, message, severity })
	}

	const addMedicineRow = () => {
		const newId = Date.now().toString()
		setMedicineRows([
			...medicineRows,
			{ id: newId, medication: '', frequency: '', totalTablets: 0, purchasedTablets: 0, instructions: '' },
		])
		showToast('New medicine row added', 'info')
	}
	const removeMedicineRow = (id: string) => {
		setMedicineRows(medicineRows.filter((row) => row.id !== id))
		showToast('Medicine row removed', 'info')
	}
	const updateMedicineRow = (id: string, field: keyof MedicineRow, value: string | number) => {
		setMedicineRows(medicineRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
	}
	const handleStatusChange = (event: SelectChangeEvent) => {
		setStatus(event.target.value)
		showToast(`Order status updated to ${statusOptions.find((s) => s.value === event.target.value)?.label}`, 'info')
	}
	const handleSendReminder = () => {
		showToast(`Reminder sent! Next reminder on ${new Date(reminderDate).toLocaleDateString()}`, 'success')
	}
	const handleCloseToast = () => setToast({ ...toast, open: false })

	// Mock patient & clinic data
	const patientData = {
		name: 'Nitin S H',
		id: 'OID1234',
		age: 35,
		gender: 'Male',
		bloodGroup: 'O+',
		weight: '72 kg',
		allergies: 'NKA (No Known Allergies)',
		imageUrl: 'https://i.pravatar.cc/80?img=12',
		phone: '+91 98765 43210',
		emergencyContact: '+91 99887 66550',
	}
	const clinicData = {
		name: 'City Care Clinic',
		doctorName: 'Dr. Meera Sharma',
		phone: '+91 80 4567 1234',
	}
	const prescribedDays = 30,
		purchasedDays = 15,
		reminderOffsetDays = 13

	return (
		<Box sx={{ p: 3, bgcolor: '#F4F9F9', minHeight: '100vh' }}>
			<Grid container spacing={3} alignItems="flex-start">
				{/* LEFT COLUMN */}
				<Grid size={{ xs: 12, md: 8 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						{/* Patient Overview Card */}
						<Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
							<CardContent sx={{ p: 3 }}>
								<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
									<Avatar
										src={patientData.imageUrl}
										sx={{
											width: 80,
											height: 80,
											bgcolor: '#00796B',
											borderRadius: '12px',
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
												gap: 1,
												mb: 1,
											}}
										>
											<Typography variant="h6" fontWeight={700} color="#1E2A2A">
												{patientData.name}
											</Typography>
											<Typography variant="body2" color="#5F7F7F">
												({patientData.id})
											</Typography>
											{patientData.allergies !== 'NKA (No Known Allergies)' ? (
												<Chip
													label={patientData.allergies}
													size="small"
													sx={{ bgcolor: '#FFE4E2', color: '#D32F2F', fontWeight: 500 }}
												/>
											) : (
												<Chip
													label="No Allergies"
													size="small"
													sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 500 }}
												/>
											)}
										</Box>
										<Grid container spacing={2} sx={{ mt: 0.5 }}>
											<Grid size={{ xs: 6, sm: 3 }}>
												<Typography variant="caption" color="#5F7F7F">
													Age/Gender
												</Typography>
												<Typography variant="body2" fontWeight={500}>
													{patientData.age} yrs / {patientData.gender}
												</Typography>
											</Grid>
											<Grid size={{ xs: 6, sm: 3 }}>
												<Typography variant="caption" color="#5F7F7F">
													Blood Group
												</Typography>
												<Typography variant="body2" fontWeight={500}>
													{patientData.bloodGroup}
												</Typography>
											</Grid>
											<Grid size={{ xs: 6, sm: 3 }}>
												<Typography variant="caption" color="#5F7F7F">
													Weight
												</Typography>
												<Typography variant="body2" fontWeight={500}>
													{patientData.weight}
												</Typography>
											</Grid>
											<Grid size={{ xs: 6, sm: 3 }}>
												<Typography variant="caption" color="#5F7F7F">
													Last Visit
												</Typography>
												<Typography variant="body2" fontWeight={500}>
													22 Nov 2025
												</Typography>
											</Grid>
										</Grid>
									</Box>
								</Box>
							</CardContent>
						</Card>

						{/* Contact Section */}
						<Grid container spacing={2}>
							{/* Patient Contact Card - email removed */}
							<Grid size={{ xs: 12, sm: 6 }}>
								<Card
									elevation={0}
									sx={{
										borderRadius: 3,
										border: '1px solid #E2E8F0',
										bgcolor: '#FFFFFF',
										height: '100%',
									}}
								>
									<CardContent sx={{ p: 2.5 }}>
										<Typography
											variant="subtitle2"
											sx={{ fontWeight: 600, color: '#00796B', mb: 2 }}
										>
											PATIENT CONTACT
										</Typography>
										<Stack spacing={2}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
												<Phone sx={{ fontSize: 18, color: '#5F7F7F' }} />
												<Typography variant="body2" fontWeight={500}>
													{patientData.phone}
												</Typography>
												<Button
													size="small"
													href={`tel:${patientData.phone.replace(/\s/g, '')}`}
													sx={{ ml: 'auto', color: '#00796B', textTransform: 'none' }}
												>
													Call
												</Button>
											</Box>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
												<Emergency sx={{ fontSize: 18, color: '#E57373' }} />
												<Typography variant="body2" fontWeight={500}>
													Emergency: {patientData.emergencyContact}
												</Typography>
											</Box>
										</Stack>
									</CardContent>
								</Card>
							</Grid>

							{/* Clinic Contact Card - added phone, removed room/department */}
							<Grid size={{ xs: 12, sm: 6 }}>
								<Card
									elevation={0}
									sx={{
										borderRadius: 3,
										border: '1px solid #E2E8F0',
										bgcolor: '#FFFFFF',
										height: '100%',
									}}
								>
									<CardContent sx={{ p: 2.5 }}>
										<Typography
											variant="subtitle2"
											sx={{ fontWeight: 600, color: '#00796B', mb: 2 }}
										>
											CLINIC CONTACT
										</Typography>
										<Stack spacing={2}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
												<LocalHospital sx={{ fontSize: 18, color: '#5F7F7F' }} />
												<Typography variant="body2" fontWeight={500}>
													{clinicData.name}
												</Typography>
											</Box>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
												<Person sx={{ fontSize: 18, color: '#5F7F7F' }} />
												<Typography variant="body2" fontWeight={500}>
													{clinicData.doctorName}
												</Typography>
											</Box>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
												<Phone sx={{ fontSize: 18, color: '#5F7F7F' }} />
												<Typography variant="body2" fontWeight={500}>
													{clinicData.phone}
												</Typography>
												<Button
													size="small"
													href={`tel:${clinicData.phone.replace(/\s/g, '')}`}
													sx={{ ml: 'auto', color: '#00796B', textTransform: 'none' }}
												>
													Call
												</Button>
											</Box>
										</Stack>
									</CardContent>
								</Card>
							</Grid>
						</Grid>

						{/* Previous Prescription Notes (without table, only date list + static image) */}
						<Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
							<CardContent sx={{ p: 3 }}>
								<Typography variant="subtitle1" fontWeight={700} color="#1E2A2A" mb={2}>
									Previous Prescription Notes
								</Typography>

								<Grid container spacing={3}>
									{/* Left side: List of visit dates (latest to oldest) */}
									<Grid size={{ xs: 12, md: 5 }}>
										<Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
											<List disablePadding>
												{sortedVisits.map((visit, index) => (
													<React.Fragment key={visit.id}>
														<ListItemButton
															selected={selectedVisitId === visit.id}
															onClick={() => setSelectedVisitId(visit.id)}
															sx={{
																py: 1.5,
																bgcolor:
																	selectedVisitId === visit.id
																		? '#E0F2F1'
																		: 'transparent',
																'&:hover': { bgcolor: '#E6F4F1' },
															}}
														>
															<ListItemText
																primary={
																	<Box
																		sx={{
																			display: 'flex',
																			alignItems: 'center',
																			gap: 1,
																		}}
																	>
																		<CalendarToday
																			fontSize="small"
																			color="action"
																		/>
																		<Typography variant="body2" fontWeight={500}>
																			{visit.date}
																		</Typography>
																	</Box>
																}
																secondary="View prescription"
															/>
														</ListItemButton>
														{index < sortedVisits.length - 1 && <Divider />}
													</React.Fragment>
												))}
											</List>
										</Paper>
									</Grid>

									{/* Right side: Static prescription image */}
									<Grid size={{ xs: 12, md: 7 }}>
										<Paper
											elevation={0}
											sx={{
												bgcolor: '#F8FCFC',
												borderRadius: 2,
												p: 2,
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
												minHeight: 200,
												border: '1px solid #E2E8F0',
											}}
										>
											<img
												src={prescriptionImage}
												alt="Prescription"
												style={{
													maxWidth: '100%',
													maxHeight: 240,
													objectFit: 'contain',
													borderRadius: 8,
												}}
											/>
										</Paper>
									</Grid>
								</Grid>
							</CardContent>
						</Card>

						{/* Pharmacy Entry Form Table */}
						<Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
							<CardContent sx={{ p: 3 }}>
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										mb: 2,
									}}
								>
									<Typography variant="subtitle1" fontWeight={700} color="#1E2A2A">
										Pharmacy Entry Form
									</Typography>
									<Button
										variant="contained"
										startIcon={<AddCircleOutline />}
										onClick={addMedicineRow}
										sx={{
											bgcolor: '#00796B',
											'&:hover': { bgcolor: '#00695C' },
											textTransform: 'none',
											borderRadius: 2,
										}}
									>
										Add Medicine
									</Button>
								</Box>
								<TableContainer
									component={Paper}
									elevation={0}
									sx={{ bgcolor: '#F8FCFC', borderRadius: 2, overflowX: 'auto' }}
								>
									<Table sx={{ minWidth: 650 }}>
										<TableHead>
											<TableRow sx={{ bgcolor: '#E6F4F1' }}>
												<TableCell sx={{ fontWeight: 600, color: '#00796B' }}>
													Medication
												</TableCell>
												<TableCell sx={{ fontWeight: 600, color: '#00796B' }}>
													Frequency
												</TableCell>
												<TableCell sx={{ fontWeight: 600, color: '#00796B' }}>
													Total Tablets
												</TableCell>
												<TableCell sx={{ fontWeight: 600, color: '#00796B' }}>
													Purchased Tablets
												</TableCell>
												<TableCell sx={{ fontWeight: 600, color: '#00796B' }}>
													Instructions
												</TableCell>
												<TableCell sx={{ width: 50 }}></TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{medicineRows.map((row) => (
												<TableRow key={row.id}>
													<TableCell>
														<TextField
															fullWidth
															size="small"
															variant="outlined"
															value={row.medication}
															onChange={(e) =>
																updateMedicineRow(row.id, 'medication', e.target.value)
															}
															placeholder="e.g., Augmentin 625mg"
															sx={{ bgcolor: '#FFFFFF' }}
														/>
													</TableCell>
													<TableCell>
														<TextField
															fullWidth
															size="small"
															variant="outlined"
															value={row.frequency}
															onChange={(e) =>
																updateMedicineRow(row.id, 'frequency', e.target.value)
															}
															placeholder="e.g., 1-0-1"
															sx={{ bgcolor: '#FFFFFF' }}
														/>
													</TableCell>
													<TableCell>
														<TextField
															type="number"
															fullWidth
															size="small"
															variant="outlined"
															value={row.totalTablets}
															onChange={(e) =>
																updateMedicineRow(
																	row.id,
																	'totalTablets',
																	parseInt(e.target.value) || 0
																)
															}
															sx={{ bgcolor: '#FFFFFF' }}
														/>
													</TableCell>
													<TableCell>
														<TextField
															type="number"
															fullWidth
															size="small"
															variant="outlined"
															value={row.purchasedTablets}
															onChange={(e) =>
																updateMedicineRow(
																	row.id,
																	'purchasedTablets',
																	parseInt(e.target.value) || 0
																)
															}
															sx={{ bgcolor: '#FFFFFF' }}
														/>
													</TableCell>
													<TableCell>
														<TextField
															fullWidth
															size="small"
															variant="outlined"
															value={row.instructions}
															onChange={(e) =>
																updateMedicineRow(
																	row.id,
																	'instructions',
																	e.target.value
																)
															}
															placeholder="e.g., After food"
															sx={{ bgcolor: '#FFFFFF' }}
														/>
													</TableCell>
													<TableCell align="center">
														<Tooltip title="Remove">
															<IconButton
																onClick={() => removeMedicineRow(row.id)}
																size="small"
																color="error"
															>
																<DeleteOutline fontSize="small" />
															</IconButton>
														</Tooltip>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
								{medicineRows.length === 0 && (
									<Typography variant="body2" color="#5F7F7F" sx={{ textAlign: 'center', py: 4 }}>
										No medicines added. Click "Add Medicine" to start.
									</Typography>
								)}
							</CardContent>
						</Card>
					</Box>
				</Grid>

				{/* RIGHT SIDEBAR */}
				<Grid size={{ xs: 12, md: 4 }}>
					<Stack spacing={3}>
						<Card elevation={0} sx={{ ...customCardStyle }}>
							<CardContent sx={{ p: 2.5 }}>
								<Typography variant="subtitle1" fontWeight={700} color="#1E2A2A" mb={2}>
									Order Status
								</Typography>
								<FormControl fullWidth size="small">
									<InputLabel id="status-select-label">Status</InputLabel>
									<Select
										labelId="status-select-label"
										value={status}
										label="Status"
										onChange={handleStatusChange}
										sx={{
											'& .MuiSelect-select': {
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
															width: 10,
															height: 10,
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
							</CardContent>
						</Card>

						<Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
							<CardContent sx={{ p: 2.5 }}>
								<Typography variant="subtitle1" fontWeight={700} color="#1E2A2A" mb={2}>
									Status History
								</Typography>
								<Box sx={{ position: 'relative', pl: 2 }}>
									{timelineSteps.map((step, idx) => {
										const completedSteps = getCompletedSteps(status)
										const isCompleted = completedSteps.includes(step.key)
										const isLast = idx === timelineSteps.length - 1
										const isRejected = status === 'rejected' && step.key === 'order_created'
										return (
											<Box key={step.key} sx={{ position: 'relative', pb: 3 }}>
												{!isLast && (
													<Box
														sx={{
															position: 'absolute',
															left: -10,
															top: 24,
															bottom: 0,
															width: 2,
															bgcolor: isCompleted ? '#00796B' : '#E2E8F0',
															zIndex: 0,
														}}
													/>
												)}
												<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
													<Box
														sx={{
															width: 32,
															height: 32,
															borderRadius: '50%',
															bgcolor: isCompleted ? '#E0F2F1' : '#F1F5F9',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															zIndex: 1,
															color: isCompleted ? '#00796B' : '#94A3B8',
														}}
													>
														{isRejected && step.key === 'order_created' ? (
															<Cancel fontSize="small" />
														) : (
															step.icon
														)}
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
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
											<Box
												sx={{
													width: 32,
													height: 32,
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
							</CardContent>
						</Card>

						<Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
							<CardContent sx={{ p: 2.5 }}>
								<Typography variant="subtitle1" fontWeight={700} color="#1E2A2A" mb={2}>
									Medicine Reminder
								</Typography>
								<Stack spacing={2.5}>
									<Box sx={{ bgcolor: '#F0FDF4', p: 1.5, borderRadius: 2 }}>
										<Typography variant="body2" color="#166534" fontWeight={500}>
											💊 Doctor prescribed: {prescribedDays} days
										</Typography>
										<Typography variant="body2" color="#166534" fontWeight={500}>
											✅ Purchased: {purchasedDays} days
										</Typography>
										<Typography variant="body2" color="#B45309" fontWeight={500} sx={{ mt: 0.5 }}>
											⏰ Remind patient after {reminderOffsetDays} days (stock low)
										</Typography>
									</Box>
									<TextField
										label="Reminder Date"
										type="date"
										fullWidth
										size="small"
										value={reminderDate}
										onChange={(e) => setReminderDate(e.target.value)}
										InputLabelProps={{ shrink: true }}
									/>
									<FormControlLabel
										control={
											<Switch
												checked={autoNotify}
												onChange={(e) => setAutoNotify(e.target.checked)}
												sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00796B' } }}
											/>
										}
										label="Auto Notify Patient"
									/>
									<Button
										fullWidth
										variant="contained"
										startIcon={<NotificationsActive />}
										onClick={handleSendReminder}
										sx={{
											bgcolor: '#00796B',
											'&:hover': { bgcolor: '#00695C' },
											textTransform: 'none',
											borderRadius: 2,
											py: 1,
										}}
									>
										Send Reminder Now
									</Button>
								</Stack>
							</CardContent>
						</Card>
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
					sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
				>
					{toast.message}
				</Alert>
			</Snackbar>
		</Box>
	)
}
