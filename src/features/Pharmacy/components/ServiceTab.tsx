import { type KeyboardEvent, type ReactNode, useEffect, useState } from 'react'
import { Box, Divider, Grid, Switch, Typography } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import AppInput from '../../../components/common/Input/AppInput'
import ProfileFormActions from '../../../components/common/ProfileFormActions/ProfileFormActions'
import { customCardStyle } from '../../../styles/commonStyles'
import { toast } from 'react-toastify'
import { updateMyPharmacyDetails, type PharmacyDetailsUpdatePayload } from '../pharmacyService'
import 'react-toastify/dist/ReactToastify.css'

const TEAL = '#2B6F71'

export interface PharmacyProfileServices {
	is_24_x_7: boolean
	open_days: string[]
	operating_hours: Record<string, string>
	home_delivery_available: boolean
	delivery_radius_km: string
	estimated_delivery_time_mins: string
	min_order_amount: string
	emergency_medicine_available: boolean
	payment_methods: string[]
}

interface PharmacyServiceTabProps {
	data: PharmacyProfileServices
	onChange: (updated: Partial<PharmacyProfileServices>) => void
}

const DAY_OPTIONS = [
	{ value: 'monday', label: 'Monday', shortLabel: 'Mon' },
	{ value: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
	{ value: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
	{ value: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
	{ value: 'friday', label: 'Friday', shortLabel: 'Fri' },
	{ value: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
	{ value: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
]

const PAYMENT_METHOD_OPTIONS = [
	{ value: 'cash', label: 'Cash' },
	{ value: 'upi', label: 'UPI' },
	{ value: 'credit_card', label: 'Credit Card' },
	{ value: 'debit_card', label: 'Debit Card' },
	{ value: 'net_banking', label: 'Net Banking' },
]

const switchSx = {
	width: 48,
	height: 26,
	padding: 0,
	'& .MuiSwitch-switchBase': {
		padding: 0,
		margin: '3px',
		transitionDuration: '300ms',
		'&.Mui-checked': {
			transform: 'translateX(22px)',
			color: '#fff',
			'& + .MuiSwitch-track': {
				backgroundColor: TEAL,
				opacity: 1,
				border: 0,
			},
		},
	},
	'& .MuiSwitch-thumb': {
		boxSizing: 'border-box',
		width: 20,
		height: 20,
		boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
	},
	'& .MuiSwitch-track': {
		borderRadius: 13,
		backgroundColor: '#E2E8F0',
		opacity: 1,
		transition: 'background-color 300ms',
	},
}

function SectionTitle({ children }: { children: ReactNode }) {
	return (
		<Typography sx={{ color: 'text.primary', fontSize: '15px', fontWeight: 700, mb: 1.75 }}>
			{children}
		</Typography>
	)
}

function FieldLabel({ children }: { children: ReactNode }) {
	return (
		<Typography sx={{ color: 'text.primary', fontSize: '12px', fontWeight: 600, mb: 0.9 }}>
			{children}
		</Typography>
	)
}

function ToggleRow({
	label,
	description,
	checked,
	onChange,
}: {
	label: string
	description: string
	checked: boolean
	onChange: (checked: boolean) => void
}) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
			<Box sx={{ flex: 1, pr: 1 }}>
				<Typography sx={{ color: 'text.primary', fontSize: '13px', fontWeight: 600 }}>{label}</Typography>
				<Typography sx={{ color: 'text.secondary', fontSize: '11px', mt: 0.45 }}>{description}</Typography>
			</Box>
			<Switch checked={checked} onChange={(e) => onChange(e.target.checked)} sx={switchSx} />
		</Box>
	)
}

function SelectPill({
	label,
	selected,
	onClick,
}: {
	label: string
	selected: boolean
	onClick: () => void
}) {
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
			sx={{
				height: 42,
				minWidth: 68,
				px: 2.1,
				borderRadius: '12px',
				border: '1px solid',
				borderColor: selected ? TEAL : '#D7DEE6',
				bgcolor: selected ? TEAL : '#fff',
				color: selected ? '#fff' : '#5F6B76',
				fontSize: '15px',
				fontWeight: selected ? 700 : 600,
				boxShadow: selected ? '0 6px 16px rgba(43,111,113,0.18)' : '0 2px 8px rgba(15,23,42,0.04)',
				cursor: 'pointer',
				transition: 'all 0.18s ease',
				'&:hover': {
					borderColor: TEAL,
					color: selected ? '#fff' : TEAL,
					transform: 'translateY(-1px)',
				},
			}}
		>
			{label}
		</Box>
	)
}

function PaymentMethodRow({
	label,
	selected,
	onToggle,
}: {
	label: string
	selected: boolean
	onToggle: () => void
}) {
	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			onToggle()
		}
	}

	return (
		<Box
			role="checkbox"
			aria-checked={selected}
			tabIndex={0}
			onClick={onToggle}
			onKeyDown={handleKeyDown}
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: 1.5,
				border: '1px solid',
				borderColor: selected ? 'rgba(43,111,113,0.35)' : 'divider',
				bgcolor: selected ? 'rgba(43,111,113,0.06)' : '#fff',
				borderRadius: '10px',
				px: 1.5,
				py: 1.15,
				cursor: 'pointer',
				transition: 'all 0.18s ease',
				'&:hover': {
					borderColor: TEAL,
				},
				'&:focus-visible': {
					outline: '2px solid rgba(43,111,113,0.25)',
					outlineOffset: '2px',
				},
			}}
		>
			<Typography sx={{ color: 'text.primary', fontSize: '13px', fontWeight: 500 }}>{label}</Typography>
			{selected ? (
				<CheckCircleRoundedIcon sx={{ color: TEAL, fontSize: 20 }} />
			) : (
				<RadioButtonUncheckedRoundedIcon sx={{ color: '#B5C0C8', fontSize: 20 }} />
			)}
		</Box>
	)
}

