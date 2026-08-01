// src/features/admin/pages/AdminCommunitiesPage.tsx
import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Card,
	CardContent,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Stack,
	Chip,
	CircularProgress,
	MenuItem,
	Grid,
	Switch,
	FormControlLabel,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import GroupsIcon from '@mui/icons-material/Groups'

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
		if (!name.trim()) {
			toast.warning('Name is required')
			return
		}
		if (!category) {
			toast.warning('Category is required')
			return
		}
		try {
			const payload = {
				name,
				description,
				category,
				icon_name: iconName,
				is_featured: isFeatured,
			}
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
			setGroups((prev) =>
				prev.map((g) => (g.id === group.id ? { ...g, is_featured: targetState } : g))
			)
		} catch (err) {
			console.error('Error toggling featured state:', err)
			toast.error('Failed to toggle featured state')
		}
	}

	return (
		<Box sx={{ p: 1 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
				<Box>
					<Typography variant="h5" fontWeight={800} color="#0f172a">
						Patient Support Groups & Communities
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Manage interactive discussion forums, map categories, and configure featured cards for the patient home screen.
					</Typography>
				</Box>
				<Stack direction="row" spacing={2}>
					<IconButton onClick={fetchGroups} sx={{ border: '1px solid #cbd5e1', borderRadius: 2.5 }}>
						<RefreshIcon fontSize="small" />
					</IconButton>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleOpenCreate}
						sx={{ bgcolor: '#0d9488', textTransform: 'none', borderRadius: 2.5, '&:hover': { bgcolor: '#0f766e' } }}
					>
						Create Group
					</Button>
				</Stack>
			</Stack>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
				</Box>
			) : (
				<TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
					<Table sx={{ minWidth: 650 }}>
						<TableHead sx={{ bgcolor: '#f8fafc' }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Group Name</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Description</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Category</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Icon Reference</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#475569' }}>Landing Page Featured</TableCell>
								<TableCell align="right" sx={{ fontWeight: 700, color: '#475569', pr: 3 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{groups.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
										No community groups configured. Click "Create Group" to add one.
									</TableCell>
								</TableRow>
							) : (
								groups.map((group) => (
									<TableRow key={group.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>
											<Stack direction="row" spacing={1.5} alignItems="center">
												<GroupsIcon sx={{ color: '#64748b' }} />
												<span>{group.name}</span>
											</Stack>
										</TableCell>
										<TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', maxWidth: 300 }}>
											{group.description || 'No description provided.'}
										</TableCell>
										<TableCell>
											<Chip
												label={group.category}
												size="small"
												sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 600 }}
											/>
										</TableCell>
										<TableCell sx={{ fontFamily: 'monospace', color: '#64748b' }}>
											{group.icon_name || 'forum'}
										</TableCell>
										<TableCell>
											<FormControlLabel
												control={
													<Switch
														checked={group.is_featured}
														onChange={() => handleToggleFeatured(group)}
														color="primary"
														sx={{
															'& .MuiSwitch-switchBase.Mui-checked': {
																color: '#0d9488',
															},
															'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
																backgroundColor: '#0d9488',
															},
														}}
													/>
												}
												label={group.is_featured ? 'Featured' : 'Standard'}
												sx={{ color: group.is_featured ? '#0d9488' : 'text.secondary', fontWeight: group.is_featured ? 700 : 400 }}
											/>
										</TableCell>
										<TableCell align="right" sx={{ pr: 3 }}>
											<Stack direction="row" spacing={1} justifyContent="flex-end">
												<IconButton color="primary" onClick={() => handleOpenEdit(group)} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
													<EditIcon fontSize="small" />
												</IconButton>
												<IconButton color="error" onClick={() => handleDelete(group.id)} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Stack>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			{/* Create/Edit Group Dialog */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 700 }}>
					{editingGroup ? 'Edit Support Group' : 'Create New Support Group'}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ pt: 1.5 }}>
						<TextField
							fullWidth
							label="Group Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="E.g., Cardiology Support Network"
						/>
						<Grid container spacing={2}>
							<Grid size={{ xs: 6 }}>
								<TextField
									fullWidth
									select
									label="Category"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
								>
									{COMMUNITY_CATEGORIES.map((cat) => (
										<MenuItem key={cat} value={cat}>
											{cat}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid size={{ xs: 6 }}>
								<TextField
									fullWidth
									select
									label="Material Icon Reference"
									value={iconName}
									onChange={(e) => setIconName(e.target.value)}
								>
									{COMMUNITY_ICONS.map((icon) => (
										<MenuItem key={icon} value={icon}>
											{icon}
										</MenuItem>
									))}
								</TextField>
							</Grid>
						</Grid>
						<TextField
							fullWidth
							multiline
							rows={3}
							label="Short Description"
							placeholder="Introduce the support group purpose and goals..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
						<FormControlLabel
							control={
								<Switch
									checked={isFeatured}
									onChange={(e) => setIsFeatured(e.target.checked)}
									color="primary"
								/>
							}
							label="Show this support group on the patient home page banner"
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}>
						Save Group
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
