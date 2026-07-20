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
} from '@mui/material'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { toast } from 'react-toastify'

import SectionCard from '../../../components/common/Card/SectionCard'
import AppTable from '../../../components/common/Table/AppTable'
import AppButton from '../../../components/common/Button/AppButton'
import {
	getOperationalLogs,
	getChatbotSessionLogs,
	clearChatbotSessionMemory,
	OperationalLogItem,
	ChatbotSessionLogItem,
} from '../adminService'

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
		} catch (err: any) {
			setError(err?.message || 'Failed to fetch audit logs')
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
		} catch (err: any) {
			toast.error(err?.message || 'Failed to clear session memory.')
		} finally {
			setActionLoadingId(null)
		}
	}

	const auditColumns = [
		{
			field: 'created_at',
			label: 'Timestamp',
			render: (_: any, row: OperationalLogItem) => (
				<Typography variant="body2" fontWeight={600}>
					{row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : 'N/A'}
				</Typography>
			),
		},
		{
			field: 'admin_user_id',
			label: 'Admin User',
			render: (_: any, row: OperationalLogItem) => (
				<Typography variant="subtitle2" fontWeight={700}>
					Admin ID: #{row.admin_user_id}
				</Typography>
			),
		},
		{
			field: 'action',
			label: 'Action',
			render: (_: any, row: OperationalLogItem) => (
				<Chip
					label={row.action}
					size="small"
					sx={{ bgcolor: '#0f172a', color: '#2dd4bf', fontWeight: 700 }}
				/>
			),
		},
		{
			field: 'target_table',
			label: 'Target Table',
			render: (_: any, row: OperationalLogItem) => (
				<Typography variant="body2" fontWeight={600}>
					{row.target_table || 'N/A'}
				</Typography>
			),
		},
	]

	const chatbotColumns = [
		{
			field: 'session_id',
			label: 'Session ID & Title',
			render: (_: any, row: ChatbotSessionLogItem) => (
				<Box>
					<Typography variant="subtitle2" fontWeight={700}>
						{row.title || 'Chatbot Session'}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						ID: {row.session_id}
					</Typography>
				</Box>
			),
		},
		{
			field: 'created_at',
			label: 'Started At',
			render: (_: any, row: ChatbotSessionLogItem) => (
				<Typography variant="body2">
					{row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : 'N/A'}
				</Typography>
			),
		},
		{
			field: 'messages',
			label: 'Messages Count',
			render: (_: any, row: ChatbotSessionLogItem) => (
				<Chip
					label={`${row.messages?.length || 0} msgs`}
					size="small"
					sx={{ bgcolor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Memory Management',
			render: (_: any, row: ChatbotSessionLogItem) => {
				const isBusy = actionLoadingId === row.session_id
				return (
					<AppButton
						label="Clear Memory"
						size="small"
						color="error"
						variant="outlined"
						startIcon={<CleaningServicesIcon />}
						onClick={() => handleClearMemory(row.session_id)}
						disabled={isBusy}
					/>
				)
			},
		},
	]

	return (
		<Box>
			<SectionCard title="System Audit Trail & AI Chatbot Diagnostics">
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Monitor administrative operational logs and inspect dynamic chatbot conversational session facts
				</Typography>
				<Tabs
					value={activeTab}
					onChange={(_, val) => setActiveTab(val)}
					sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}
				>
					<Tab
						value="audits"
						label={`Operational Logs (${operationalLogs.length})`}
						icon={<AssessmentIcon />}
						iconPosition="start"
						sx={{ fontWeight: 700, textTransform: 'none' }}
					/>
					<Tab
						value="chatbot"
						label={`Chatbot Sessions (${chatbotLogs.length})`}
						icon={<SmartToyIcon />}
						iconPosition="start"
						sx={{ fontWeight: 700, textTransform: 'none' }}
					/>
				</Tabs>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{loading ? (
					<Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
						<CircularProgress sx={{ color: '#0d9488' }} />
						<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
							Loading audit trails...
						</Typography>
					</Stack>
				) : activeTab === 'audits' ? (
					<AppTable columns={auditColumns as any} rows={operationalLogs as any} emptyMessage="No operational logs available." />
				) : (
					<AppTable columns={chatbotColumns as any} rows={chatbotLogs as any} emptyMessage="No chatbot session logs recorded." />
				)}
			</SectionCard>
		</Box>
	)
}
