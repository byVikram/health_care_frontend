// src/features/admin/pages/AdminAdsPage.tsx
import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Stack,
	Chip,
	CircularProgress,
	Grid,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Tab,
	Tabs,
	FormControlLabel,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed'
import CampaignIcon from '@mui/icons-material/Campaign'
import VisibilityIcon from '@mui/icons-material/Visibility'
import MouseIcon from '@mui/icons-material/Mouse'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AppSwitch from '../../../components/common/Switch/AppSwitch'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import AdminStatCard from '../../../components/admin/AdminStatCard'
import SectionCard from '../../../components/common/Card/SectionCard'
import StatusBadge from '../../../components/admin/StatusBadge'
import AppButton from '../../../components/common/Button/AppButton'
import AppInput from '../../../components/common/Input/AppInput'
import AppSelect from '../../../components/common/Select/AppSelect'
import ConfirmModal from '../../../components/common/Modal/ConfirmModal'
import ContentImageField from '../../../components/admin/ContentImageField'

import {
	listAllAds,
	createAd,
	updateAd,
	deleteAd,
	listAdPlacements,
	createAdPlacement,
	deleteAdPlacement,
	AdminAdItem,
	AdminAdPlacementItem,
} from '../adminService'
import { toast } from 'react-toastify'

const PAGE_ROUTES = [
	{ label: 'All Pages (Wildcard)', value: '*' },
	{ label: 'Blogs Main Feed', value: '/blogs' },
	{ label: 'Blog Article Reader', value: '/blogs/:slug' },
	{ label: 'Communities List', value: '/communities' },
	{ label: 'Community Discussion Details', value: '/communities/threads/:threadId' },
]

const PLACEMENT_KEYS = ['sidebar', 'header', 'in-feed']
const AD_CATEGORIES = ['All', 'Endocrinology', 'Oncology', 'Geriatrics', 'Physical Therapy', 'General']

