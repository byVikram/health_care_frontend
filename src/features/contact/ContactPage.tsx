// src/features/contact/ContactPage.tsx
import { useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, ButtonBase, Container, Dialog, IconButton, MenuItem, TextField, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import { ROUTES } from '../../constants/routes'
import { DESK } from '../../styles/deskTokens'

const ROLES = ['Patient', 'Doctor', 'Nurse or physio', 'Lab or clinic partner', 'Other']
const TOPICS = ['Booking help', 'Cancellation or refund', 'Payment issue', 'Reports and records', 'Join as a provider', 'Feedback', 'Other']
const MAX_MESSAGE = 1000

const INFO: { icon: ElementType; title: string; line: string; note: string; to?: string }[] = [
	{ icon: HelpOutlineIcon, title: 'Help centre', line: 'Answers to common questions', note: 'Bookings, refunds, reports and more' },
	{ icon: MailOutlineIcon, title: 'Email', line: '[support email]', note: 'Replies within one working day' },
	{ icon: PhoneOutlinedIcon, title: 'Call us', line: '[support phone]', note: '8 AM – 10 PM, every day' },
	{
		icon: LocationOnOutlinedIcon,
		title: 'Registered office',
		line: '[Company name], [address line], Bengaluru, Karnataka [PIN]',
		note: 'Not a clinic · no walk-in appointments',
	},
]

type Errors = Partial<Record<'name' | 'email' | 'mobile' | 'topic' | 'message', string>>

const fieldSx = {
	'& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff', '& fieldset': { borderColor: DESK.lineStrong } },
	'& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: DESK.primary },
}

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
	return (
		<Typography sx={{ fontWeight: 700, fontSize: 14, color: DESK.ink, mb: 0.75 }}>
			{children}
			{required && <span style={{ color: DESK.danger }}> *</span>}
		</Typography>
	)
}

function SolidButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
	return (
		<ButtonBase
			onClick={onClick}
			disabled={disabled}
			sx={{
				px: 4,
				py: 1.75,
				borderRadius: '12px',
				bgcolor: DESK.primary,
				color: '#fff',
				fontWeight: 700,
				fontSize: 16,
				opacity: disabled ? 0.6 : 1,
				'&:hover': { bgcolor: DESK.primaryDark },
			}}
		>
			{label}
		</ButtonBase>
	)
}

