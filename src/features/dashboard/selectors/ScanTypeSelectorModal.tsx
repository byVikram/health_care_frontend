// src/features/dashboard/ScanTypeSelectorModal.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { getScanTypes, ScanType } from '../../radiology/radiologyService'
import allScansIcon from '../../../assets/Radiology/allscans.png'
import mriIcon from '../../../assets/Radiology/mri.png'
import ctIcon from '../../../assets/Radiology/ct-scan.png'
import xrayIcon from '../../../assets/Radiology/xray.png'
import ultrasoundIcon from '../../../assets/Radiology/ultrasound.png'
import CardGridSelectorModal, { SelectorCardItem } from './CardGridSelectorModal'

interface ScanTypeSelectorModalProps {
	open: boolean
	onClose: () => void
}

interface ScanVisualConfig {
	groupKey: string
	keywords: string[]
	label: string     
	icon: string
}

const SCAN_VISUAL_CONFIGS: ScanVisualConfig[] = [
	{ groupKey: 'mri', keywords: ['mri'], label: 'MRI Scan', icon: mriIcon },
	{ groupKey: 'ct', keywords: ['ct'], label: 'CT Scan', icon: ctIcon },
	{ groupKey: 'xray', keywords: ['x-ray', 'xray'], label: 'X-Ray', icon: xrayIcon },
	{ groupKey: 'ultrasound', keywords: ['ultrasound', 'sono'], label: 'Ultrasound', icon: ultrasoundIcon },
]

const DEFAULT_VISUAL: ScanVisualConfig = {
	groupKey: 'other',
	keywords: [],
	label: 'Other Scan',
	icon: mriIcon,
}

function resolveScanVisual(scanName: string): ScanVisualConfig {
	const lower = scanName.toLowerCase()
	return SCAN_VISUAL_CONFIGS.find((cfg) => cfg.keywords.some((kw) => lower.includes(kw))) ?? DEFAULT_VISUAL
}

interface GroupedScanType {
	groupKey: string
	label: string
	icon: string
	scanTypes: ScanType[]
}

function groupScanTypes(scanTypes: ScanType[]): GroupedScanType[] {
	const groups = new Map<string, GroupedScanType>()
	scanTypes.forEach((st) => {
		const visual = resolveScanVisual(st.name)
		const existing = groups.get(visual.groupKey)
		if (existing) {
			existing.scanTypes.push(st)
		} else {
			groups.set(visual.groupKey, {
				groupKey: visual.groupKey,
				label: visual.label,
				icon: visual.icon,
				scanTypes: [st],
			})
		}
	})
	return Array.from(groups.values())
}

export default function ScanTypeSelectorModal({ open, onClose }: ScanTypeSelectorModalProps) {
	const navigate = useNavigate()

	const [scanTypes, setScanTypes] = useState<ScanType[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open) return
		let active = true
		const load = async () => {
			setLoading(true)
			setError(null)
			try {
				const res = await getScanTypes()
				if (!active) return
				if (res.success && res.data) setScanTypes(res.data)
			} catch (err) {
				// ApiService's shared axios interceptor already shows a global
				// error toast on failure -- this inline error is additional
				// context inside the modal, not a duplicate toast.
				console.error('Failed to load scan types:', err)
				if (!active) return
				setError('Failed to load scan types. Please try again.')
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [open])

	const handleAllScans = () => {
		onClose()
		navigate(ROUTES.RADIOLOGY.SEARCH)
	}

	const handleSelect = (group: GroupedScanType) => {
		const rep = group.scanTypes[0]
		if (!rep) return
		onClose()
		navigate(`${ROUTES.RADIOLOGY.SEARCH}?scan_type_id=${rep.id}&scan_type_name=${encodeURIComponent(group.label)}`)
	}

	const groupedScanTypes = groupScanTypes(scanTypes)

	// modality cards first, All Scans last
	const cards: SelectorCardItem[] = [
		...groupedScanTypes.map((g) => ({
			key: g.groupKey,
			icon: g.icon,
			label: g.label,
			onClick: () => handleSelect(g),
		})),
		{ key: 'all', icon: allScansIcon, label: 'All Scans', onClick: handleAllScans },
	]

	return (
		<CardGridSelectorModal
			open={open}
			onClose={onClose}
			title="What type of scan are you looking for?"
			cards={cards}
			loading={loading}
			error={error}
		/>
	)
}
