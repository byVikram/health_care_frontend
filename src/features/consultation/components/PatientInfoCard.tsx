// src/features/consultation/components/PatientInfoCard.tsx
import { Box, Typography, Avatar, Divider } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import { ConsultationPatient } from '../../../types/consultation'
import { customCardStyle } from '../../../styles/commonStyles'

interface PatientInfoCardProps {
	patient: ConsultationPatient
}

function Label({ children, fontSize = '12px' }: { children: React.ReactNode; fontSize?: string }) {
	return (
		<Typography component="span" fontSize={fontSize} sx={{ color: 'primary.main', fontWeight: 400 }}>
			{children}
		</Typography>
	)
}

function Value({ children, fontSize = '12px' }: { children: React.ReactNode; fontSize?: string }) {
	return (
		<Typography component="span" fontWeight={500} fontSize={fontSize} sx={{ color: 'text.primary', ml: 1 }}>
			{children}
		</Typography>
	)
}

function Row({ label, value, fontSize }: { label: string; value: string; fontSize?: string }) {
	return (
		<Box>
			<Label fontSize={fontSize}>{label}</Label>
			<Value fontSize={fontSize}>{value || '—'}</Value>
		</Box>
	)
}

export default function PatientInfoCard({ patient }: PatientInfoCardProps) {
	return (
		<Box
			sx={{
				...customCardStyle,
			}}
		>
			<Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
				Patient Details
			</Typography>

			{/* Top: Avatar + basic info */}
			<Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
				<Box sx={{ position: 'relative', flexShrink: 0 }}>
					<Avatar
						src={patient.avatar || undefined}
						alt={patient.name}
						sx={{
							width: 80,
							height: 80,
							borderRadius: '8px',
						}}
					/>
					<Box
						sx={{
							position: 'absolute',
							top: 2,
							right: 2,
							bgcolor: 'primary.main',
							borderRadius: '4px',
							p: 0.3,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<HomeOutlinedIcon sx={{ fontSize: 12, color: '#fff' }} />
					</Box>
				</Box>

				<Box sx={{ display: 'flex', gap: 4 }}>
					{/* Left sub-column */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
						<Box>
							<Label>Name: </Label>
							<Value>{patient.name}</Value>
						</Box>
						<Box>
							<Label>Age: </Label>
							<Value>{patient.age} years</Value>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Label>Phone: </Label>
							<Value>{patient.phone}</Value>
							{patient.phoneVerified && <PhoneIcon sx={{ fontSize: 14, color: 'success.main' }} />}
						</Box>
					</Box>

					<Divider orientation="vertical" flexItem />

					{/* Right sub-column */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
						<Row label="Gender:" value={patient.gender} />
						<Row label="Blood group:" value={patient.bloodGroup} />
						<Row label="Height:" value={patient.height} />
						<Row label="Weight:" value={patient.weight} />
					</Box>
				</Box>
			</Box>

			<Divider sx={{ mb: 2 }} />

			{/* Second row: DOB, Address, Emergency Contact */}
			<Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
				{/* Left */}
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, minWidth: 140 }}>
					<Row label="D.O.B:" value={patient.dateOfBirth} />
					<Row label="Marital status:" value={patient.maritalStatus} />
					<Row label="Email:" value={patient.email} />
					<Row label="Weight:" value={patient.weight} />
				</Box>

				<Divider orientation="vertical" flexItem />

				{/* Middle: Address */}
				<Box sx={{ flex: 1 }}>
					<Label>Address:</Label>
					<Typography
						variant="body2"
						sx={{ color: 'text.primary', fontSize: '12px', mt: 0.3, lineHeight: 1.6 }}
					>
						{patient.address}
					</Typography>
				</Box>

				<Divider orientation="vertical" flexItem />

				{/* Right: Emergency Contact */}
				<Box sx={{ minWidth: 140 }}>
					<Label>Emergency Contact:</Label>
					<Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
						<Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
							{patient.emergencyContact.name}
						</Typography>
						{patient.emergencyContact.relation && (
							<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
								({patient.emergencyContact.relation})
							</Typography>
						)}
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Typography variant="body2" sx={{ fontSize: '13px' }}>
								{patient.emergencyContact.number}
							</Typography>
							<PhoneIcon sx={{ fontSize: 14, color: 'error.main' }} />
						</Box>
					</Box>
				</Box>
			</Box>

			<Divider sx={{ mb: 2 }} />

			{/* Third row: Chronic diseases, Occupation/Lifestyle, Allergies */}
			<Box sx={{ display: 'flex', gap: 3 }}>
				{/* Chronic diseases */}
				<Box sx={{ flex: 1 }}>
					<Label>Chronic diseases:</Label>
					<Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
						{patient.chronicDiseases.length > 0 ? (
							patient.chronicDiseases.map((d) => (
								<Typography key={d} variant="body2" sx={{ fontSize: '11px', color: 'text.primary' }}>
									{d}
								</Typography>
							))
						) : (
							<Typography variant="body2" sx={{ fontSize: '11px', color: 'text.disabled' }}>
								None
							</Typography>
						)}
					</Box>
				</Box>

				<Divider orientation="vertical" flexItem />

				{/* Occupation + Lifestyle */}
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
					<Row label="Occupation:" value={patient.occupation} fontSize="11px" />
					<Row label="Smoking:" value={patient.smokingStatus} fontSize="11px" />
					<Row label="Alcohol:" value={patient.alcoholConsumption} fontSize="11px" />
					<Row label="Food preference:" value={patient.dietType} fontSize="11px" />
				</Box>

				<Divider orientation="vertical" flexItem />

				{/* Allergies */}
				<Box sx={{ flex: 1 }}>
					<Label>Allergies:</Label>
					<Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
						{patient.allergies.length > 0 ? (
							patient.allergies.map((a) => (
								<Typography key={a} variant="body2" sx={{ fontSize: '11px', color: 'text.primary' }}>
									{a}
								</Typography>
							))
						) : (
							<Typography variant="body2" sx={{ fontSize: '11px', color: 'text.disabled' }}>
								None
							</Typography>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