function getOrderedValues(source: string[], order: { value: string }[]) {
	return order.filter((item) => source.includes(item.value)).map((item) => item.value)
}

function parseOperatingHours(value: string) {
	if (!value || value === '24 Hours') {
		return { opensAt: '', closesAt: '' }
	}

	const [opensAt = '', ...rest] = value.split(/\s*-\s*/)
	return {
		opensAt,
		closesAt: rest.join(' - '),
	}
}

function buildOperatingHoursValue(opensAt: string, closesAt: string) {
	const trimmedOpen = opensAt.trim()
	const trimmedClose = closesAt.trim()

	if (trimmedOpen && trimmedClose) {
		return `${trimmedOpen} - ${trimmedClose}`
	}

	return trimmedOpen || trimmedClose
}

function getCurrentOperatingHours(openDays: string[], operatingHours: Record<string, string>) {
	const orderedDays = [...openDays, ...DAY_OPTIONS.map((day) => day.value).filter((day) => !openDays.includes(day))]
	const firstValue = orderedDays.map((day) => operatingHours[day]).find((value) => value && value !== '24 Hours') ?? ''

	return parseOperatingHours(firstValue)
}

function parseNullableNumber(value: string) {
	const trimmedValue = value.trim()
	if (!trimmedValue) {
		return null
	}

	const parsedValue = Number(trimmedValue)
	return Number.isFinite(parsedValue) ? parsedValue : null
}