export default function ContactPage() {
	const navigate = useNavigate()
	const [role, setRole] = useState(ROLES[0])
	const [name, setName] = useState('')
	const [mobile, setMobile] = useState('')
	const [email, setEmail] = useState('')
	const [topic, setTopic] = useState('')
	const [message, setMessage] = useState('')
	const [errors, setErrors] = useState<Errors>({})
	const [sending, setSending] = useState(false)
	const [sent, setSent] = useState<{ name: string; email: string; reference?: string } | null>(null)

	const reset = () => {
		setRole(ROLES[0])
		setName('')
		setMobile('')
		setEmail('')
		setTopic('')
		setMessage('')
		setErrors({})
	}

	const validate = (): Errors => {
		const e: Errors = {}
		if (!name.trim()) e.name = 'Enter your name'
		if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Enter a valid email'
		if (mobile && !/^\d{10}$/.test(mobile)) e.mobile = 'Enter a 10-digit number'
		if (!topic) e.topic = 'Choose a topic'
		if (!message.trim()) e.message = 'Tell us how we can help'
		return e
	}

	const submit = async () => {
		const e = validate()
		setErrors(e)
		if (Object.keys(e).length > 0) return
		setSending(true)
		try {
			const res = await ApiService.post<{ data?: { reference?: string } }>(API_ENDPOINTS.CONTACT_INQUIRIES.CREATE, {
				role,
				name: name.trim(),
				mobile: mobile || undefined,
				email: email.trim(),
				topic,
				message: message.trim(),
			})
			setSent({ name: name.trim(), email: email.trim(), reference: res.data?.data?.reference })
		} catch {
			// ApiService already shows the error toast.
		} finally {
			setSending(false)
		}
	}

	const firstName = sent?.name.split(' ')[0]

	return (
		<Box sx={{ bgcolor: '#fff' }}>
			{/* Title band */}
			<Box
				sx={{
					background: `linear-gradient(180deg, ${DESK.primarySoft} 0%, ${DESK.primaryTint} 100%)`,
					borderBottom: `1px solid ${DESK.lineSoft}`,
					py: { xs: 3, md: 4 },
				}}
			>
				<Container maxWidth="lg">
					<Box sx={{ display: 'flex', gap: 1, fontSize: 14, color: DESK.muted, mb: 2 }}>
						<Box component={RouterLink} to={ROUTES.ROOT} sx={{ color: DESK.primary, fontWeight: 600, textDecoration: 'none' }}>
							Home
						</Box>
						<span>/</span>
						<span>Contact us</span>
					</Box>
					<Typography component="h1" sx={{ fontWeight: 800, color: DESK.ink, fontSize: { xs: 30, md: 40 } }}>
						Contact us
					</Typography>
					<Typography sx={{ color: DESK.muted, mt: 1 }}>
						Questions about a booking, a refund or working with us? Send a message and our team replies within one working day.
					</Typography>
				</Container>
			</Box>

			<Container maxWidth="lg" sx={{ pt: { xs: 3, md: 4 }, pb: { xs: 4, md: 6 } }}>
				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2.4fr 1fr' }, gap: 3, alignItems: 'start' }}>
					{/* Form */}
					<Box sx={{ border: `1px solid ${DESK.lineStrong}`, borderRadius: '24px', p: { xs: 3, md: 6 }, boxShadow: '0 4px 20px rgba(16,24,40,0.06)' }}>
						<Typography component="h2" sx={{ fontWeight: 800, fontSize: 26, color: DESK.ink, mb: 3 }}>
							Send us a message
						</Typography>

						<Label>I am a</Label>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
							{ROLES.map((r) => {
								const on = r === role
								return (
									<ButtonBase
										key={r}
										onClick={() => setRole(r)}
										aria-pressed={on}
										sx={{
											px: 3,
											py: 1.25,
											borderRadius: 999,
											fontWeight: 700,
											border: `1.5px solid ${on ? DESK.primary : DESK.lineStrong}`,
											bgcolor: on ? DESK.primarySoft : '#fff',
											color: on ? DESK.primary : DESK.ink,
										}}
									>
										{r}
									</ButtonBase>
								)
							})}
						</Box>

						<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
							<Box>
								<Label required>Full name</Label>
								<TextField
									fullWidth
									placeholder="Your name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									error={!!errors.name}
									helperText={errors.name}
									sx={fieldSx}
								/>
							</Box>
							<Box>
								<Label>Mobile number</Label>
								<TextField
									fullWidth
									placeholder="10-digit number"
									value={mobile}
									onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
									error={!!errors.mobile}
									helperText={errors.mobile}
									slotProps={{
										htmlInput: { inputMode: 'numeric' },
										input: {
											startAdornment: (
												<Box
													sx={{
														alignSelf: 'stretch',
														display: 'flex',
														alignItems: 'center',
														px: 2,
														mr: 1.5,
														ml: -1.75,
														bgcolor: DESK.primaryTint,
														borderRight: `1px solid ${DESK.lineStrong}`,
														borderRadius: '12px 0 0 12px',
														fontWeight: 700,
														color: DESK.ink,
													}}
												>
													+91
												</Box>
											),
										},
									}}
									sx={fieldSx}
								/>
							</Box>
							<Box>
								<Label required>Email</Label>
								<TextField
									fullWidth
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									error={!!errors.email}
									helperText={errors.email}
									sx={fieldSx}
								/>
							</Box>
							<Box>
								<Label required>Topic</Label>
								<TextField
									select
									fullWidth
									value={topic}
									onChange={(e) => setTopic(e.target.value)}
									error={!!errors.topic}
									helperText={errors.topic}
									slotProps={{ select: { displayEmpty: true } }}
									sx={fieldSx}
								>
									<MenuItem value="" disabled>
										Choose a topic
									</MenuItem>
									{TOPICS.map((t) => (
										<MenuItem key={t} value={t}>
											{t}
										</MenuItem>
									))}
								</TextField>
							</Box>
						</Box>

						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
							<Label required>Message</Label>
							<Typography sx={{ fontSize: 13, color: DESK.muted }}>
								{message.length}/{MAX_MESSAGE}
							</Typography>
						</Box>
						<TextField
							fullWidth
							multiline
							minRows={7}
							placeholder="Tell us what happened and how we can help."
							value={message}
							onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
							error={!!errors.message}
							helperText={errors.message}
							sx={fieldSx}
						/>
						<Typography sx={{ fontSize: 13, color: DESK.muted, mt: 1, mb: 4 }}>
							Please don’t share medical reports or card numbers here. Our team will ask for them securely if needed.
						</Typography>

						<SolidButton label={sending ? 'Sending…' : 'Send message'} onClick={submit} disabled={sending} />
					</Box>

					{/* Info card */}
					<Box
						sx={{
							border: `1px solid ${DESK.lineStrong}`,
							boxShadow: '0 4px 20px rgba(16,24,40,0.06)',
							borderRadius: '24px',
							px: 3,
							py: 1.5,
							bgcolor: '#fff',
							position: { md: 'sticky' },
							top: { md: 88 }, // 64px fixed navbar + 24px gap
						}}
					>
						{INFO.map((item, i) => (
							<Box
								key={item.title}
								sx={{ display: 'flex', gap: 2, py: 2.25, borderTop: i ? `1px solid ${DESK.lineSoft}` : 'none' }}
							>
								<Box
									sx={{
										flexShrink: 0,
										width: 56,
										height: 56,
										borderRadius: '14px',
										bgcolor: DESK.primarySoft,
										color: DESK.primary,
										display: 'grid',
										placeItems: 'center',
									}}
								>
									<item.icon />
								</Box>
								<Box>
									<Typography sx={{ fontWeight: 800, color: DESK.ink }}>{item.title}</Typography>
									<Typography sx={{ color: DESK.inkSoft }}>{item.line}</Typography>
									<Typography sx={{ color: DESK.muted, fontSize: 14 }}>{item.note}</Typography>
								</Box>
							</Box>
						))}
					</Box>
				</Box>
			</Container>

			{/* Sent */}
			<Dialog
				open={!!sent}
				onClose={() => setSent(null)}
				slotProps={{ paper: { sx: { borderRadius: '24px', p: 3, maxWidth: 480, width: '100%', textAlign: 'center' } } }}
			>
				<IconButton
					aria-label="Close"
					onClick={() => setSent(null)}
					sx={{ position: 'absolute', right: 16, top: 16, bgcolor: DESK.page, borderRadius: '10px' }}
				>
					<CloseIcon />
				</IconButton>
				<Box
					sx={{
						mx: 'auto',
						mt: 1,
						mb: 2.5,
						width: 80,
						height: 80,
						borderRadius: '50%',
						bgcolor: DESK.successSoft,
						color: DESK.success,
						display: 'grid',
						placeItems: 'center',
					}}
				>
					<CheckIcon sx={{ fontSize: 40 }} />
				</Box>
				<Typography sx={{ fontWeight: 800, fontSize: 28, color: DESK.ink, mb: 1.5 }}>Message sent</Typography>
				<Typography sx={{ color: DESK.muted, lineHeight: 1.6, mb: 3 }}>
					Thanks, {firstName}.{' '}
					{sent?.reference && (
						<>
							Your reference is <b style={{ color: DESK.ink }}>{sent.reference}</b>.{' '}
						</>
					)}
					We’ll reply to {sent?.email} within one working day.
				</Typography>
				<Box sx={{ display: 'flex', gap: 1.5 }}>
					<ButtonBase
						onClick={() => {
							reset()
							setSent(null)
						}}
						sx={{ flex: 1, py: 1.75, borderRadius: '12px', border: `1px solid ${DESK.lineStrong}`, fontWeight: 700, color: DESK.ink }}
					>
						Send another
					</ButtonBase>
					<ButtonBase
						onClick={() => navigate(ROUTES.ROOT)}
						sx={{ flex: 1, py: 1.75, borderRadius: '12px', bgcolor: DESK.primary, color: '#fff', fontWeight: 700, '&:hover': { bgcolor: DESK.primaryDark } }}
					>
						Back to home
					</ButtonBase>
				</Box>
			</Dialog>
		</Box>
	)
}
