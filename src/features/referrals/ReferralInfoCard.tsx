// src/features/referrals/ReferralInfoCard.tsx
import { Box, Typography, Avatar, Divider } from '@mui/material'
import CallMadeIcon from '@mui/icons-material/CallMade'
import NotesIcon from '@mui/icons-material/Notes'
import { formatDoctorName } from '../../utils/Utils'
import { buildS3Url } from '../../utils/s3'

interface Props {
	referral: {
		id: string
		referring_doctor: {
			id: string
			name: string
			avatar_s3_key?: string | null
			avatar_url?: string | null
			avatar?: string | null
			profile_picture?: string | null
			photo_url?: string | null
			image_url?: string | null
		}
		notes: string | null
		status: string
	}
}

/**
 * Displayed inside Doctor 2's appointment details to show referral provenance.
 * Mirrors the InfoRow style used in AppointmentDetailsDrawer.tsx.
 */
export default function ReferralInfoCard({ referral }: Props) {
	const doctorAvatar =
		referral.referring_doctor.avatar_url ||
		referral.referring_doctor.avatar_s3_key ||
		referral.referring_doctor.avatar ||
		referral.referring_doctor.profile_picture ||
		referral.referring_doctor.photo_url ||
		referral.referring_doctor.image_url
	const doctorAvatarUrl = buildS3Url(doctorAvatar)

	return (
		<Box
			sx={{
				mt: 1.5,
				p: 1.5,
				borderRadius: '12px',
				bgcolor: '#fff',
				border: '1px solid rgba(12,124,124,0.2)',
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
				<CallMadeIcon sx={{ fontSize: 14, color: '#0c7c7c' }} />
				<Typography fontSize={12} fontWeight={700} color="#0c7c7c" textTransform="uppercase" letterSpacing={0.5}>
					Referral From
				</Typography>
			</Box>

			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
				<Avatar
					src={doctorAvatarUrl || undefined}
					alt={referral.referring_doctor.name}
					sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}
				>
					{referral.referring_doctor.name?.replace(/^Dr\.?\s*/i, '').charAt(0) ?? 'D'}
				</Avatar>
				<Typography fontSize={13} fontWeight={600} color="text.primary">
					{formatDoctorName(referral.referring_doctor.name)}
				</Typography>
			</Box>

			{referral.notes && (
				<>
					<Divider sx={{ my: 1 }} />
					<Box sx={{ display: 'flex', gap: 0.8, alignItems: 'flex-start' }}>
						<NotesIcon sx={{ fontSize: 14, color: 'text.disabled', mt: 0.1, flexShrink: 0 }} />
						<Typography fontSize={12} color="text.secondary" fontStyle="italic">
							{referral.notes}
						</Typography>
					</Box>
				</>
			)}
		</Box>
	)
}
