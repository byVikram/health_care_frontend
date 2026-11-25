// src/components/common/Navbar/LocationPickerModal.tsx
//
// "Location picker · City → Area" (location model.html), two steps in one dialog:
//   1. City: a search box, "Detect my location", the popular cities drawn as landmark icons and an
//      "Other Cities" list behind "View All Cities". Picking a city goes on to its areas.
//   2. Area: back / "Change city", an area search, the city's popular areas as cards (or the typed
//      area as a custom choice), and a footer with the summary and "Confirm location".
// Confirming sets the location ("Indiranagar, Bengaluru"), closes the dialog and confirms with a toast.

import { DESK } from '../../../styles/deskTokens'
import { getBrowserPosition } from '../../../hooks/useCurrentLocation'
import { useMemo, useState } from 'react'
import { Box, Dialog, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import VoiceMicButton from '../Voice/VoiceMicButton'

const INK = '#12373E'
const MUTED = '#5B6B6E'
const PRIMARY = '#2B6F71'
const LINE = '#D5E1E2'
const LINE_SOFT = '#E3EAEB'
const FAINT = '#7A8B8E'
const MINT = '#9FD3D1'
const TINT = '#F0F7F7'
const DISABLED = '#A3B0B2'

/** Landmark outlines for the popular cities, drawn on a 40x40 grid. */
const ICONS: Record<string, string> = {
	palace: 'M4 34h32M6 34V22h28v12M14 22v-6h12v6M17 16a3 3 0 0 1 6 0M20 9v4M10 26v4M14 26v4M26 26v4M30 26v4M18 34v-6h4v6',
	gateway: 'M5 34h30M8 34V14h24v20M8 14l3-5h18l3 5M15 34V25a5 5 0 0 1 10 0v9M11 19h3M26 19h3',
	fort: 'M4 34h32M6 34V18h28v16M6 18v-4h4v4M18 18v-4h4v4M30 18v-4h4v4M16 34v-8a4 4 0 0 1 8 0v8M10 24h2M28 24h2',
	minar: 'M5 34h30M9 34V12M31 34V12M7 12h4M29 12h4M9 12V8M31 12V8M13 34V18h14v16M17 34v-8a3 3 0 0 1 6 0v8M13 18h14',
	temple: 'M8 34h24M11 34l2-22h14l2 22M12 24h16M13 18h14M15 12h10M17 8h6M20 5v3M18 34v-6h4v6',
	wada: 'M6 34h28M8 34V15h24v19M8 15h24M12 15v-4h16v4M16 34V23h8v11M11 21h2M27 21h2M11 27h2M27 27h2',
	bridge: 'M3 25h34M8 25V10M32 25V10M8 10l12 11 12-11M14 25v-5M26 25v-5M3 31c4-2 8-2 12 0s8 2 12 0 6-2 10-1',
	mosque: 'M6 34h28M10 34V20h20v14M14 20a6 6 0 0 1 12 0M20 10v4M6 34V12M34 34V12M5 12h2M33 12h2M18 34v-6h4v6',
	palms: 'M3 32c4-2 8-2 12 0s8 2 12 0 6-2 10-1M12 30V16M12 16c-3-3-6-3-8-2M12 16c2-4 6-5 9-4M28 30V18M28 18c-3-2-6-1-8 1M28 18c2-3 5-3 7-2',
	dome: 'M5 34h30M8 34V22h24v12M12 22a8 8 0 0 1 16 0M20 10v4M14 26v4M20 26v4M26 26v4',
}

const POPULAR: [city: string, icon: keyof typeof ICONS][] = [
	['Bengaluru', 'palace'],
	['Mumbai', 'gateway'],
	['New Delhi', 'fort'],
	['Hyderabad', 'minar'],
	['Chennai', 'temple'],
	['Pune', 'wada'],
	['Kolkata', 'bridge'],
	['Ahmedabad', 'mosque'],
	['Kochi', 'palms'],
	['Mysuru', 'dome'],
]

/** Every city by state; the state itself is not shown, the list is flat and alphabetical. */
const CITIES_BY_STATE: Record<string, string[]> = {
	KA: [
		'Bengaluru',
		'Mysuru',
		'Mangaluru',
		'Hubballi-Dharwad',
		'Belagavi',
		'Kalaburagi',
		'Davanagere',
		'Shivamogga',
		'Udupi',
		'Tumakuru',
	],
	MH: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Navi Mumbai', 'Nashik', 'Aurangabad', 'Kolhapur'],
	TN: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore'],
	TS: ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam'],
	DL: ['New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi'],
	KL: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur'],
	GJ: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar'],
	WB: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol'],
	UP: ['Lucknow', 'Noida', 'Ghaziabad', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj'],
	RJ: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
	AP: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore'],
	PB: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali'],
	HR: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'],
	MP: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior'],
	BR: ['Patna', 'Gaya', 'Muzaffarpur'],
	OD: ['Bhubaneswar', 'Cuttack', 'Rourkela'],
	CH: ['Chandigarh'],
	GA: ['Panaji', 'Margao', 'Vasco da Gama'],
	JH: ['Ranchi', 'Jamshedpur', 'Dhanbad'],
	CG: ['Raipur', 'Bhilai', 'Bilaspur'],
	AS: ['Guwahati', 'Silchar', 'Dibrugarh'],
	UK: ['Dehradun', 'Haridwar', 'Rishikesh'],
	HP: ['Shimla', 'Manali', 'Dharamshala'],
	JK: ['Srinagar', 'Jammu'],
	PY: ['Puducherry'],
	AR: ['Itanagar'],
	MN: ['Imphal'],
	ML: ['Shillong'],
	MZ: ['Aizawl'],
	NL: ['Kohima', 'Dimapur'],
	SK: ['Gangtok'],
	TR: ['Agartala'],
	AN: ['Port Blair'],
	DN: ['Daman', 'Silvassa'],
	LA: ['Leh'],
	LD: ['Kavaratti'],
}

const byName = (a: string, b: string) => a.localeCompare(b)
const ALL_CITIES = Object.values(CITIES_BY_STATE).flat().sort(byName)
/** Popular areas of the cities that have a list; any other city lets the user type their own area. */
const AREAS: Record<string, string[]> = {
	Bengaluru: [
		'Indiranagar',
		'Koramangala',
		'Whitefield',
		'HSR Layout',
		'Jayanagar',
		'Malleshwaram',
		'Electronic City',
		'Hebbal',
		'JP Nagar',
		'Marathahalli',
		'Rajajinagar',
		'BTM Layout',
	],
	Mysuru: ['Vijayanagar', 'Gokulam', 'Kuvempunagar', 'Saraswathipuram', 'Jayalakshmipuram'],
	Mangaluru: ['Hampankatta', 'Kadri', 'Bejai', 'Kodialbail', 'Surathkal'],
	Mumbai: ['Andheri', 'Bandra', 'Powai', 'Dadar', 'Borivali', 'Colaba', 'Malad', 'Chembur'],
	Pune: ['Kothrud', 'Baner', 'Hinjewadi', 'Viman Nagar', 'Hadapsar', 'Aundh', 'Wakad'],
	Chennai: ['T. Nagar', 'Adyar', 'Anna Nagar', 'Velachery', 'Mylapore', 'Tambaram'],
	Hyderabad: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur', 'Kukatpally', 'Secunderabad', 'Kondapur'],
	'New Delhi': ['Connaught Place', 'Karol Bagh', 'Chanakyapuri'],
	'South Delhi': ['Saket', 'Hauz Khas', 'Greater Kailash', 'Vasant Kunj'],
	Kochi: ['Kakkanad', 'Edappally', 'Vyttila', 'Fort Kochi', 'Kaloor'],
	Kolkata: ['Salt Lake', 'Park Street', 'Ballygunge', 'New Town', 'Behala'],
	Ahmedabad: ['Navrangpura', 'Satellite', 'Bopal', 'Maninagar', 'Vastrapur'],
}

/** "Indiranagar, Bengaluru" -> { area: 'Indiranagar', city: 'Bengaluru' }; a bare city has no area. */
const splitLocation = (location: string) => {
	const at = location.lastIndexOf(', ')
	return at < 0 ? { area: '', city: location } : { area: location.slice(0, at), city: location.slice(at + 2) }
}

const POPULAR_NAMES = POPULAR.map(([city]) => city)
const OTHER_CITIES = ALL_CITIES.filter((city) => !POPULAR_NAMES.includes(city))

interface LocationPickerModalProps {
	open: boolean
	/** The location currently shown in the navbar pill: "Area, City", a city name or "Current location". */
	selected: string
	onClose: () => void
	onSelect: (location: string) => void
}

export default function LocationPickerModal({ open, selected, onClose, onSelect }: LocationPickerModalProps) {
	const [step, setStep] = useState<'city' | 'area'>('city')
	const [pickedCity, setPickedCity] = useState('')
	const [area, setArea] = useState('')
	const [query, setQuery] = useState('')
	const [showAll, setShowAll] = useState(false)

	const current = splitLocation(selected)

	const q = query.trim()
	const searching = q.length > 0

	const listed = useMemo(() => {
		if (!searching) return OTHER_CITIES
		const needle = q.toLowerCase()
		return ALL_CITIES.filter((city) => city.toLowerCase().includes(needle))
	}, [q, searching])

	// Back to a clean first step only once the dialog has faded out, so it does not flash the city list on close.
	const reset = () => {
		setStep('city')
		setQuery('')
		setShowAll(false)
	}

	const chooseCity = (name: string) => {
		setPickedCity(name)
		// Coming back to the city that is already set keeps its area ticked.
		setArea(name === current.city ? current.area : '')
		setQuery('')
		setShowAll(false)
		setStep('area')
	}

	const backToCity = () => {
		setStep('city')
		setQuery('')
	}

	const pick = (location: string, message = `Location set to ${location}`) => {
		onSelect(location)
		onClose()
		toast.success(message)
	}

	// The doctor search keeps the user's coordinates in sessionStorage; share the same keys.
	const detect = async () => {
		const here = await getBrowserPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
		if (here.unsupported) {
			toast.error('Location is not supported by this browser.')
			return
		}
		if (!here.coords) {
			toast.error('Could not detect your location. Allow location access or pick a city.')
			return
		}
		sessionStorage.setItem('user_lat', here.coords.latitude.toString())
		sessionStorage.setItem('user_lon', here.coords.longitude.toString())
		pick('Current location', 'Using your current location')
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth={false}
			aria-label="Select your city"
			sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
			slotProps={{
				backdrop: { sx: { bgcolor: '#12373E80' } },
				transition: { onExited: reset },
				paper: {
					sx: {
						width: 920,
						maxWidth: 'calc(100% - 32px)',
						maxHeight: 600,
						mt: '96px',
						mx: 2,
						borderRadius: '12px',
						boxShadow: '0 24px 64px #12373E40',
						display: 'flex',
						flexDirection: 'column',
						overflow: 'hidden',
					},
				},
			}}
		>
			{step === 'area' ? (
				<AreaStep
					city={pickedCity}
					area={area}
					query={query}
					onQuery={setQuery}
					onArea={setArea}
					onBack={backToCity}
					onConfirm={(chosen) => pick(`${chosen}, ${pickedCity}`)}
				/>
			) : (
				<>
					{/* Search + detect */}
					<Box sx={{ flexShrink: 0, p: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
						<Box
							component="label"
							sx={{
								height: 48,
								boxSizing: 'border-box',
								px: 2,
								border: `1px solid ${LINE}`,
								borderRadius: '8px',
								display: 'flex',
								alignItems: 'center',
								gap: '14px',
								color: MUTED,
							}}
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />
							</svg>
							<Box
								component="input"
								type="search"
								autoFocus
								aria-label="Search for your city"
								placeholder="Search for your city"
								value={query}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
								sx={{
									flexGrow: 1,
									minWidth: 0,
									height: 44,
									border: 0,
									outline: 'none',
									bgcolor: 'transparent',
									fontFamily: 'inherit',
									fontSize: 15,
									color: INK,
									'&::placeholder': { color: '#7A8B8E' },
								}}
							/>
							<VoiceMicButton onResult={(text) => setQuery(text)} />
						</Box>
						<Box
							component="button"
							type="button"
							onClick={detect}
							sx={{
								alignSelf: 'flex-start',
								minHeight: 36,
								px: '2px',
								border: 0,
								bgcolor: 'transparent',
								color: PRIMARY,
								fontFamily: 'inherit',
								fontSize: 14,
								fontWeight: 500,
								display: 'flex',
								alignItems: 'center',
								gap: 1,
								cursor: 'pointer',
							}}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M12 3v3M12 18v3M3 12h3M18 12h3M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
							</svg>
							Detect my location
						</Box>
					</Box>
					<Box aria-hidden="true" sx={{ flexShrink: 0, height: '1px', bgcolor: LINE_SOFT }} />

					<Box
						sx={{
							flexGrow: 1,
							minHeight: 0,
							p: '16px 16px 12px',
							display: 'flex',
							flexDirection: 'column',
							gap: '18px',
						}}
					>
						{/* Popular cities */}
						{!searching && (
							<Box component="section" aria-labelledby="popular-cities" sx={{ flexShrink: 0 }}>
								<Typography
									id="popular-cities"
									component="h2"
									sx={{
										m: 0,
										mb: '14px',
										fontSize: 15,
										lineHeight: '22px',
										fontWeight: 500,
										textAlign: 'center',
										color: INK,
									}}
								>
									Popular Cities
								</Typography>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
									{POPULAR.map(([city, icon]) => {
										const on = current.city === city
										return (
											<Box
												component="button"
												type="button"
												key={city}
												aria-pressed={on}
												onClick={() => chooseCity(city)}
												sx={{
													flex: '1 1 0',
													minWidth: 0,
													p: '6px 2px 8px',
													border: 0,
													borderRadius: '10px',
													bgcolor: 'transparent',
													color: on ? PRIMARY : MUTED,
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													gap: '6px',
													cursor: 'pointer',
													fontFamily: 'inherit',
													'&:hover': { bgcolor: '#F0F7F7' },
												}}
											>
												<svg
													width="56"
													height="56"
													viewBox="0 0 40 40"
													fill={on ? '#E3EFEF' : 'none'}
													stroke="currentColor"
													strokeWidth="1.4"
													strokeLinecap="round"
													strokeLinejoin="round"
													aria-hidden="true"
												>
													<path d={ICONS[icon]} />
												</svg>
												<Box
													component="span"
													sx={{
														fontSize: 14,
														lineHeight: '18px',
														fontWeight: on ? 600 : 400,
														color: INK,
														whiteSpace: 'nowrap',
													}}
												>
													{city}
												</Box>
											</Box>
										)
									})}
								</Box>
							</Box>
						)}

						{/* Other cities, or the matches while searching */}
						{(searching || showAll) && (
							<Box
								component="section"
								aria-labelledby="other-cities"
								sx={{
									flex: '1 1 auto',
									minHeight: 0,
									display: 'flex',
									flexDirection: 'column',
									gap: '10px',
								}}
							>
								<Typography
									id="other-cities"
									component="h2"
									sx={{
										m: 0,
										flexShrink: 0,
										fontSize: 15,
										lineHeight: '22px',
										fontWeight: 500,
										textAlign: 'center',
										color: INK,
									}}
								>
									{searching ? 'Matching Cities' : 'Other Cities'}
								</Typography>
								<Box
									sx={{
										maxHeight: 220,
										overflowY: 'auto',
										display: 'grid',
										gridTemplateColumns: {
											xs: 'repeat(2, minmax(0, 1fr))',
											sm: 'repeat(3, minmax(0, 1fr))',
											md: 'repeat(5, minmax(0, 1fr))',
										},
										gridAutoRows: 'min-content',
										alignContent: 'start',
										columnGap: '16px',
										px: 1,
										scrollbarWidth: 'thin',
										scrollbarColor: `${DESK.lineChoice} transparent`,
									}}
								>
									{listed.map((city) => {
										const on = current.city === city
										return (
											<Box
												component="button"
												type="button"
												key={city}
												onClick={() => chooseCity(city)}
												sx={{
													minHeight: 26,
													p: '3px 6px',
													border: 0,
													borderRadius: '6px',
													bgcolor: 'transparent',
													color: on ? PRIMARY : MUTED,
													fontFamily: 'inherit',
													fontSize: 13,
													lineHeight: '18px',
													fontWeight: on ? 600 : 400,
													textAlign: 'left',
													cursor: 'pointer',
													'&:hover': { color: INK, bgcolor: '#F5F8F8' },
												}}
											>
												{city}
											</Box>
										)
									})}
								</Box>
								{searching && listed.length === 0 && (
									<Typography sx={{ my: 1, textAlign: 'center', fontSize: 14, color: MUTED }}>
										No city matches “{q}”.
									</Typography>
								)}
							</Box>
						)}

						{!searching && (
							<Box
								component="button"
								type="button"
								onClick={() => setShowAll((prev) => !prev)}
								sx={{
									alignSelf: 'center',
									flexShrink: 0,
									minHeight: 36,
									px: 1.5,
									border: 0,
									bgcolor: 'transparent',
									color: PRIMARY,
									fontFamily: 'inherit',
									fontSize: 15,
									fontWeight: 500,
									cursor: 'pointer',
								}}
							>
								{showAll ? 'Hide all cities' : 'View All Cities'}
							</Box>
						)}
					</Box>
				</>
			)}
		</Dialog>
	)
}

interface AreaStepProps {
	city: string
	/** The ticked area (may be one the user typed, so not in the city's list). */
	area: string
	query: string
	onQuery: (query: string) => void
	onArea: (area: string) => void
	onBack: () => void
	onConfirm: (area: string) => void
}

const SEARCH_ICON = 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4'
const PIN_ICON = 'M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'

/** Step 2: the areas of the chosen city. Renders the header, the scrolling body and the confirm footer. */
function AreaStep({ city, area, query, onQuery, onArea, onBack, onConfirm }: AreaStepProps) {
	const q = query.trim()
	const needle = q.toLowerCase()
	const pool = useMemo(() => AREAS[city] ?? [], [city])

	const listed = useMemo(() => {
		const matches = pool.filter((name) => !needle || name.toLowerCase().includes(needle))
		// An area the user typed earlier stays visible and ticked.
		return area && !pool.includes(area) ? [area, ...matches] : matches
	}, [pool, needle, area])

	const exact = pool.some((name) => name.toLowerCase() === needle)
	const ready = area !== ''
	const summary = ready ? `${area}, ${city}` : 'Pick your area to continue'

	return (
		<>
			<Box
				sx={{
					flexShrink: 0,
					p: '16px 16px 12px',
					display: 'flex',
					flexDirection: 'column',
					gap: '12px',
					borderBottom: `1px solid ${LINE_SOFT}`,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box
						component="button"
						type="button"
						onClick={onBack}
						aria-label="Back to cities"
						sx={{
							flexShrink: 0,
							width: 40,
							height: 40,
							ml: '-8px',
							border: 0,
							borderRadius: '9999px',
							bgcolor: 'transparent',
							color: INK,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							'&:hover': { bgcolor: TINT },
						}}
					>
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M15 18l-6-6 6-6" />
						</svg>
					</Box>
					<Typography
						component="h2"
						sx={{ flexGrow: 1, m: 0, fontSize: 17, lineHeight: '24px', fontWeight: 700, color: INK }}
					>
						Select your area in {city}
					</Typography>
					<Box
						component="button"
						type="button"
						onClick={onBack}
						sx={{
							flexShrink: 0,
							minHeight: 36,
							px: 1,
							border: 0,
							bgcolor: 'transparent',
							color: PRIMARY,
							fontFamily: 'inherit',
							fontSize: 14,
							fontWeight: 600,
							cursor: 'pointer',
						}}
					>
						Change city
					</Box>
				</Box>
				<Box
					component="label"
					sx={{
						height: 48,
						boxSizing: 'border-box',
						px: 2,
						border: `1px solid ${LINE}`,
						borderRadius: '8px',
						display: 'flex',
						alignItems: 'center',
						gap: '14px',
						color: MUTED,
					}}
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d={SEARCH_ICON} />
					</svg>
					<Box
						component="input"
						type="search"
						aria-label="Search area or locality"
						placeholder={`Search area or locality in ${city}`}
						value={query}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQuery(e.target.value)}
						sx={{
							flexGrow: 1,
							minWidth: 0,
							height: 44,
							border: 0,
							outline: 'none',
							bgcolor: 'transparent',
							fontFamily: 'inherit',
							fontSize: 15,
							color: INK,
							'&::placeholder': { color: FAINT },
						}}
					/>
					<VoiceMicButton onResult={(text) => onQuery(text)} />
				</Box>
			</Box>

			<Box
				sx={{
					flexGrow: 1,
					minHeight: 0,
					overflowY: 'auto',
					p: 2,
					display: 'flex',
					flexDirection: 'column',
					gap: '12px',
					scrollbarWidth: 'thin',
					scrollbarColor: `${DESK.lineChoice} transparent`,
				}}
			>
				{q && !exact && (
					<Box
						component="button"
						type="button"
						onClick={() => {
							onArea(q)
							onQuery('')
						}}
						sx={{
							minHeight: 52,
							p: '10px 14px',
							border: `1.5px dashed ${MINT}`,
							borderRadius: '10px',
							bgcolor: TINT,
							color: PRIMARY,
							fontFamily: 'inherit',
							fontSize: 14,
							fontWeight: 700,
							textAlign: 'left',
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
							cursor: 'pointer',
						}}
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.4"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M12 5v14M5 12h14" />
						</svg>
						Use “{q}” as your area
					</Box>
				)}

				{listed.length > 0 && (
					<>
						<Typography
							component="h3"
							sx={{
								m: 0,
								fontSize: 15,
								lineHeight: '22px',
								fontWeight: 500,
								textAlign: 'center',
								color: INK,
							}}
						>
							{q ? 'Matching Areas' : 'Popular Areas'}
						</Typography>
						<Box
							role="radiogroup"
							aria-label="Areas"
							sx={{
								display: 'grid',
								gridTemplateColumns: {
									xs: 'repeat(2, minmax(0, 1fr))',
									sm: 'repeat(3, minmax(0, 1fr))',
									md: 'repeat(4, minmax(0, 1fr))',
								},
								gap: '10px',
							}}
						>
							{listed.map((name) => {
								const on = area === name
								return (
									<Box
										component="button"
										type="button"
										key={name}
										role="radio"
										aria-checked={on}
										onClick={() => onArea(name)}
										sx={{
											minHeight: 52,
											p: '8px 12px',
											boxSizing: 'border-box',
											border: `1.5px solid ${on ? PRIMARY : LINE_SOFT}`,
											borderRadius: '10px',
											bgcolor: on ? TINT : '#fff',
											color: INK,
											fontFamily: 'inherit',
											textAlign: 'left',
											display: 'flex',
											alignItems: 'center',
											gap: '10px',
											cursor: 'pointer',
											'&:hover': { borderColor: MINT },
										}}
									>
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke={on ? PRIMARY : FAINT}
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
											style={{ flexShrink: 0 }}
										>
											<path d={PIN_ICON} />
										</svg>
										<Box
											component="span"
											sx={{
												flexGrow: 1,
												minWidth: 0,
												fontSize: 14,
												lineHeight: '18px',
												fontWeight: on ? 700 : 500,
											}}
										>
											{name}
										</Box>
									</Box>
								)
							})}
						</Box>
					</>
				)}

				{listed.length === 0 && !q && (
					<Box
						sx={{
							p: '28px 16px',
							border: `1.5px dashed ${LINE}`,
							borderRadius: '12px',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '6px',
							textAlign: 'center',
						}}
					>
						<Box component="span" sx={{ fontSize: 15, fontWeight: 700, color: INK }}>
							We don’t have areas listed for {city} yet
						</Box>
						<Box component="span" sx={{ fontSize: 13, lineHeight: '18px', color: MUTED }}>
							Type your area or locality in the search box above and add it.
						</Box>
					</Box>
				)}
			</Box>

			<Box
				sx={{
					flexShrink: 0,
					p: '14px 16px',
					borderTop: `1px solid ${LINE_SOFT}`,
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
				}}
			>
				<Box
					component="span"
					sx={{
						flexGrow: 1,
						minWidth: 0,
						fontSize: 14,
						lineHeight: '20px',
						color: ready ? INK : FAINT,
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
				>
					{summary}
				</Box>
				<Box
					component="button"
					type="button"
					aria-disabled={!ready}
					onClick={() => ready && onConfirm(area)}
					sx={{
						height: 44,
						px: '22px',
						border: 0,
						borderRadius: '10px',
						bgcolor: ready ? PRIMARY : DISABLED,
						color: '#fff',
						fontFamily: 'inherit',
						fontSize: 15,
						fontWeight: 700,
						cursor: ready ? 'pointer' : 'not-allowed',
					}}
				>
					Confirm location
				</Box>
			</Box>
		</>
	)
}
