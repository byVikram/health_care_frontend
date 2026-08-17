// src/features/admin/components/AddAdminDrawer.tsx
import { useState } from 'react'
import { Stack, Alert, IconButton } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { toast } from 'react-toastify'

import AppDrawer from '../../../components/common/Drawer/AppDrawer'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import { createSubAdmin, CreateSubAdminPayload } from '../adminService'

interface AddAdminDrawerProps {
	open: boolean
	onClose: () => void
	onSuccess: () => void
}

const ROLE_OPTIONS = [
	{ label: 'Support Admin', value: 'support_admin' },
	{ label: 'Billing Admin', value: 'billing_admin' },
	{ label: 'Compliance Admin', value: 'compliance_admin' },
]

export default function AddAdminDrawer({ open, onClose, onSuccess }: AddAdminDrawerProps) {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [contactNumber, setContactNumber] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [role, setRole] = useState<'support_admin' | 'billing_admin' | 'compliance_admin'>('support_admin')
	const [department, setDepartment] = useState('')

	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const resetForm = () => {
		setName('')
		setEmail('')
		setContactNumber('')
		setPassword('')
		setShowPassword(false)
		setRole('support_admin')
		setDepartment('')
		setError(null)
	}

	const handleClose = () => {
		resetForm()
		onClose()
	}

	const handleSubmit = async () => {
		setError(null)
		if (!name.trim()) {
			setError('Name is required.')
			return
		}
		if (!email.trim()) {
			setError('Email address is required.')
			return
		}
		if (!contactNumber.trim()) {
			setError('Contact number is required.')
			return
		}
		if (!password.trim()) {
			setError('Password is required.')
			return
		}
		if (password.trim().length < 6) {
			setError('Password must be at least 6 characters long.')
			return
		}
		if (!role) {
			setError('Role selection is required.')
			return
		}

		setSubmitting(true)
		try {
			const payload: CreateSubAdminPayload = {
				name: name.trim(),
				email: email.trim().toLowerCase(),
				contact_number: contactNumber.trim(),
				password: password.trim(),
				role,
				department: department.trim() || undefined,
			}

			const res = await createSubAdmin(payload)
			if (res.success) {
				toast.success(res.message || 'Sub Admin created successfully!')
				resetForm()
				onSuccess()
				onClose()
			} else {
				setError(res.message || 'Failed to create Sub Admin.')
			}
		} catch (err: unknown) {
			const errMsg = err instanceof Error ? err.message : 'An error occurred while creating Sub Admin.'
			setError(errMsg)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<AppDrawer
			open={open}
			onClose={handleClose}
			title="Add New Admin"
			subtitle="Provision an operational Sub Admin account and assign access role."
			confirmLabel="Create Admin"
			cancelLabel="Cancel"
			onConfirm={handleSubmit}
			confirmLoading={submitting}
			width={440}
		>
			<Stack spacing={2.5} sx={{ pt: 1 }}>
				{error && (
					<Alert severity="error" sx={{ borderRadius: 2 }}>
						{error}
					</Alert>
				)}

				<AppInput
					label="Full Name *"
					placeholder="e.g. Sam Support"
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={submitting}
				/>

				<AppInput
					label="Email Address *"
					placeholder="e.g. sam.support@healthadmin.com"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					disabled={submitting}
				/>

				<AppInput
					label="Contact Number *"
					placeholder="e.g. +919999991001"
					value={contactNumber}
					onChange={(e) => setContactNumber(e.target.value)}
					disabled={submitting}
				/>

				<AppInput
					label="Password *"
					placeholder="Enter admin password"
					type={showPassword ? 'text' : 'password'}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					disabled={submitting}
					endIcon={
						<IconButton
							size="small"
							onClick={() => setShowPassword(!showPassword)}
							edge="end"
							tabIndex={-1}
						>
							{showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
						</IconButton>
					}
				/>

				<AppSelect
					label="Admin Role *"
					value={role}
					onChange={(e) => setRole(e.target.value as any)}
					options={ROLE_OPTIONS}
					disabled={submitting}
				/>

				<AppInput
					label="Department (Optional)"
					placeholder="e.g. Patient Support, Finance, Compliance"
					value={department}
					onChange={(e) => setDepartment(e.target.value)}
					disabled={submitting}
				/>
			</Stack>
		</AppDrawer>
	)
}
