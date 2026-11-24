// src/features/admin/pages/AdminQAPage.tsx
import { useState, useEffect, useCallback } from "react"
import {
	Box,
	Grid,
	Stack,
	Typography,
	Chip,
	IconButton,
	Tooltip,
	Drawer,
	Divider,
	Tab,
	Tabs,
	InputAdornment,
	Avatar,
	Button,
	CircularProgress,
	ButtonGroup,
} from "@mui/material"
import AppInput from "../../../components/common/Input/AppInput"
import SearchIcon from "@mui/icons-material/Search"
import VisibilityIcon from "@mui/icons-material/Visibility"
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import HideSourceIcon from "@mui/icons-material/HideSource"
import FlagIcon from "@mui/icons-material/Flag"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import PersonIcon from "@mui/icons-material/Person"
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation"
import ReplyIcon from "@mui/icons-material/Reply"
import CloseIcon from "@mui/icons-material/Close"

import AdminPageHeader from "../../../components/admin/AdminPageHeader"
import AdminStatCard from "../../../components/admin/AdminStatCard"
import AppTable, { Column } from "../../../components/common/Table/AppTable"
import { customScrollbar } from "../../../styles/commonStyles"
import { toast } from "react-toastify"
import {
	listAdminQAQuestions,
	getAdminQAQuestionDetail,
	updateAdminQAQuestionStatus,
	updateAdminQAAnswerStatus,
	updateAdminQAReplyStatus,
	AdminQAQuestion,
	AdminQAQuestionDetail,
	AdminQAAnswer,
	AdminQAReply,
	QAStatus,
} from "../adminService"

const STATUS_COLORS: Record<QAStatus, { bg: string; text: string }> = {
	approved: { bg: "#f0fdf4", text: "#15803d" },
	pending: { bg: "#fffbeb", text: "#b45309" },
	flagged: { bg: "#fff7ed", text: "#ea580c" },
	hidden: { bg: "#f1f5f9", text: "#64748b" },
}

function QAStatusBadge({ status }: { status: QAStatus }) {
	const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending
	return (
		<Chip
			label={status.toUpperCase()}
			size="small"
			sx={{ bgcolor: c.bg, color: c.text, fontWeight: 700, fontSize: "0.62rem", borderRadius: "6px", height: 22 }}
		/>
	)
}

function StatusActions({
	current,
	onUpdate,
}: {
	current: QAStatus
	onUpdate: (s: QAStatus) => Promise<void>
}) {
	const actions: { label: string; status: QAStatus; icon: React.ReactNode; color: string }[] = [
		{ label: "Approve", status: "approved", icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />, color: "#15803d" },
		{ label: "Flag", status: "flagged", icon: <FlagIcon sx={{ fontSize: 14 }} />, color: "#ea580c" },
		{ label: "Hide", status: "hidden", icon: <HideSourceIcon sx={{ fontSize: 14 }} />, color: "#64748b" },
	]
	return (
		<ButtonGroup size="small" variant="outlined">
			{actions.map((a) => (
				<Button
					key={a.status}
					onClick={() => onUpdate(a.status)}
					disabled={current === a.status}
					startIcon={a.icon}
					sx={{
						textTransform: "none",
						fontSize: 11,
						fontWeight: 600,
						borderColor: current === a.status ? a.color : "#e2e8f0",
						color: current === a.status ? a.color : "#64748b",
						bgcolor: current === a.status ? `${a.color}10` : "transparent",
					}}
				>
					{a.label}
				</Button>
			))}
		</ButtonGroup>
	)
}

