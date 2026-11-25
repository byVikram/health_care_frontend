// src/components/common/Modal/AddressDialog.tsx
//
// "Add a new address" (Lab tests cart, home-care booking): the street, area, city, state, PIN code and a label. It saves
// through the same call as the profile's Addresses tab and hands back the saved address. Mount it only while it is open, so each opening
// starts from a clean form.
import { Box } from '@mui/material'
import { useState } from 'react'
import AppInput from '../Input/AppInput'
import AppSelect from '../Select/AppSelect'
import DeskDialog from './DeskDialog'
import { DESK } from '../../../styles/deskTokens'
import type { BookingAddress } from '../../../features/booking/useBookingAddresses'
import type { PatientAddressCreate } from '../../../features/patient/patientService'

const LABELS = ['Home', 'Work', 'Other'].map((value) => ({ value, label: value }))

interface AddressDialogProps {
	/** The line under the title: what the address is used for. */
	sub: string
	/** Shown when a position was found ("Use current location"). */
	foundText?: string
	/** Fills the city and state (from the address the patient already has). */
	hint?: Pick<BookingAddress, 'city' | 'state'>
	/** The first address the patient saves becomes their default. */
	isFirst: boolean
	/** The position the browser gave ("Use current location"): saved with the address; the street and PIN code are still typed. */
	coords?: { latitude: number; longitude: number } | null
	/** Saves it; resolves with the saved address, or null when it could not be saved (the dialog then stays open). */
	onSave: (payload: PatientAddressCreate) => Promise<BookingAddress | null>
	onClose: () => void
}

export default function AddressDialog({ sub, foundText, hint, isFirst, coords, onSave, onClose }: AddressDialogProps) {
	const [line, setLine] = useState('')
	const [area, setArea] = useState('')
	const [city, setCity] = useState(hint?.city ?? '')
	const [state, setState] = useState(hint?.state ?? '')
	const [pincode, setPincode] = useState('')
	const [label, setLabel] = useState('Home')
	const [error, setError] = useState('')
	const [saving, setSaving] = useState(false)

	const save = async () => {
		if (!line.trim() || !city.trim() || !state.trim()) {
			setError('Add the street, city and state.')
			return
		}
		if (!/^\d{6}$/.test(pincode)) {
			setError('Enter a 6-digit PIN code.')
			return
		}
		setError('')
		setSaving(true)
		try {
			const saved = await onSave({
				label,
				address_line: [line.trim(), area.trim()].filter(Boolean).join(', '),
				city: city.trim(),
				state: state.trim(),
				pincode,
				latitude: coords?.latitude ?? null,
				longitude: coords?.longitude ?? null,
				is_default: isFirst,
			})
			if (saved) onClose()
			else setError('We could not save this address. Please try again.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<DeskDialog
			open
			title="Add a new address"
			sub={sub}
			okLabel="Save address"
			busy={saving}
			width={520}
			onClose={onClose}
			onOk={() => void save()}
		>
			{coords ? (
				<Box sx={{ p: '10px 12px', borderRadius: '10px', bgcolor: DESK.primarySoft, color: DESK.primary, fontSize: 13, fontWeight: 700 }}>
					{foundText ?? 'We found your location. Add the street and PIN code.'}
				</Box>
			) : null}
			<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
				<Box sx={{ gridColumn: '1 / -1' }}>
					<AppInput label="Flat / house, street" value={line} onChange={(e) => setLine(e.target.value)} placeholder="e.g. 14, 2nd Cross" />
				</Box>
				<AppInput label="Area (optional)" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Indiranagar" />
				<AppInput label="City" value={city} onChange={(e) => setCity(e.target.value)} />
				<AppInput label="State" value={state} onChange={(e) => setState(e.target.value)} />
				<AppInput
					label="PIN code"
					value={pincode}
					onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
					placeholder="6 digits"
					inputProps={{ inputMode: 'numeric' }}
				/>
				<AppSelect label="Save as" value={label} onChange={(e) => setLabel(e.target.value)} options={LABELS} />
			</Box>
			{error ? (
				<Box component="span" role="alert" sx={{ fontSize: 13, color: DESK.danger, fontWeight: 600 }}>
					{error}
				</Box>
			) : null}
		</DeskDialog>
	)
}
