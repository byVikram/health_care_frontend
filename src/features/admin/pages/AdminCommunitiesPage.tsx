// src/features/admin/pages/AdminCommunitiesPage.tsx
import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Stack,
	Chip,
	Avatar,
	CircularProgress,
	Grid,
	FormControlLabel,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import GroupsIcon from '@mui/icons-material/Groups'
import StarIcon from '@mui/icons-material/Star'

import AppSwitch from '../../../components/common/Switch/AppSwitch'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
// import SectionCard from '../../../components/common/Card/SectionCard'
// import StatusBadge from '../../../components/admin/StatusBadge'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'

import {
	listAdminCommunities,
	createAdminCommunity,
	updateAdminCommunity,
	deleteAdminCommunity,
	AdminCommunityItem,
} from '../adminService'
import { toast } from 'react-toastify'

const COMMUNITY_CATEGORIES = ['Endocrinology', 'Oncology', 'Geriatrics', 'Physical Therapy', 'General']
const COMMUNITY_ICONS = ['bloodtype', 'favorite', 'elderly', 'accessibility', 'forum']

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
	Endocrinology:    { bg: '#dbeafe', color: '#1d4ed8' },
	Oncology:         { bg: '#fee2e2', color: '#dc2626' },
	Geriatrics:       { bg: '#fef9c3', color: '#a16207' },
	'Physical Therapy': { bg: '#f3e8ff', color: '#7e22ce' },
	General:          { bg: '#ccfbf1', color: '#0f766e' },
}

