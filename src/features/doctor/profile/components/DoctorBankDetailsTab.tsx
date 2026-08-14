// src/features/doctor/profile/components/DoctorBankDetailsTab.tsx
import { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Grid, InputAdornment, IconButton } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { toast } from 'react-toastify'
import AppInput from '../../../../components/common/Input/AppInput'
import AppSelect from '../../../../components/common/Select/AppSelect'
import AppButton from '../../../../components/common/Button/AppButton'
import AppModal from '../../../../components/common/Modal/AppModal'
import AppSkeleton from '../../../../components/common/Skeleton/AppSkeleton'
import OtpForm from '../../../auth/components/OtpForm'
import { customCardStyle } from '../../../../styles/commonStyles'
import {
	BankDetails,
	BankDetailsPayload,
	getBankDetails,
	createBankDetails,
	updateBankDetails,
	requestBankDetailsEditOtp,
	verifyBankDetailsEditOtp,
} from '../../doctorService'

const ACCOUNT_TYPE_OPTIONS = [
	{ value: 'savings', label: 'Savings' },
	{ value: 'current', label: 'Current' },
]

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/
const ACCOUNT_NUMBER_REGEX = /^[0-9]{9,18}$/
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const UPI_REGEX = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/

interface FormState {
	account_holder_name: string
	bank_name: string
	branch_name: string
	account_number: string
	confirm_account_number: string
	ifsc_code: string
	account_type: string
	upi_id: string
	pan_number: string
}

const EMPTY_FORM: FormState = {
	account_holder_name: '',
	bank_name: '',
	branch_name: '',
	account_number: '',
	confirm_account_number: '',
	ifsc_code: '',
	account_type: '',
	upi_id: '',
	pan_number: '',
}

interface FormErrors {
	[key: string]: string | undefined
}

const maskAccountNumber = (value: string) => {
	if (!value) return ''
	const visible = value.slice(-4)
	return 'X'.repeat(Math.max(value.length - 4, 0)) + visible
}

// Pure validation: returns the full set of errors for a given form state.
// Called continuously so we can surface inline errors as soon as a field is touched,
// rather than leaving the Save button silently disabled with no explanation.
const computeErrors = (form: FormState): FormErrors => {
	const next: FormErrors = {}

	if (!form.account_holder_name.trim()) next.account_holder_name = 'Account holder name is required'
	if (!form.bank_name.trim()) next.bank_name = 'Bank name is required'

	if (!form.account_number.trim()) {
		next.account_number = 'Account number is required'
	} else if (!ACCOUNT_NUMBER_REGEX.test(form.account_number.trim())) {
		next.account_number = 'Account number must be 9-18 digits'
	}

	if (!form.confirm_account_number.trim()) {
		next.confirm_account_number = 'Please re-enter the account number'
	} else if (form.account_number.trim() !== form.confirm_account_number.trim()) {
		next.confirm_account_number = 'Account numbers do not match'
	}

	if (!form.ifsc_code.trim()) {
		next.ifsc_code = 'IFSC code is required'
	} else if (!IFSC_REGEX.test(form.ifsc_code.trim().toUpperCase())) {
		next.ifsc_code = 'Invalid format. Expected e.g. SBIN0001234'
	}

	if (!form.account_type) next.account_type = 'Please select an account type'

	if (form.upi_id.trim() && !UPI_REGEX.test(form.upi_id.trim())) {
		next.upi_id = 'Invalid format. Expected e.g. name@bank'
	}

	if (form.pan_number.trim() && !PAN_REGEX.test(form.pan_number.trim().toUpperCase())) {
		next.pan_number = 'Invalid format. Expected e.g. ABCDE1234F'
	}

	return next
}

