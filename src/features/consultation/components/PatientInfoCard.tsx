// src/features/consultation/components/PatientInfoCard.tsx
import { Box, Typography, Avatar, Divider } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import { ConsultationPatient } from '../../../types/consultation'
import { customCardStyle } from '../../../styles/commonStyles'

interface PatientInfoCardProps {
	patient: ConsultationPatient
}

function Label({ children }: { children: React.ReactNode }) {
	return (
		<Typography component="span" sx={{ color: 'primary.main', fontWeight: 400 }}>
			{children}
		</Typography>
	)
}

function Value({ children }: { children: React.ReactNode }) {
	return (
		<Typography component="span" sx={{ color: 'text.primary', ml: 1 }}>
			{children}
		</Typography>
	)
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<Box>
			<Label>{label}</Label>
			<Value>{value || '�'}</Value>
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
						src={patient.avatar}
						alt={patient.name}
						sx={{ width: 80, height: 80, border: '2px solid', borderColor: 'primary.main' }}
					/>
					<Box
						sx={{
							position: 'absolute',
							bottom: 2,
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
							<Label>Patient ID: </Label>
							<Value>{patient.patientId}</Value>
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

				{/* Middle: Address */}
				<Box sx={{ flex: 1 }}>
					<Label>Address:</Label>
					<Typography
						variant="body2"
						sx={{ color: 'text.primary', fontSize: '13px', mt: 0.3, lineHeight: 1.6 }}
					>
						{patient.address}
					</Typography>
				</Box>

				{/* Right: Emergency Contact */}
				<Box sx={{ minWidth: 140 }}>
					<Label>Emergency Contact:</Label>
					<Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
						<Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
							{patient.emergencyContact.name}
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
							({patient.emergencyContact.relation})
						</Typography>
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
								<Typography key={d} variant="body2" sx={{ fontSize: '13px', color: 'text.primary' }}>
									{d}
								</Typography>
							))
						) : (
							<Typography variant="body2" sx={{ fontSize: '13px', color: 'text.disabled' }}>
								None
							</Typography>
						)}
					</Box>
				</Box>

				{/* Occupation + Lifestyle */}
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
					<Row label="Occupation:" value={patient.occupation} />
					<Row label="Smoking:" value={patient.smokingStatus} />
					<Row label="Alcohol:" value={patient.alcoholConsumption} />
					<Row label="Food preference:" value={patient.dietType} />
				</Box>

				{/* Allergies */}
				<Box sx={{ flex: 1 }}>
					<Label>Allergies:</Label>
					<Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
						{patient.allergies.length > 0 ? (
							patient.allergies.map((a) => (
								<Typography key={a} variant="body2" sx={{ fontSize: '13px', color: 'text.primary' }}>
									{a}
								</Typography>
							))
						) : (
							<Typography variant="body2" sx={{ fontSize: '13px', color: 'text.disabled' }}>
								None
							</Typography>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