export default function AdminCommunitiesPage() {
	const [groups, setGroups] = useState<AdminCommunityItem[]>([])
	const [loading, setLoading] = useState(true)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingGroup, setEditingGroup] = useState<AdminCommunityItem | null>(null)

	// Form State
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [category, setCategory] = useState('General')
	const [iconName, setIconName] = useState('forum')
	const [isFeatured, setIsFeatured] = useState(false)

	const fetchGroups = async () => {
		setLoading(true)
		try {
			const res = await listAdminCommunities()
			setGroups(res.data)
		} catch (err) {
			console.error('Error fetching admin communities:', err)
			toast.error('Failed to load community groups')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchGroups()
	}, [])

	const handleOpenCreate = () => {
		setEditingGroup(null)
		setName('')
		setDescription('')
		setCategory('General')
		setIconName('forum')
		setIsFeatured(false)
		setDialogOpen(true)
	}

	const handleOpenEdit = (group: AdminCommunityItem) => {
		setEditingGroup(group)
		setName(group.name)
		setDescription(group.description || '')
		setCategory(group.category)
		setIconName(group.icon_name || 'forum')
		setIsFeatured(group.is_featured)
		setDialogOpen(true)
	}

	const handleSubmit = async () => {
		if (!name.trim()) { toast.warning('Name is required'); return }
		if (!category) { toast.warning('Category is required'); return }
		try {
			const payload = { name, description, category, icon_name: iconName, is_featured: isFeatured }
			if (editingGroup) {
				await updateAdminCommunity(editingGroup.id, payload)
				toast.success('Community group updated successfully!')
			} else {
				await createAdminCommunity(payload)
				toast.success('Community group created successfully!')
			}
			setDialogOpen(false)
			await fetchGroups()
		} catch (err) {
			console.error('Error saving community group:', err)
			toast.error('Failed to save group details')
		}
	}

	const handleDelete = async (id: string) => {
		if (!window.confirm('Are you sure you want to delete this community group? This will purge all posts and replies under it!')) return
		try {
			await deleteAdminCommunity(id)
			toast.success('Community group deleted successfully')
			setGroups((prev) => prev.filter((g) => g.id !== id))
		} catch (err) {
			console.error('Error deleting group:', err)
			toast.error('Failed to delete group')
		}
	}

	const handleToggleFeatured = async (group: AdminCommunityItem) => {
		try {
			const targetState = !group.is_featured
			await updateAdminCommunity(group.id, { is_featured: targetState })
			toast.success(`${group.name} ${targetState ? 'featured on landing page' : 'removed from featured list'}`)
			setGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, is_featured: targetState } : g)))
		} catch (err) {
			console.error('Error toggling featured state:', err)
			toast.error('Failed to toggle featured state')
		}
	}

	const columns: Column<AdminCommunityItem>[] = [
		{
			field: 'name',
			label: 'Group',
			render: (_, group) => {
				const style = CATEGORY_COLORS[group.category] ?? { bg: '#f1f5f9', color: '#475569' }
				return (
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Avatar
							sx={{ width: 36, height: 36, bgcolor: style.bg, color: style.color, flexShrink: 0 }}
						>
							<GroupsIcon sx={{ fontSize: 18 }} />
						</Avatar>
						<Box sx={{ minWidth: 0 }}>
							<Stack direction="row" spacing={1} alignItems="center">
								<Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
									{group.name}
								</Typography>
								{group.is_featured && (
									<Chip
										icon={<StarIcon sx={{ fontSize: '11px !important', color: '#d97706 !important' }} />}
										label="Featured"
										size="small"
										sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
									/>
								)}
							</Stack>
							<Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 260, display: 'block' }}>
								{group.description || 'No description provided.'}
							</Typography>
						</Box>
					</Stack>
				)
			},
		},
		{
			field: 'category',
			label: 'Category',
			render: (_, group) => {
				const style = CATEGORY_COLORS[group.category] ?? { bg: '#f1f5f9', color: '#475569' }
				return (
					<Chip
						label={group.category}
						size="small"
						sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: '0.68rem', borderRadius: '6px', height: 22 }}
					/>
				)
			},
		},
		{
			field: 'icon_name',
			label: 'Icon',
			render: (_, group) => (
				<Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b', bgcolor: '#f8fafc', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #e2e8f0' }}>
					{group.icon_name || 'forum'}
				</Typography>
			),
		},
		{
			field: 'is_featured',
			label: 'Featured',
			render: (_, group) => (
				<FormControlLabel
					control={
						<AppSwitch
							checked={group.is_featured}
							onChange={() => handleToggleFeatured(group)}
						/>
					}
					label={
						<Typography variant="caption" fontWeight={600} color={group.is_featured ? '#0d9488' : 'text.secondary'}>
							{group.is_featured ? 'Featured' : 'Standard'}
						</Typography>
					}
					sx={{ m: 0 }}
				/>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_, group) => (
				<Stack direction="row" spacing={0.75} justifyContent="flex-end">
					<Tooltip title="Edit group">
						<IconButton
							size="small"
							onClick={() => handleOpenEdit(group)}
							sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#0d9488', '&:hover': { bgcolor: 'rgba(13,148,136,0.06)' } }}
						>
							<EditIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete group">
						<IconButton
							size="small"
							onClick={() => handleDelete(group.id)}
							sx={{ border: '1px solid #fecaca', borderRadius: 1.5, color: '#dc2626', bgcolor: '#fff1f2', '&:hover': { bgcolor: '#fee2e2' } }}
						>
							<DeleteIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
				</Stack>
			),
		},
	]

	return (
		<Box>
			<AdminPageHeader
				title="Community Groups"
				subtitle="Manage interactive patient support forums, categories, and featured placements."
				count={groups.length}
				countLabel="groups"
				actions={
					<>
						<Tooltip title="Refresh list">
							<IconButton
								onClick={fetchGroups}
								sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#64748b', '&:hover': { color: '#0f172a' } }}
							>
								<RefreshIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<AppButton
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleOpenCreate}
							label="Create Group"
							sx={{ bgcolor: '#0d9488', fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }}
						/>
					</>
				}
			/>

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>Loading communities...</Typography>
				</Stack>
			) : (
				<AppTable<AdminCommunityItem>
					columns={columns}
					rows={groups}
					emptyMessage='No community groups configured. Click "Create Group" to add one.'
				/>
			)}

			{/* Create/Edit Dialog */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
				<DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1 }}>
					{editingGroup ? 'Edit Support Group' : 'Create New Support Group'}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={2.5} sx={{ pt: 1.5 }}>
						<AppInput fullWidth label="Group Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g., Cardiology Support Network" />
						<Grid container spacing={2}>
							<Grid size={{ xs: 6 }}>
								<AppSelect
									fullWidth
									label="Category"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									options={COMMUNITY_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
								/>
							</Grid>
							<Grid size={{ xs: 6 }}>
								<AppSelect
									fullWidth
									label="Icon Reference"
									value={iconName}
									onChange={(e) => setIconName(e.target.value)}
									options={COMMUNITY_ICONS.map((icon) => ({ value: icon, label: icon }))}
								/>
							</Grid>
						</Grid>
						<AppInput fullWidth multiline rows={3} label="Short Description" placeholder="Introduce the support group purpose..." value={description} onChange={(e) => setDescription(e.target.value)} />
						<FormControlLabel
							control={<AppSwitch checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />}
							label={<Typography variant="body2">Show this group on the patient home page banner</Typography>}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1.5, gap: 1 }}>
					<AppButton variant="text" onClick={() => setDialogOpen(false)} label="Cancel" sx={{ color: '#64748b' }} />
					<AppButton variant="contained" onClick={handleSubmit} label={editingGroup ? 'Save Changes' : 'Create Group'} sx={{ bgcolor: '#0d9488', fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }} />
				</DialogActions>
			</Dialog>
		</Box>
	)
}
