// src/features/lab/LabReportPage.tsx
//
// The report of a lab order (desktop design 6). The backend holds no report data yet (results are not stored or served), so this page shows
// the order's report state (ready or being prepared), the facts of the order, and a notice; Download and Share stay switched off. No
// results table and no numbers are drawn: nothing here is invented.
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppSkeleton from '../../components/common/Skeleton/AppSkeleton'
import DeskButton from '../../components/common/Button/DeskButton'
import DeskIcon from '../../components/common/Icon/DeskIcon'
import FactList from '../../components/common/FactList/FactList'
import { ROUTES } from '../../constants/routes'
import { DESK, DESK_ICONS } from '../../styles/deskTokens'
import { LAB_ICONS } from './labConstants'
import { commaDate, plural, stampLabel } from './labFormat'
import { fetchOrder, labErrorMessage, type ApiOrder } from './labService'
import LabPageShell from './LabPageShell'

const NOT_YET = 'Not available yet'

export default function LabReportPage() {
	const navigate = useNavigate()
	const { orderId = '' } = useParams()
	const [order, setOrder] = useState<ApiOrder | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [reload, setReload] = useState(0)

	useEffect(() => {
		let active = true
		const load = async () => {
			setLoading(true)
			setError('')
			try {
				const api = await fetchOrder(orderId)
				if (active) setOrder(api)
			} catch (err) {
				if (active) setError(labErrorMessage(err))
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [orderId, reload])

	const orderPath = ROUTES.LAB.ORDER.replace(':orderId', orderId)
	const back = (
		<Box
			component={Link}
			to={orderPath}
			sx={{ alignSelf: 'flex-start', fontSize: 14, fontWeight: 800, color: DESK.primary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
		>
			<DeskIcon d={DESK_ICONS.chevronLeft} size={16} strokeWidth={2.4} />
			Back to order
		</Box>
	)

	if (!order) {
		return (
			<LabPageShell>
				{back}
				{loading ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
						<AppSkeleton height={130} />
						<AppSkeleton height={200} />
					</Box>
				) : (
					<Box
						sx={{
							bgcolor: DESK.raised,
							border: `1px solid ${DESK.cardLine}`,
							borderRadius: '18px',
							p: '22px 24px',
							display: 'flex',
							flexDirection: 'column',
							gap: '12px',
							alignItems: 'flex-start',
						}}
					>
						<Box component="b" sx={{ fontSize: 18 }}>
							We couldn’t open this report
						</Box>
						<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
							{error || 'Something went wrong. Please try again.'}
						</Box>
						<DeskButton label="Try again" kind="primary" fullWidth={false} onClick={() => setReload((n) => n + 1)} />
					</Box>
				)}
			</LabPageShell>
		)
	}

	const id = `KH-${order.id.slice(0, 8).toUpperCase()}`
	const ready = order.status === 'report_ready'
	const collected = order.timeline?.find((step) => step.key === 'collected' && step.state === 'done')?.at
	const patient = order.patient_name || 'Myself'
	const tests = order.items.map((item) => item.name)
	const title = tests.length === 1 ? tests[0] : `Lab report · ${plural(tests.length, 'test', 'tests')}`
	const facts = [
		{ label: 'Patient', value: patient },
		{ label: 'Collected', value: collected ? stampLabel(collected) : 'Not collected yet' },
		...(order.lab_name ? [{ label: 'Lab', value: order.lab_name }] : []),
		{ label: 'Order ID', value: id },
	]

	return (
		<LabPageShell>
			{back}

			<Box
				component="section"
				sx={{
					bgcolor: ready ? DESK.successSoft : DESK.primaryTint,
					border: `1px solid ${DESK.cardLine}`,
					borderRadius: '18px',
					p: '24px 28px',
					display: 'flex',
					alignItems: 'center',
					gap: '20px',
				}}
			>
				<Box
					component="span"
					sx={{
						flexShrink: 0,
						width: 56,
						height: 56,
						borderRadius: '16px',
						bgcolor: DESK.raised,
						color: ready ? DESK.success : DESK.primary,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<DeskIcon d={LAB_ICONS.document} size={26} />
				</Box>
				<Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
					<Box component="span" sx={{ fontSize: 12, lineHeight: '16px', fontWeight: 800, letterSpacing: '0.06em', color: ready ? DESK.success : DESK.primary }}>
						{ready ? 'REPORT READY' : 'REPORT BEING PREPARED'}
					</Box>
					<Box component="h1" sx={{ m: 0, fontSize: 24, lineHeight: '32px', fontWeight: 800, overflowWrap: 'anywhere' }}>
						{title}
					</Box>
					<Box component="span" sx={{ fontSize: 14, color: DESK.muted }}>
						For {patient}
						{collected ? ` · Collected ${commaDate(collected.slice(0, 10))}` : ''}
					</Box>
				</Box>
				<Box sx={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
					<Box title={NOT_YET} sx={{ width: 170 }}>
						<DeskButton label="Download PDF" kind="primary" icon={LAB_ICONS.download} disabled />
					</Box>
					<Box title={NOT_YET} sx={{ width: 120 }}>
						<DeskButton label="Share" kind="secondary" icon={LAB_ICONS.share} disabled />
					</Box>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
				<Box
					component="section"
					sx={{
						flexGrow: 1,
						minWidth: 0,
						bgcolor: DESK.raised,
						border: `1px solid ${DESK.cardLine}`,
						borderRadius: '18px',
						p: '24px 28px',
						display: 'flex',
						flexDirection: 'column',
						gap: '14px',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<Box
							component="span"
							sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: DESK.infoSoft, color: DESK.info, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
						>
							<DeskIcon d={LAB_ICONS.info} size={20} />
						</Box>
						<Box component="h2" sx={{ m: 0, fontSize: 18, fontWeight: 800 }}>
							Your results will appear here
						</Box>
					</Box>
					<Box component="p" sx={{ m: 0, fontSize: 15, lineHeight: '23px', color: DESK.inkSoft }}>
						Online reports are not switched on yet. When the lab has your results, Karolahealth will notify you, and the report for this order
						will be shown on this page.
					</Box>
					<Box component="p" sx={{ m: 0, fontSize: 15, lineHeight: '23px', color: DESK.inkSoft }}>
						Until then, your order page shows where your sample is.
					</Box>
					{tests.length > 1 ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
							<Box component="span" sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: DESK.primary }}>
								TESTS IN THIS ORDER
							</Box>
							{tests.map((name) => (
								<Box key={name} component="span" sx={{ fontSize: 14 }}>
									{name}
								</Box>
							))}
						</Box>
					) : null}
					<Box sx={{ alignSelf: 'flex-start' }}>
						<DeskButton label="View order" kind="secondary" fullWidth={false} onClick={() => navigate(orderPath)} />
					</Box>
				</Box>

				<Box component="aside" sx={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<Box component="h2" sx={{ m: 0, fontSize: 16, fontWeight: 800 }}>
						Report details
					</Box>
					<FactList facts={facts} />
				</Box>
			</Box>
		</LabPageShell>
	)
}