function QAInspectionDrawer({
	questionId,
	open,
	onClose,
	onQuestionStatusChange,
}: {
	questionId: string | null
	open: boolean
	onClose: () => void
	onQuestionStatusChange: () => void
}) {
	const [detail, setDetail] = useState<AdminQAQuestionDetail | null>(null)
	const [loading, setLoading] = useState(false)

	const loadDetail = useCallback(async () => {
		if (!questionId) return
		setLoading(true)
		try {
			const res = await getAdminQAQuestionDetail(questionId)
			if (res.success && res.data) setDetail(res.data)
		} catch {
			toast.error("Failed to load question details.")
		} finally {
			setLoading(false)
		}
	}, [questionId])

	useEffect(() => {
		if (open && questionId) loadDetail()
	}, [open, questionId, loadDetail])

	const handleQuestionStatus = async (status: QAStatus) => {
		if (!detail) return
		try {
			await updateAdminQAQuestionStatus(detail.id, status)
			toast.success(`Question marked as ${status}`)
			setDetail((prev) => (prev ? { ...prev, status } : null))
			onQuestionStatusChange()
		} catch {
			toast.error("Failed to update question status.")
		}
	}

	const handleAnswerStatus = async (answer: AdminQAAnswer, status: QAStatus) => {
		try {
			await updateAdminQAAnswerStatus(answer.id, status)
			toast.success(`Answer marked as ${status}`)
			setDetail((prev) =>
				prev
					? { ...prev, answers: prev.answers.map((a) => (a.id === answer.id ? { ...a, status } : a)) }
					: null
			)
		} catch {
			toast.error("Failed to update answer status.")
		}
	}

	const handleReplyStatus = async (answer: AdminQAAnswer, reply: AdminQAReply, status: QAStatus) => {
		try {
			await updateAdminQAReplyStatus(reply.id, status)
			toast.success(`Reply marked as ${status}`)
			setDetail((prev) =>
				prev
					? {
							...prev,
							answers: prev.answers.map((a) =>
								a.id === answer.id
									? { ...a, replies: a.replies.map((r) => (r.id === reply.id ? { ...r, status } : r)) }
									: a
							),
						}
					: null
			)
		} catch {
			toast.error("Failed to update reply status.")
		}
	}

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			sx={{ zIndex: 1300 }}
		PaperProps={{
			sx: {
				width: { xs: "100%", md: 560 },
				display: "flex",
				flexDirection: "column",
				bgcolor: "#f8fafc",
				borderLeft: "1px solid #e2e8f0",
			},
		}}
		>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={{ px: 3, py: 2, bgcolor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}
			>
				<Stack direction="row" alignItems="center" spacing={1.5}>
					<Avatar sx={{ bgcolor: "#0d9488", width: 34, height: 34 }}>
						<QuestionAnswerIcon sx={{ fontSize: 18 }} />
					</Avatar>
					<Box>
						<Typography variant="subtitle2" fontWeight={800} color="#0f172a">
							Q&A Inspection Panel
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Moderate question, answers & replies
						</Typography>
					</Box>
				</Stack>
				<IconButton size="small" onClick={onClose} sx={{ color: "#64748b" }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</Stack>

			<Box sx={{ flex: 1, overflowY: "auto", ...customScrollbar, p: 3 }}>
				{loading ? (
					<Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
						<CircularProgress size={36} sx={{ color: "#0d9488" }} />
						<Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
							Loading question details...
						</Typography>
					</Stack>
				) : detail ? (
					<Stack spacing={3}>
						{/* Patient Context */}
						<Box sx={{ bgcolor: "#ffffff", borderRadius: 2, border: "1px solid #e2e8f0", p: 2.5 }}>
							<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
								<PersonIcon sx={{ fontSize: 16, color: "#0d9488" }} />
								<Typography variant="subtitle2" fontWeight={700} color="#0f172a">
									Patient Context
								</Typography>
								<QAStatusBadge status={detail.status} />
							</Stack>
							<Grid container spacing={1.5}>
								{[
									{ label: "Gender", value: detail.gender },
									{ label: "Age", value: detail.age },
									{ label: "Location", value: detail.location || "Not given" },
									{ label: "Specialty Tag", value: detail.tag },
								].map(({ label, value }) => (
									<Grid key={label} size={{ xs: 6 }}>
										<Typography variant="caption" color="text.secondary" fontWeight={600}>
											{label}
										</Typography>
										<Typography variant="body2" fontWeight={600} color="#0f172a">
											{value || "—"}
										</Typography>
									</Grid>
								))}
								{detail.history && (
									<Grid size={{ xs: 12 }}>
										<Typography variant="caption" color="text.secondary" fontWeight={600}>
											Medical History
										</Typography>
										<Typography variant="body2" color="#475569" sx={{ mt: 0.5 }}>
											{detail.history}
										</Typography>
									</Grid>
								)}
							</Grid>
						</Box>

						{/* Question */}
						<Box sx={{ bgcolor: "#ffffff", borderRadius: 2, border: "1px solid #e2e8f0", p: 2.5 }}>
							<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
								<MedicalInformationIcon sx={{ fontSize: 16, color: "#0d9488" }} />
								<Typography variant="subtitle2" fontWeight={700} color="#0f172a">
									Question
								</Typography>
							</Stack>
							<Typography variant="body1" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
								{detail.question}
							</Typography>
							<Typography variant="body2" color="#475569" sx={{ mb: 1.5 }}>
								{detail.full_description}
							</Typography>
							<StatusActions current={detail.status} onUpdate={handleQuestionStatus} />
						</Box>

						{/* Answers */}
						<Box>
							<Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 1.5 }}>
								Expert Answers ({detail.answers.length})
							</Typography>
							{detail.answers.length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									No answers yet.
								</Typography>
							) : (
								<Stack spacing={2}>
									{detail.answers.map((ans) => (
										<Box
											key={ans.id}
											sx={{
												bgcolor: "#ffffff",
												borderRadius: 2,
												border: "1px solid #e2e8f0",
												p: 2.5,
												opacity: ans.status === "hidden" ? 0.55 : 1,
											}}
										>
											<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
												<Stack direction="row" alignItems="center" spacing={1}>
													<Avatar sx={{ width: 26, height: 26, bgcolor: "#0d9488", fontSize: 11 }}>
														{(ans.doctor_name || "D").substring(0, 1)}
													</Avatar>
													<Typography variant="caption" fontWeight={700} color="#0f172a">
														Dr. {ans.doctor_name}
													</Typography>
												</Stack>
												<QAStatusBadge status={ans.status} />
											</Stack>
											<Typography variant="body2" color="#475569" sx={{ mb: 1.5, lineHeight: 1.6 }}>
												{ans.answer}
											</Typography>
											<Stack direction="row" alignItems="center" justifyContent="space-between">
												<StatusActions current={ans.status} onUpdate={(s) => handleAnswerStatus(ans, s)} />
												<Typography variant="caption" color="text.secondary">
													👍 {ans.likes} · {ans.replies_count} replies
												</Typography>
											</Stack>

											{ans.replies.length > 0 && (
												<Box sx={{ mt: 2, pl: 2, borderLeft: "2px solid #e2e8f0" }}>
													<Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
														<ReplyIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
														<Typography variant="caption" fontWeight={600} color="#64748b">
															Replies ({ans.replies.length})
														</Typography>
													</Stack>
													<Stack spacing={1.5}>
														{ans.replies.map((reply) => (
															<Box key={reply.id} sx={{ opacity: reply.status === "hidden" ? 0.5 : 1 }}>
																<Stack direction="row" alignItems="center" justifyContent="space-between">
																	<Typography variant="caption" fontWeight={700} color="#0f172a">
																		{reply.user_name}
																	</Typography>
																	<QAStatusBadge status={reply.status} />
																</Stack>
																<Typography variant="caption" color="#475569" sx={{ display: "block", mb: 0.5 }}>
																	{reply.content}
																</Typography>
																<StatusActions
																	current={reply.status}
																	onUpdate={(s) => handleReplyStatus(ans, reply, s)}
																/>
																<Divider sx={{ mt: 1.5, borderColor: "#f1f5f9" }} />
															</Box>
														))}
													</Stack>
												</Box>
											)}
										</Box>
									))}
								</Stack>
							)}
						</Box>
					</Stack>
				) : null}
			</Box>
		</Drawer>
	)
}