export default function AdminAdsPage() {
	const [ads, setAds] = useState<AdminAdItem[]>([])
	const [placements, setPlacements] = useState<AdminAdPlacementItem[]>([])
	const [loading, setLoading] = useState(true)
	const [activeTab, setActiveTab] = useState<'campaigns' | 'placements'>('campaigns')

	// Delete Modals State
	const [adPendingDelete, setAdPendingDelete] = useState<AdminAdItem | null>(null)
	const [placementPendingDelete, setPlacementPendingDelete] = useState<AdminAdPlacementItem | null>(null)
	const [deletingCampaign, setDeletingCampaign] = useState(false)
	const [deletingPlacement, setDeletingPlacement] = useState(false)

	// Campaign Modal
	const [campaignOpen, setCampaignOpen] = useState(false)
	const [editingAd, setEditingAd] = useState<AdminAdItem | null>(null)
	const [adTitle, setAdTitle] = useState('')
	const [imageUrl, setImageUrl] = useState('')
	const [targetUrl, setTargetUrl] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [adIsActive, setAdIsActive] = useState(true)
	const [saving, setSaving] = useState(false)

	// Placement Modal
	const [placementOpen, setPlacementOpen] = useState(false)
	const [selectedAdId, setSelectedAdId] = useState('')
	const [pageRoute, setPageRoute] = useState('*')
	const [placementKey, setPlacementKey] = useState('sidebar')
	const [paragraphIndex, setParagraphIndex] = useState<number | ''>('')
	const [adCategory, setAdCategory] = useState('')

	const fetchData = async () => {
		setLoading(true)
		try {
			const adsRes = await listAllAds()
			setAds(adsRes.data)
			const placementsRes = await listAdPlacements()
			setPlacements(placementsRes.data)
		} catch (err) {
			console.error('Error fetching ads console data:', err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { fetchData() }, [])

	const handleOpenCreateCampaign = () => {
		setEditingAd(null); setAdTitle(''); setImageUrl(''); setTargetUrl(''); setStartDate(''); setEndDate(''); setAdIsActive(true)
		setCampaignOpen(true)
	}

	const handleOpenEditCampaign = (ad: AdminAdItem) => {
		setEditingAd(ad); setAdTitle(ad.title); setImageUrl(ad.image_url); setTargetUrl(ad.target_url); setAdIsActive(ad.is_active)
		setStartDate(ad.start_date ? ad.start_date.substring(0, 16) : '')
		setEndDate(ad.end_date ? ad.end_date.substring(0, 16) : '')
		setCampaignOpen(true)
	}

	const handleSaveCampaign = async () => {
		if (!adTitle.trim() || !imageUrl.trim() || !targetUrl.trim()) {
			toast.warning('Please complete Title, Banner Image, and Target URL'); return
		}
		setSaving(true)
		const payload = { title: adTitle, image_url: imageUrl, target_url: targetUrl, is_active: adIsActive, start_date: startDate ? new Date(startDate).toISOString() : undefined, end_date: endDate ? new Date(endDate).toISOString() : undefined }
		try {
			if (editingAd) { await updateAd(editingAd.id, payload); toast.success('Ad campaign updated successfully!') }
			else { await createAd(payload); toast.success('Ad campaign created successfully!') }
			setCampaignOpen(false); await fetchData()
		} catch (err) { console.error('Error saving ad campaign:', err) }
		finally { setSaving(false) }
	}

	const handleConfirmDeleteCampaign = async () => {
		if (!adPendingDelete) return
		setDeletingCampaign(true)
		try {
			await deleteAd(adPendingDelete.id)
			toast.success('Campaign deleted successfully')
			setAdPendingDelete(null)
			await fetchData()
		} catch (err) {
			console.error('Error deleting campaign:', err)
			toast.error('Failed to delete campaign')
		} finally {
			setDeletingCampaign(false)
		}
	}

	const handleOpenPlacement = () => {
		if (ads.length === 0) { toast.warning('Create an ad campaign first'); return }
		setSelectedAdId(ads[0].id); setPageRoute('*'); setPlacementKey('sidebar'); setParagraphIndex(''); setAdCategory('')
		setPlacementOpen(true)
	}

	const handleSavePlacement = async () => {
		if (!selectedAdId) return
		let resolvedPageRoute = pageRoute
		if (pageRoute === '/blogs/:slug' && placementKey === 'in-feed') {
			resolvedPageRoute = '/blogs/*'
		}
		const payload = {
			ad_id: selectedAdId,
			page_route: resolvedPageRoute,
			placement_key: placementKey,
			paragraph_index: paragraphIndex !== '' ? Number(paragraphIndex) : undefined,
			category: adCategory || undefined,
		}
		try {
			await createAdPlacement(payload)
			toast.success('Ad placement configured successfully!')
			setPlacementOpen(false)
			await fetchData()
		} catch (err) {
			console.error('Error creating placement config:', err)
		}
	}

	const handleConfirmDeletePlacement = async () => {
		if (!placementPendingDelete) return
		setDeletingPlacement(true)
		try {
			await deleteAdPlacement(placementPendingDelete.id)
			toast.success('Placement deleted successfully')
			setPlacements((prev) => prev.filter((p) => p.id !== placementPendingDelete.id))
			setPlacementPendingDelete(null)
		} catch (err) {
			console.error('Error deleting placement:', err)
			toast.error('Failed to delete placement')
		} finally {
			setDeletingPlacement(false)
		}
	}

	const totalImpressions = ads.reduce((acc, curr) => acc + curr.impressions, 0)
	const totalClicks = ads.reduce((acc, curr) => acc + curr.clicks, 0)
	const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0.0

	const campaignColumns: Column<AdminAdItem>[] = [
		{
			field: 'title',
			label: 'Campaign',
			render: (_, ad) => (
				<Box>
					<Typography variant="body2" fontWeight={700} color="#0f172a">{ad.title}</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
						{ad.target_url}
					</Typography>
				</Box>
			),
		},
		{
			field: 'impressions',
			label: 'Impressions',
			render: (_, ad) => (
				<Typography variant="body2" fontWeight={700} color="#0f172a">{ad.impressions.toLocaleString()}</Typography>
			),
		},
		{
			field: 'clicks',
			label: 'Clicks',
			render: (_, ad) => (
				<Typography variant="body2" fontWeight={700} color="#0f172a">{ad.clicks.toLocaleString()}</Typography>
			),
		},
		{
			field: 'ctr',
			label: 'CTR',
			render: (_, ad) => (
				<Chip
					label={`${ad.ctr}%`}
					size="small"
					sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.68rem', borderRadius: '6px', height: 22 }}
				/>
			),
		},
		{
			field: 'is_active',
			label: 'Status',
			render: (_, ad) => (
				<Stack direction="row" spacing={1} alignItems="center">
					<Tooltip title={ad.is_active ? 'Campaign Active (Click to pause)' : 'Campaign Inactive (Click to activate)'}>
						<span>
							<AppSwitch
								checked={ad.is_active}
								onChange={async () => {
									try {
										await updateAd(ad.id, { is_active: !ad.is_active })
										toast.success(`Campaign "${ad.title}" ${!ad.is_active ? 'activated' : 'paused'}`)
										fetchData()
									} catch {
										toast.error('Failed to update campaign status.')
									}
								}}
							/>
						</span>
					</Tooltip>
					<StatusBadge status={ad.is_active ? 'active' : 'draft'} label={ad.is_active ? 'Active' : 'Inactive'} />
				</Stack>
			),
		},
		{
			field: 'actions',
			label: 'Actions',
			align: 'right',
			render: (_, ad) => (
				<Stack direction="row" spacing={0.75} justifyContent="flex-end">
					<Tooltip title="Edit campaign">
						<IconButton size="small" onClick={() => handleOpenEditCampaign(ad)} sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#0d9488', '&:hover': { bgcolor: 'rgba(13,148,136,0.06)' } }}>
							<EditIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete campaign">
						<IconButton size="small" onClick={() => setAdPendingDelete(ad)} sx={{ border: '1px solid #fecaca', borderRadius: 1.5, color: '#dc2626', bgcolor: '#fff1f2', '&:hover': { bgcolor: '#fee2e2' } }}>
							<DeleteIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
				</Stack>
			),
		},
	]

	const placementColumns: Column<AdminAdPlacementItem>[] = [
		{
			field: 'ad',
			label: 'Campaign',
			render: (_, p) => (
				<Typography variant="body2" fontWeight={700} color="#0f172a">{p.ad.title}</Typography>
			),
		},
		{
			field: 'page_route',
			label: 'Route',
			render: (_, p) => (
				<Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#475569', bgcolor: '#f8fafc', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #e2e8f0' }}>
					{p.page_route}
				</Typography>
			),
		},
		{
			field: 'placement_key',
			label: 'Location',
			render: (_, p) => (
				<Chip label={p.placement_key.toUpperCase()} size="small" sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 700, fontSize: '0.65rem', borderRadius: '6px', height: 22 }} />
			),
		},
		{
			field: 'paragraph_index',
			label: 'Paragraph',
			render: (_, p) => (
				<Typography variant="caption" color="text.secondary">
					{p.paragraph_index !== undefined && p.paragraph_index !== null ? `After para ${p.paragraph_index}` : '—'}
				</Typography>
			),
		},
		{
			field: 'category',
			label: 'Category',
			render: (_, p) => p.category ? (
				<Chip label={p.category} size="small" sx={{ bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 600, fontSize: '0.68rem', borderRadius: '6px', height: 22 }} />
			) : (
				<Typography variant="caption" color="text.secondary">Global / Any</Typography>
			),
		},
		{
			field: 'actions',
			label: '',
			align: 'right',
			render: (_, p) => (
				<Tooltip title="Remove placement">
					<IconButton size="small" onClick={() => setPlacementPendingDelete(p)} sx={{ border: '1px solid #fecaca', borderRadius: 1.5, color: '#dc2626', bgcolor: '#fff1f2', '&:hover': { bgcolor: '#fee2e2' } }}>
						<DeleteIcon sx={{ fontSize: 16 }} />
					</IconButton>
				</Tooltip>
			),
		},
	]

	return (
		<Box>
			<AdminPageHeader
				title="Advertisement Console"
				subtitle="Configure ad creatives, placement rules, and track click-through engagement across pages."
				count={ads.length}
				countLabel="campaigns"
			/>

			{/* KPI Stats */}
			<Grid container spacing={2.5} sx={{ mb: 3.5 }}>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard label="Total Impressions" value={totalImpressions.toLocaleString()} icon={<VisibilityIcon />} iconColor="#0d9488" iconBg="rgba(13,148,136,0.12)" description="Across all campaigns" />
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard label="Total Clicks" value={totalClicks.toLocaleString()} icon={<MouseIcon />} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)" description="User click interactions" />
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<AdminStatCard label="Avg. Click-Through Rate" value={`${averageCtr.toFixed(2)}%`} icon={<TrendingUpIcon />} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)" description="CTR across all campaigns" />
				</Grid>
			</Grid>

			{loading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
					<Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>Loading advertisement data...</Typography>
				</Stack>
			) : (
				<Box>
					{/* Tab Switcher & Header Action */}
					<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
						<Tabs
							value={activeTab}
							onChange={(_, v) => setActiveTab(v)}
							sx={{
								'& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 13.5 },
								'& .Mui-selected': { color: '#0d9488 !important' },
								'& .MuiTabs-indicator': { bgcolor: '#0d9488', height: 3 },
							}}
						>
							<Tab value="campaigns" label={`Campaigns (${ads.length})`} icon={<CampaignIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
							<Tab value="placements" label={`Placements (${placements.length})`} icon={<DynamicFeedIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
						</Tabs>

						<Box>
							{activeTab === 'campaigns' ? (
								<AppButton
									variant="contained"
									startIcon={<AddIcon />}
									onClick={handleOpenCreateCampaign}
									label="Create Campaign"
									sx={{ bgcolor: '#0d9488', fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }}
								/>
							) : (
								<AppButton
									variant="contained"
									startIcon={<DynamicFeedIcon />}
									onClick={handleOpenPlacement}
									label="Configure Placement"
									sx={{ bgcolor: '#0d9488', fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }}
								/>
							)}
						</Box>
					</Stack>

					{activeTab === 'campaigns' ? (
						<AppTable<AdminAdItem> columns={campaignColumns} rows={ads} emptyMessage="No campaigns created yet. Create one to get started." />
					) : (
						<AppTable<AdminAdPlacementItem> columns={placementColumns} rows={placements} emptyMessage="No placement configurations yet. Add one to route ads to specific pages." />
					)}
				</Box>
			)}

			{/* Campaign Dialog */}
			<Dialog open={campaignOpen} onClose={() => setCampaignOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
				<DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>{editingAd ? 'Edit Campaign Creative' : 'New Campaign Creative'}</DialogTitle>
				<DialogContent>
					<Stack spacing={2.5} sx={{ pt: 1.5 }}>
						<AppInput fullWidth label="Campaign Title" value={adTitle} onChange={(e) => setAdTitle(e.target.value)} placeholder="E.g., Elder Mobility Wheelchair Rentals" />
						<ContentImageField label="Creative Banner Image" kind="ads" value={imageUrl} onChange={setImageUrl} disabled={saving} previewHeight={140} />
						<AppInput fullWidth label="Click Redirect Destination URL" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="E.g., /doctors or https://example.com" />
						<Grid container spacing={2}>
							<Grid size={{ xs: 6 }}>
								<AppInput fullWidth label="Start Date" type="datetime-local" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
							</Grid>
							<Grid size={{ xs: 6 }}>
								<AppInput fullWidth label="End Date" type="datetime-local" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
							</Grid>
						</Grid>
						<FormControlLabel
							control={<AppSwitch checked={adIsActive} onChange={(e) => setAdIsActive(e.target.checked)} />}
							label={<Typography variant="body2" fontWeight={600}>Set Campaign Active & Live</Typography>}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1.5, gap: 1 }}>
					<AppButton variant="text" onClick={() => setCampaignOpen(false)} label="Cancel" sx={{ color: '#64748b' }} />
					<AppButton variant="contained" onClick={handleSaveCampaign} label="Save Campaign" sx={{ bgcolor: '#0d9488', fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }} />
				</DialogActions>
			</Dialog>

			{/* Placement Dialog */}
			<Dialog open={placementOpen} onClose={() => setPlacementOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
				<DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Configure Placement Rules</DialogTitle>
				<DialogContent>
					<Stack spacing={2.5} sx={{ pt: 1.5 }}>
						<AppSelect
							fullWidth
							label="Select Campaign"
							value={selectedAdId}
							onChange={(e) => setSelectedAdId(e.target.value)}
							options={ads.map((ad) => ({ value: ad.id, label: ad.title }))}
						/>
						<AppSelect
							fullWidth
							label="Target Screen/Route"
							value={pageRoute}
							onChange={(e) => setPageRoute(e.target.value)}
							options={PAGE_ROUTES.map((route) => ({ value: route.value, label: route.label }))}
						/>
						<AppSelect
							fullWidth
							label="Placement Location"
							value={placementKey}
							onChange={(e) => setPlacementKey(e.target.value)}
							options={PLACEMENT_KEYS.map((key) => ({ value: key, label: key.toUpperCase() }))}
						/>
						{placementKey === 'in-feed' && (
							<AppInput fullWidth label="Paragraph Offset Index" type="number" placeholder="E.g., 2 (inserts after paragraph 2)" value={paragraphIndex} onChange={(e) => setParagraphIndex(e.target.value !== '' ? Number(e.target.value) : '')} />
						)}
						<AppSelect
							fullWidth
							label="Medical Category Match (Optional)"
							value={adCategory}
							onChange={(e) => setAdCategory(e.target.value)}
							options={[
								{ value: '', label: 'Global / Any Category' },
								...AD_CATEGORIES.filter((cat) => cat !== 'All').map((cat) => ({ value: cat, label: cat }))
							]}
							helperText="Matches ad to articles/posts of this medical specialty."
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1.5, gap: 1 }}>
					<AppButton variant="text" onClick={() => setPlacementOpen(false)} label="Cancel" sx={{ color: '#64748b' }} />
					<AppButton variant="contained" onClick={handleSavePlacement} label="Add Rule" sx={{ bgcolor: '#0d9488', fontWeight: 700, '&:hover': { bgcolor: '#0f766e' } }} />
				</DialogActions>
			</Dialog>

			{/* Confirm Delete Campaign */}
			<ConfirmModal
				open={adPendingDelete !== null}
				onClose={() => setAdPendingDelete(null)}
				onConfirm={handleConfirmDeleteCampaign}
				title="Delete Ad Campaign"
				description={`Delete campaign "${adPendingDelete?.title}"? All placement configs for this ad will be lost.`}
				variant="delete"
				confirmLabel="Delete Campaign"
				loading={deletingCampaign}
			/>

			{/* Confirm Delete Placement */}
			<ConfirmModal
				open={placementPendingDelete !== null}
				onClose={() => setPlacementPendingDelete(null)}
				onConfirm={handleConfirmDeletePlacement}
				title="Delete Placement Configuration"
				description={`Delete placement rule on route "${placementPendingDelete?.page_route}" (${placementPendingDelete?.placement_key})?`}
				variant="delete"
				confirmLabel="Delete Placement"
				loading={deletingPlacement}
			/>
		</Box>
	)
}