export default function PharmacyServiceTab({ data, onChange }: PharmacyServiceTabProps) {
	const [isDirty, setIsDirty] = useState(false)
	const [saved, setSaved] = useState(data)
	const { opensAt, closesAt } = getCurrentOperatingHours(data.open_days, data.operating_hours)
	const hoursDisabled = data.is_24_x_7 || data.open_days.length === 0

	useEffect(() => {
		setIsDirty(JSON.stringify(data) !== JSON.stringify(saved))
	}, [data, saved])

	const handleSave = async () => {
		try {
			const payload: PharmacyDetailsUpdatePayload = {
				is_24_x_7: data.is_24_x_7,
				open_days: data.open_days,
				operating_hours: data.is_24_x_7
					? data.open_days.reduce<Record<string, string>>((acc, day) => {
							acc[day] = '24 Hours'
							return acc
					  }, {})
					: data.operating_hours,
				home_delivery_available: data.home_delivery_available,
				delivery_radius_km: data.home_delivery_available ? parseNullableNumber(data.delivery_radius_km) : null,
				estimated_delivery_time_mins: data.home_delivery_available
					? parseNullableNumber(data.estimated_delivery_time_mins)
					: null,
				min_order_amount: data.home_delivery_available ? parseNullableNumber(data.min_order_amount) : null,
				emergency_medicine_available: data.emergency_medicine_available,
				payment_methods: data.payment_methods,
			}

			await updateMyPharmacyDetails(payload)
			setSaved(data)
			setIsDirty(false)
			toast.success('Service details saved successfully!')
		} catch {
			toast.error('Something went wrong. Please try again.')
		}
	}

	const toggleOpenDay = (day: string) => {
		const nextDays = data.open_days.includes(day)
			? data.open_days.filter((item) => item !== day)
			: [...data.open_days, day]
		const orderedDays = getOrderedValues(nextDays, DAY_OPTIONS)
		const currentHoursValue = buildOperatingHoursValue(opensAt, closesAt)
		const operatingHours = orderedDays.reduce<Record<string, string>>((acc, item) => {
			const existingValue = data.operating_hours[item]
			acc[item] = existingValue ?? currentHoursValue
			return acc
		}, {})

		onChange({
			open_days: orderedDays,
			operating_hours: operatingHours,
		})
	}

	const handleOperatingHourChange = (field: 'opensAt' | 'closesAt', value: string) => {
		if (data.open_days.length === 0) {
			return
		}

		const nextOpen = field === 'opensAt' ? value : opensAt
		const nextClose = field === 'closesAt' ? value : closesAt
		const combinedValue = buildOperatingHoursValue(nextOpen, nextClose)

		onChange({
			operating_hours: data.open_days.reduce<Record<string, string>>((acc, day) => {
				acc[day] = combinedValue
				return acc
			}, {}),
		})
	}

	const handleTwentyFourSevenChange = (checked: boolean) => {
		onChange({
			is_24_x_7: checked,
		})
	}

	const handleHomeDeliveryChange = (checked: boolean) => {
		onChange({
			home_delivery_available: checked,
			...(checked
				? {}
				: {
						delivery_radius_km: '',
						estimated_delivery_time_mins: '',
						min_order_amount: '',
				  }),
		})
	}

	const togglePaymentMethod = (method: string) => {
		const nextMethods = data.payment_methods.includes(method)
			? data.payment_methods.filter((item) => item !== method)
			: [...data.payment_methods, method]

		onChange({
			payment_methods: getOrderedValues(nextMethods, PAYMENT_METHOD_OPTIONS),
		})
	}

	return (
		<Box sx={{ ...customCardStyle, p: { xs: 2.5, md: 3 } }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
				Service Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
					<SectionTitle>Availability</SectionTitle>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
						<ToggleRow
							label="Open 24 x 7"
							description="Enable if your pharmacy operates round the clock."
							checked={data.is_24_x_7}
							onChange={handleTwentyFourSevenChange}
						/>

						<Divider />

						<Box>
							<Typography sx={{ color: '#0F172A', fontSize: '15px', fontWeight: 700, mb: 1.4 }}>
								Operating Hours
							</Typography>
							<Grid container spacing={1.6}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<FieldLabel>Opens at</FieldLabel>
									<AppInput
										value={opensAt}
										placeholder="08:00 AM"
										disabled={hoursDisabled}
										onChange={(e) => handleOperatingHourChange('opensAt', e.target.value)}
										sx={{
											'& .MuiOutlinedInput-root': {
												bgcolor: hoursDisabled ? '#EEF2F5' : '#FFFFFF',
											},
										}}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<FieldLabel>Closes at</FieldLabel>
									<AppInput
										value={closesAt}
										placeholder="10:00 PM"
										disabled={hoursDisabled}
										onChange={(e) => handleOperatingHourChange('closesAt', e.target.value)}
										sx={{
											'& .MuiOutlinedInput-root': {
												bgcolor: hoursDisabled ? '#EEF2F5' : '#FFFFFF',
											},
										}}
									/>
								</Grid>
							</Grid>
							{data.is_24_x_7 && (
								<Typography sx={{ color: 'text.secondary', fontSize: '11px', mt: 1.25 }}>
									Operating hours are disabled while 24 x 7 is enabled.
								</Typography>
							)}
							{!data.is_24_x_7 && data.open_days.length === 0 && (
								<Typography sx={{ color: 'text.secondary', fontSize: '11px', mt: 1.25 }}>
									Select at least one open day to edit operating hours.
								</Typography>
							)}
						</Box>

						<Divider />

						<Box>
							<Typography sx={{ color: '#0F172A', fontSize: '15px', fontWeight: 700, mb: 1.4 }}>
								Open Days
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
								{DAY_OPTIONS.map((day) => (
									<SelectPill
										key={day.value}
										label={day.shortLabel}
										selected={data.open_days.includes(day.value)}
										onClick={() => toggleOpenDay(day.value)}
									/>
								))}
							</Box>
						</Box>
					</Box>
				</Box>

				<Divider />

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
					<SectionTitle>Delivery Services</SectionTitle>
					<ToggleRow
						label="Home Delivery Available"
						description="Enable if your pharmacy provides home delivery."
						checked={data.home_delivery_available}
						onChange={handleHomeDeliveryChange}
					/>

					<Grid container spacing={1.5}>
						<Grid size={{ xs: 12, sm: 4 }}>
							<AppInput
								label="Delivery Radius (km)"
								value={data.delivery_radius_km}
								placeholder="Enter delivery radius"
								type="number"
								disabled={!data.home_delivery_available}
								onChange={(e) => onChange({ delivery_radius_km: e.target.value })}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 4 }}>
							<AppInput
								label="Est. Delivery Time (mins)"
								value={data.estimated_delivery_time_mins}
								placeholder="Enter delivery time"
								type="number"
								disabled={!data.home_delivery_available}
								onChange={(e) => onChange({ estimated_delivery_time_mins: e.target.value })}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 4 }}>
							<AppInput
								label="Min. Order Amount (Rs)"
								value={data.min_order_amount}
								placeholder="Enter minimum order amount"
								type="number"
								disabled={!data.home_delivery_available}
								onChange={(e) => onChange({ min_order_amount: e.target.value })}
							/>
						</Grid>
					</Grid>
				</Box>

				<Divider />

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
					<SectionTitle>Additional Services</SectionTitle>
					<ToggleRow
						label="Emergency Medicine Available"
						description="Enable if your pharmacy stocks or can source emergency medicines."
						checked={data.emergency_medicine_available}
						onChange={(checked) => onChange({ emergency_medicine_available: checked })}
					/>
				</Box>

				<Divider />

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					<SectionTitle>Accepted Payment Methods</SectionTitle>
					<Grid container spacing={1.5}>
						{PAYMENT_METHOD_OPTIONS.map((method) => (
							<Grid size={{ xs: 12, md: 6 }} key={method.value}>
								<PaymentMethodRow
									label={method.label}
									selected={data.payment_methods.includes(method.value)}
									onToggle={() => togglePaymentMethod(method.value)}
								/>
							</Grid>
						))}
					</Grid>
				</Box>
			</Box>

			<ProfileFormActions
				isDirty={isDirty}
				showSuccess={false}
				onSave={handleSave}
				onCloseSnackbar={() => {}}
			/>
		</Box>
	)
}
