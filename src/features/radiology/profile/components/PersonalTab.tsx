// src/features/radiology/profile/components/PersonalTab.tsx
import { useState } from 'react'
import { Box, Typography, Grid, InputAdornment } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AppInput from '../../../../components/common/Input/AppInput'
import ProfileFormActions from '../../../../components/common/ProfileFormActions/ProfileFormActions'
import { customCardStyle } from '../../../../styles/commonStyles'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { updateMyRadiologyProfile } from '../../radiologyService'

// ─── Type ─────────────────────────────────────────────────────────────────────

export interface RadiologyProfilePersonal {
	name: string
	contactNumber: string
	contactVerified: boolean
	email: string
	emailVerified: boolean
	alternateMobile: string
	whatsappNumber: string
	avatar: string
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RadiologyPersonalTabProps {
	data: RadiologyProfilePersonal
	onChange: (updated: Partial<RadiologyProfilePersonal>) => void
}

const verifiedAdornment = (
	<InputAdornment position="end">
		<CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
	</InputAdornment>
)


export default function RadiologyPersonalTab({ data, onChange }: RadiologyPersonalTabProps) {
	const [saved, setSaved] = useState(data)
	// the photo is saved by its own upload, not by this form
	const isDirty = JSON.stringify({ ...data, avatar: '' }) !== JSON.stringify({ ...saved, avatar: '' })

	const handleSave = async () => {
		try {
			const payload: Record<string, string | null> = {}
			if (data.name !== saved.name) payload.owner_name = data.name
			if (data.alternateMobile !== saved.alternateMobile) payload.alternate_mobile = data.alternateMobile || null
			if (data.whatsappNumber !== saved.whatsappNumber) payload.whatsapp_number = data.whatsappNumber || null

			if (Object.keys(payload).length === 0) {
				toast.info('No changes to save.')
				return
			}

			await updateMyRadiologyProfile(payload)
			setSaved(data)
			toast.success('Changes saved successfully!')
		} catch {
			toast.error('Something went wrong. Please try again.')
		}
	}

	return (
		<Box sx={{ ...customCardStyle }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Personal Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Full Name *"
							value={data.name}
							placeholder="Enter your full name"
							onChange={(e) => onChange({ name: e.target.value })}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Email ID *"
							value={data.email}
							placeholder="Enter your email"
							type="email"
							disabled
							InputProps={{ endAdornment: data.emailVerified ? verifiedAdornment : undefined }}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Mobile Number *"
							value={data.contactNumber}
							placeholder="+91 XXXXXXXXXX"
							type="tel"
							disabled
							InputProps={{ endAdornment: data.contactVerified ? verifiedAdornment : undefined }}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="Alternate Mobile Number"
							value={data.alternateMobile}
							placeholder="Enter alternate mobile number"
							type="tel"
							onChange={(e) => onChange({ alternateMobile: e.target.value })}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<AppInput
							label="WhatsApp Number"
							value={data.whatsappNumber}
							placeholder="Enter WhatsApp number"
							type="tel"
							onChange={(e) => onChange({ whatsappNumber: e.target.value })}
						/>
					</Grid>
				</Grid>
			</Box>

			<ProfileFormActions isDirty={isDirty} onSave={handleSave} showSuccess={false} onCloseSnackbar={() => {}} />
		</Box>
	)
}
