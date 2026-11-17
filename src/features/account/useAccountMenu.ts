// src/features/account/useAccountMenu.ts
//
// Loads what the account menu shows when it opens: the role's rows from the server (the built-in rows meanwhile, and when the call
// fails or comes back empty) and, for a patient, the card data. Both are read again every time the menu opens, so a profile change or a
// menu edit shows without a reload, and what is on screen is kept while a read is in flight.
import { useEffect, useState } from 'react'
import { DEFAULT_ROWS } from './accountMenuItems'
import {
	getNavigationRows,
	getPatientSummary,
	type NavigationRow,
	type PatientSummary,
} from './accountMenuService'

export function useAccountMenu(open: boolean, role: string) {
	const [rows, setRows] = useState<NavigationRow[]>(DEFAULT_ROWS[role] ?? [])
	const [summary, setSummary] = useState<PatientSummary | null>(null)

	useEffect(() => {
		if (!open) return
		let active = true
		const load = async () => {
			try {
				const fromServer = await getNavigationRows()
				if (active) setRows(fromServer.length > 0 ? fromServer : (DEFAULT_ROWS[role] ?? []))
			} catch {
				if (active) setRows((current) => (current.length > 0 ? current : (DEFAULT_ROWS[role] ?? [])))
			}
			if (role !== 'patient') return
			try {
				const card = await getPatientSummary()
				if (active) setSummary(card)
			} catch {
				// the card falls back to the name the page already knows
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [open, role])

	return { rows, summary }
}