export default function DoctorBankDetailsTab() {
	const [loading, setLoading] = useState(true)
	const [bankDetails, setBankDetails] = useState<BankDetails | null>(null)
	const [form, setForm] = useState<FormState>(EMPTY_FORM)
	const [touched, setTouched] = useState<Record<string, boolean>>({})
	const [isEditing, setIsEditing] = useState(false)
	const [saving, setSaving] = useState(false)
	const [showAccountNumber, setShowAccountNumber] = useState(false)

	const [otpModalOpen, setOtpModalOpen] = useState(false)
	const [otpRequesting, setOtpRequesting] = useState(false)

	const hasSavedRecord = !!bankDetails

	// All validation errors for the current form state, recomputed on every change.
	const allErrors = useMemo(() => computeErrors(form), [form])
	const isFormValid = Object.keys(allErrors).length === 0

	// Only show a field's error once the person has interacted with it (or tried to save) —
	// avoids a wall of red on a blank form.
	const [attemptedSave, setAttemptedSave] = useState(false)
	const errors: FormErrors = {}
	Object.keys(allErrors).forEach((key) => {
		if (touched[key] || attemptedSave) errors[key] = allErrors[key]
	})

	// ── Fetch existing bank details ────────────────────────────────────────────
	const fetchBankDetails = async () => {
		setLoading(true)
		try {
			const res = await getBankDetails()
			if (res.success) {
				setBankDetails(res.data)
			}
		} catch (err) {
			console.error('Failed to load bank details', err)
			toast.error('Failed to load bank details')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchBankDetails()
	}, [])

	// ── Field change ────────────────────────────────────────────────────────────
	const handleChange = (field: keyof FormState, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }))
	}

	const handleBlur = (field: keyof FormState) => {
		setTouched((prev) => ({ ...prev, [field]: true }))
	}

	// ── Save (create or update) ────────────────────────────────────────────────
	const handleSave = async () => {
		setAttemptedSave(true)
		if (!isFormValid) return

		const payload: BankDetailsPayload = {
			account_holder_name: form.account_holder_name.trim(),
			bank_name: form.bank_name.trim(),
			branch_name: form.branch_name.trim() || null,
			account_number: form.account_number.trim(),
			confirm_account_number: form.confirm_account_number.trim(),
			ifsc_code: form.ifsc_code.trim().toUpperCase(),
			account_type: form.account_type as BankDetailsPayload['account_type'],
			upi_id: form.upi_id.trim() || null,
			pan_number: form.pan_number.trim() ? form.pan_number.trim().toUpperCase() : null,
		}

		setSaving(true)
		try {
			const res = hasSavedRecord ? await updateBankDetails(payload) : await createBankDetails(payload)
			if (res.success) {
				toast.success(hasSavedRecord ? 'Bank details updated successfully' : 'Bank details saved successfully')
				setBankDetails(res.data)
				setIsEditing(false)
				setShowAccountNumber(false)
				setForm(EMPTY_FORM)
				setTouched({})
				setAttemptedSave(false)
			} else {
				toast.error(res.message || 'Failed to save bank details')
			}
		} catch (err: unknown) {
			const message =
				(err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
				'Failed to save bank details. Please try again.'
			toast.error(message)
			console.error('Failed to save bank details', err)
		} finally {
			setSaving(false)
		}
	}

	// ── Edit flow (OTP-gated) ──────────────────────────────────────────────────
	const handleEditClick = async () => {
		setOtpRequesting(true)
		try {
			const res = await requestBankDetailsEditOtp()
			if (res.success) {
				setOtpModalOpen(true)
			} else {
				toast.error(res.message || 'Failed to send OTP')
			}
		} catch (err) {
			console.error('Failed to request OTP', err)
			toast.error('Failed to send OTP. Please try again.')
		} finally {
			setOtpRequesting(false)
		}
	}

	const handleOtpCustomVerify = async (otp: string): Promise<boolean> => {
		try {
			const res = await verifyBankDetailsEditOtp(otp)
			if (res.success && res.data) {
				setBankDetails(res.data)
				setForm({
					account_holder_name: res.data.account_holder_name,
					bank_name: res.data.bank_name,
					branch_name: res.data.branch_name || '',
					account_number: res.data.account_number,
					confirm_account_number: res.data.account_number,
					ifsc_code: res.data.ifsc_code,
					account_type: res.data.account_type,
					upi_id: res.data.upi_id || '',
					pan_number: res.data.pan_number || '',
				})
				setTouched({})
				setAttemptedSave(false)
				return true
			}
			return false
		} catch {
			return false
		}
	}

	const handleOtpVerified = () => {
		setOtpModalOpen(false)
		setIsEditing(true)
		setShowAccountNumber(true)
		toast.success('OTP verified. You can now edit your bank details.')
	}

	const handleCancelEdit = () => {
		setIsEditing(false)
		setShowAccountNumber(false)
		setTouched({})
		setAttemptedSave(false)
		if (bankDetails) {
			setForm({
				account_holder_name: bankDetails.account_holder_name,
				bank_name: bankDetails.bank_name,
				branch_name: bankDetails.branch_name || '',
				account_number: '',
				confirm_account_number: '',
				ifsc_code: bankDetails.ifsc_code,
				account_type: bankDetails.account_type,
				upi_id: bankDetails.upi_id || '',
				pan_number: bankDetails.pan_number || '',
			})
		}
	}

	// ── Render ──────────────────────────────────────────────────────────────────
	if (loading) {
		return (
			<Box sx={{ ...customCardStyle }}>
				<AppSkeleton variant="rectangular" height={40} sx={{ mb: 3, borderRadius: 1 }} />
				<AppSkeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
			</Box>
		)
	}

	const readOnly = hasSavedRecord && !isEditing
	const accountNumberDisplayValue = readOnly
		? maskAccountNumber(bankDetails?.account_number || '')
		: form.account_number

	return (
		<Box sx={{ ...customCardStyle }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
						Bank Details
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
						Securely add and manage your payout bank account
					</Typography>
				</Box>

				{readOnly && (
					<AppButton
						variant="outlined"
						label="Edit"
						startIcon={<EditOutlinedIcon fontSize="small" />}
						loading={otpRequesting}
						onClick={handleEditClick}
					/>
				)}
			</Box>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Account Holder Name *"
							value={form.account_holder_name}
							placeholder="Enter account holder name"
							disabled={readOnly}
							error={!!errors.account_holder_name}
							helperText={errors.account_holder_name}
							onChange={(e) => handleChange('account_holder_name', e.target.value)}
							onBlur={() => handleBlur('account_holder_name')}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Bank Name *"
							value={form.bank_name}
							placeholder="Enter bank name"
							disabled={readOnly}
							error={!!errors.bank_name}
							helperText={errors.bank_name}
							onChange={(e) => handleChange('bank_name', e.target.value)}
							onBlur={() => handleBlur('bank_name')}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Branch Name"
							value={form.branch_name}
							placeholder="Enter branch name (optional)"
							disabled={readOnly}
							error={!!errors.branch_name}
							helperText={errors.branch_name}
							onChange={(e) => handleChange('branch_name', e.target.value)}
							onBlur={() => handleBlur('branch_name')}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppSelect
							label="Account Type *"
							value={form.account_type}
							options={ACCOUNT_TYPE_OPTIONS}
							placeholder="Select account type"
							disabled={readOnly}
							error={!!errors.account_type}
							helperText={errors.account_type}
							onChange={(e) => {
								handleChange('account_type', e.target.value as string)
								handleBlur('account_type')
							}}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Account Number *"
							value={accountNumberDisplayValue}
							placeholder="Enter account number"
							type={readOnly || showAccountNumber ? 'text' : 'password'}
							disabled={readOnly}
							error={!!errors.account_number}
							helperText={errors.account_number}
							onChange={(e) => handleChange('account_number', e.target.value.replace(/\D/g, ''))}
							onBlur={() => handleBlur('account_number')}
							InputProps={
								!readOnly
									? {
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														size="small"
														onClick={() => setShowAccountNumber((prev) => !prev)}
														edge="end"
													>
														{showAccountNumber ? (
															<VisibilityOffOutlinedIcon fontSize="small" />
														) : (
															<VisibilityOutlinedIcon fontSize="small" />
														)}
													</IconButton>
												</InputAdornment>
											),
										}
									: {
											endAdornment: (
												<InputAdornment position="end">
													<LockOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
												</InputAdornment>
											),
										}
							}
						/>
					</Grid>
					{!readOnly && (
						<Grid size={{ xs: 12, sm: 6 }}>
							<AppInput
								label="Re-enter Account Number *"
								value={form.confirm_account_number}
								placeholder="Re-enter account number"
								type={showAccountNumber ? 'text' : 'password'}
								error={!!errors.confirm_account_number}
								helperText={errors.confirm_account_number}
								onChange={(e) => handleChange('confirm_account_number', e.target.value.replace(/\D/g, ''))}
								onBlur={() => handleBlur('confirm_account_number')}
							/>
						</Grid>
					)}
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="IFSC Code *"
							value={form.ifsc_code}
							placeholder="e.g. SBIN0001234"
							disabled={readOnly}
							error={!!errors.ifsc_code}
							helperText={errors.ifsc_code}
							onChange={(e) => handleChange('ifsc_code', e.target.value.toUpperCase())}
							onBlur={() => handleBlur('ifsc_code')}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="UPI ID"
							value={form.upi_id}
							placeholder="yourname@bank (optional)"
							disabled={readOnly}
							error={!!errors.upi_id}
							helperText={errors.upi_id}
							onChange={(e) => handleChange('upi_id', e.target.value)}
							onBlur={() => handleBlur('upi_id')}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="PAN Number"
							value={form.pan_number}
							placeholder="e.g. ABCDE1234F (optional)"
							disabled={readOnly}
							error={!!errors.pan_number}
							helperText={errors.pan_number}
							onChange={(e) => handleChange('pan_number', e.target.value.toUpperCase())}
							onBlur={() => handleBlur('pan_number')}
						/>
					</Grid>
				</Grid>
			</Box>

			{!readOnly && (
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
					{isEditing && (
						<AppButton variant="outlined" label="Cancel" disabled={saving} onClick={handleCancelEdit} />
					)}
					<AppButton
						variant="contained"
						label={hasSavedRecord ? 'Update' : 'Save'}
						disabled={!isFormValid}
						loading={saving}
						onClick={handleSave}
					/>
				</Box>
			)}

			<AppModal
				open={otpModalOpen}
				onClose={() => setOtpModalOpen(false)}
				title="Verify OTP to edit bank details"
				maxWidth="xs"
			>
				<OtpForm
					contactNumber=""
					mode="modal"
					onCustomVerify={handleOtpCustomVerify}
					onVerify={handleOtpVerified}
				/>
			</AppModal>
		</Box>
	)
}