const STATUS_TABS: { label: string; value: string }[] = [
	{ label: "All", value: "" },
	{ label: "Approved", value: "approved" },
	{ label: "Pending", value: "pending" },
	{ label: "Flagged", value: "flagged" },
	{ label: "Hidden", value: "hidden" },
]

export default function AdminQAPage() {
	const [questions, setQuestions] = useState<AdminQAQuestion[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [statusFilter, setStatusFilter] = useState("")
	const [search, setSearch] = useState("")
	const [searchInput, setSearchInput] = useState("")
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [drawerOpen, setDrawerOpen] = useState(false)

	const fetchQuestions = useCallback(async () => {
		setLoading(true)
		try {
			const res = await listAdminQAQuestions({
				search: search || undefined,
				status: statusFilter || undefined,
				page: 1,
				page_size: 50,
			})
			if (res.success && res.data) {
				setQuestions(res.data.questions)
				setTotal(res.data.total)
			}
		} catch {
			// handled by global toast
		} finally {
			setLoading(false)
		}
	}, [search, statusFilter])

	useEffect(() => {
		fetchQuestions()
	}, [fetchQuestions])

	const pendingCount = questions.filter((q) => q.status === "pending").length
	const flaggedCount = questions.filter((q) => q.status === "flagged").length

	const columns: Column<AdminQAQuestion>[] = [
		{
			field: "question",
			label: "Question",
			render: (_, q) => (
				<Box sx={{ maxWidth: 340 }}>
					<Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{q.question}
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{q.short_description}
					</Typography>
				</Box>
			),
		},
		{
			field: "tag",
			label: "Tag",
			render: (_, q) => (
				<Chip label={q.tag} size="small" sx={{ bgcolor: "#eff6ff", color: "#1e40af", fontWeight: 700, fontSize: "0.64rem", borderRadius: "6px", height: 22 }} />
			),
		},
		{
			field: "age",
			label: "Patient",
			render: (_, q) => (
				<Typography variant="caption" color="#475569">
					{[q.gender, q.age, q.location].filter(Boolean).join(' · ')}
				</Typography>
			),
		},
		{
			field: "answers_count",
			label: "Answers",
			render: (_, q) => (
				<Chip
					label={q.answers_count}
					size="small"
					sx={{
						bgcolor: q.answers_count > 0 ? "rgba(13,148,136,0.1)" : "#f1f5f9",
						color: q.answers_count > 0 ? "#0d9488" : "#64748b",
						fontWeight: 700,
						fontSize: "0.68rem",
						height: 22,
					}}
				/>
			),
		},
		{
			field: "status",
			label: "Status",
			render: (_, q) => <QAStatusBadge status={q.status} />,
		},
		{
			field: "created_at",
			label: "Posted",
			render: (_, q) =>
				q.created_at ? (
					<Typography variant="caption" color="text.secondary">
						{new Date(q.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
					</Typography>
				) : (
					<Typography variant="caption" color="text.secondary">—</Typography>
				),
		},
		{
			field: "actions",
			label: "",
			align: "right",
			render: (_, q) => (
				<Tooltip title="Inspect & Moderate">
					<IconButton
						size="small"
						onClick={() => {
							setSelectedId(q.id)
							setDrawerOpen(true)
						}}
						sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5, color: "#0d9488" }}
					>
						<VisibilityIcon sx={{ fontSize: 15 }} />
					</IconButton>
				</Tooltip>
			),
		},
	]

	return (
		<Box>
			<AdminPageHeader
				title="Health Q&A Moderation"
				subtitle="Inspect and moderate patient questions, expert answers, and community replies."
				count={total}
				countLabel="questions"
			/>

			<Grid container spacing={2.5} sx={{ mb: 3.5 }}>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard
						label="Total Questions"
						value={total.toLocaleString()}
						icon={<QuestionAnswerIcon />}
						iconColor="#0d9488"
						iconBg="rgba(13,148,136,0.12)"
						description="All time"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard
						label="Awaiting Review"
						value={pendingCount.toLocaleString()}
						icon={<HourglassEmptyIcon />}
						iconColor="#b45309"
						iconBg="rgba(180,83,9,0.12)"
						description="Need moderation action"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard
						label="Flagged"
						value={flaggedCount.toLocaleString()}
						icon={<FlagIcon />}
						iconColor="#ea580c"
						iconBg="rgba(234,88,12,0.12)"
						description="Reported content"
					/>
				</Grid>
			</Grid>

			<Stack spacing={2} sx={{ mb: 2.5 }}>
				<Tabs
					value={statusFilter}
					onChange={(_, v) => setStatusFilter(v)}
					sx={{
						minHeight: 38,
						"& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 13, minHeight: 38, py: 0 },
						"& .Mui-selected": { color: "#0d9488 !important" },
						"& .MuiTabs-indicator": { bgcolor: "#0d9488", height: 2 },
					}}
				>
					{STATUS_TABS.map((t) => (
						<Tab key={t.value} value={t.value} label={t.label} />
					))}
				</Tabs>
				<Box sx={{ maxWidth: 360, width: '100%' }}>
					<AppInput
						fullWidth
						size="small"
						placeholder="Search questions or tags... (Enter)"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						enableVoiceSearch
						onVoiceResult={(text) => {
							setSearchInput(text)
							setSearch(text)
						}}
						onKeyDown={(e) => { if (e.key === "Enter") setSearch(searchInput) }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
								</InputAdornment>
							),
						}}
						sx={{ bgcolor: "#ffffff", borderRadius: 1 }}
					/>
				</Box>
			</Stack>

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
					<CircularProgress sx={{ color: "#0d9488" }} />
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading Q&A data...</Typography>
				</Stack>
			) : (
				<AppTable<AdminQAQuestion>
					columns={columns}
					rows={questions}
					emptyMessage="No questions match the selected filters."
				/>
			)}

			<QAInspectionDrawer
				questionId={selectedId}
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onQuestionStatusChange={fetchQuestions}
			/>
		</Box>
	)
}

