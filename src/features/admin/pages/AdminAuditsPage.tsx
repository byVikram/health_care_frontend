// src/features/admin/pages/AdminAuditsPage.tsx
import { useEffect, useState, useCallback } from 'react'
import {
	Box,
	Tabs,
	Tab,
	Typography,
	Chip,
	Stack,
	CircularProgress,
	Alert,
	IconButton,
	Tooltip,
	Avatar,
} from '@mui/material'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import RefreshIcon from '@mui/icons-material/Refresh'
import { toast } from 'react-toastify'

// import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppButton from '../../../components/common/Button/AppButton'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import {
	getOperationalLogs,
	getChatbotSessionLogs,
	clearChatbotSessionMemory,
	OperationalLogItem,
	ChatbotSessionLogItem,
} from '../adminService'

const getErrorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

export default function AdminAuditsPage() {
	const [activeTab, setActiveTab] = useState<'audits' | 'chatbot'>('audits')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [operationalLogs, setOperationalLogs] = useState<OperationalLogItem[]>([])
	const [chatbotLogs, setChatbotLogs] = useState<ChatbotSessionLogItem[]>([])
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

	const fetchLogs = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const [auditsRes, chatbotRes] = await Promise.all([
				getOperationalLogs(),
				getChatbotSessionLogs(),
			])
			if (auditsRes.success) setOperationalLogs(auditsRes.data || [])
			if (chatbotRes.success) setChatbotLogs(chatbotRes.data || [])
		} catch (err: unknown) {
			setError(getErrorMessage(err, 'Failed to fetch audit logs'))
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchLogs()
	}, [fetchLogs])

	const handleClearMemory = async (sessionId: string) => {
		setActionLoadingId(sessionId)
		try {
			const res = await clearChatbotSessionMemory(sessionId)
			if (res.success) {
				toast.success(`Session memory for ${sessionId} cleared successfully.`)
				fetchLogs()
			}
		} catch (err: unknown) {
			toast.error(getErrorMessage(err, 'Failed to clear session memory.'))
		} finally {
			setActionLoadingId(null)
		}
	}

	const auditColumns: Column<OperationalLogItem>[] = [
		{
			field: 'created_at',
			label: 'Timestamp',
			render: (_: unknown, row: OperationalLogItem) => (
				<Typography variant="body2" fontWeight={600} color="#0f172a">
					{row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : '—'}
				</Typography>
			),
		},
		{
			field: 'admin_user_id',
			label: 'Admin User',
			render: (_: unknown, row: OperationalLogItem) => (
				<Stack direction="row" spacing={1} alignItems="center">
					<Avatar sx={{ bgcolor: '#0f172a', color: '#ffffff', width: 28, height: 28, fontSize: 11, fontWeight: 800 }}>
						A
					</Avatar>
					<Typography variant="subtitle2" fontWeight={700} color="#0f172a">
						Admin #{row.admin_user_id}
					</Typography>
				</Stack>
			),
		},
		{
			field: 'action',
			label: 'Action',
			render: (_: unknown, row: OperationalLogItem) => (
				<Chip
					label={row.action}
					size="small"
					sx={{ bgcolor: '#0f172a', color: '#2dd4bf', fontWeight: 700, fontSize: '0.68rem', borderRadius: '6px', height: 22 }}
				/>
			),
		},
		{
			field: 'target_table',
			label: 'Target Resource',
			render: (_: unknown, row: OperationalLogItem) => (
				<Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#475569', bgcolor: '#f8fafc', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #e2e8f0' }}>
					{row.target_table || '—'}
				</Typography>
			),
		},
	]

	const chatbotColumns: Column<ChatbotSessionLogItem>[] = [
		{
			field: 'session_id',
			label: 'Session',
			render: (_: unknown, row: ChatbotSessionLogItem) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar sx={{ bgcolor: 'rgba(126,34,206,0.1)', color: '#7e22ce', width: 34, height: 34 }}>
						<SmartToyIcon sx={{ fontSize: 18 }} />
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="subtitle2" fontWeight={700} color="#0f172a" noWrap>
							{row.title || 'Chatbot Session'}
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
							{row.session_id}
						</Typography>
					</Box>
				</Stack>
			),
		},
		{
			field: 'created_at',
			label: 'Started At',
			render: (_: unknown, row: ChatbotSessionLogItem) => (
				<Typography variant="body2" color="text.secondary">
					{row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : '—'}
				</Typography>
			),
		},
		{
			field: 'messages',
			label: 'Messages',
			render: (_: unknown, row: ChatbotSessionLogItem) => (
				<Chip
					label={`${row.messages?.length || 0} msgs`}
					size="small"
					sx={{ bgcolor: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: '0.68rem', borderRadius: '6px', height: 22 }}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Memory Management',
			align: 'right',
			render: (_: unknown, row: ChatbotSessionLogItem) => {
				const isBusy = actionLoadingId === row.session_id
				return (
					<Stack direction="row" justifyContent="flex-end">
						<AppButton
							label="Clear Memory"
							size="small"
							color="error"
							variant="outlined"
							startIcon={<CleaningServicesIcon sx={{ fontSize: 15 }} />}
							onClick={() => handleClearMemory(row.session_id)}
							disabled={isBusy}
							sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
						/>
					</Stack>
				)
			},
		},
	]

	return (
		<Box>
			<AdminPageHeader
				title="Audit Trail & Chatbot Logs"
				subtitle="Inspect administrative operational audit logs and AI chatbot conversational session state memory."
				count={activeTab === 'audits' ? operationalLogs.length : chatbotLogs.length}
				countLabel={activeTab === 'audits' ? 'audit logs' : 'sessions'}
				actions={
					<Tooltip title="Refresh logs">
						<IconButton
							onClick={fetchLogs}
							sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#64748b', '&:hover': { color: '#0f172a' } }}
						>
							<RefreshIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				}
			/>

			<Tabs
				value={activeTab}
				onChange={(_, val) => setActiveTab(val)}
				sx={{
					mb: 2.5,
					'& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 13.5 },
					'& .Mui-selected': { color: '#0d9488 !important' },
					'& .MuiTabs-indicator': { bgcolor: '#0d9488', height: 3 },
				}}
			>
				<Tab
					value="audits"
					label={`Operational Logs (${operationalLogs.length})`}
					icon={<AssessmentIcon sx={{ fontSize: 16 }} />}
					iconPosition="start"
				/>
				<Tab
					value="chatbot"
					label={`Chatbot Sessions (${chatbotLogs.length})`}
					icon={<SmartToyIcon sx={{ fontSize: 16 }} />}
					iconPosition="start"
				/>
			</Tabs>

			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
					{error}
				</Alert>
			)}

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
						Loading audit trails...
					</Typography>
				</Stack>
			) : activeTab === 'audits' ? (
				<AppTable columns={auditColumns} rows={operationalLogs} emptyMessage="No operational logs available." />
			) : (
				<AppTable columns={chatbotColumns} rows={chatbotLogs} emptyMessage="No chatbot session logs recorded." />
			)}
		</Box>
	)
}
