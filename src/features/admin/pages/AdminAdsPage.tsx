// src/features/admin/pages/AdminAdsPage.tsx
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
	Grid,
	CircularProgress,
	MenuItem,
	Divider,
	Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed'
import AssessmentIcon from '@mui/icons-material/Assessment'

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

	// Campaign Modal
	const [campaignOpen, setCampaignOpen] = useState(false)
	const [editingAd, setEditingAd] = useState<AdminAdItem | null>(null)
	const [adTitle, setAdTitle] = useState('')
	const [imageUrl, setImageUrl] = useState('')
	const [targetUrl, setTargetUrl] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')

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

	useEffect(() => {
		fetchData()
	}, [])

	const handleOpenCreateCampaign = () => {
		setEditingAd(null)
		setAdTitle('')
		setImageUrl('')
		setTargetUrl('')
		setStartDate('')
		setEndDate('')
		setCampaignOpen(true)
	}

	const handleOpenEditCampaign = (ad: AdminAdItem) => {
		setEditingAd(ad)
		setAdTitle(ad.title)
		setImageUrl(ad.image_url)
		setTargetUrl(ad.target_url)
		setStartDate(ad.start_date ? ad.start_date.substring(0, 16) : '')
		setEndDate(ad.end_date ? ad.end_date.substring(0, 16) : '')
		setCampaignOpen(true)
	}

	const handleSaveCampaign = async () => {
		if (!adTitle.trim() || !imageUrl.trim() || !targetUrl.trim()) {
			toast.warning('Please complete Title, Image URL, and Target URL')
			return
		}
		const payload = {
			title: adTitle,
			image_url: imageUrl,
			target_url: targetUrl,
			start_date: startDate ? new Date(startDate).toISOString() : undefined,
			end_date: endDate ? new Date(endDate).toISOString() : undefined,
		}
		try {
			if (editingAd) {
				await updateAd(editingAd.id, payload)
				toast.success('Ad campaign updated successfully!')
			} else {
				await createAd(payload)
				toast.success('Ad campaign created successfully!')
			}
			setCampaignOpen(false)
			await fetchData()
		} catch (err) {
			console.error('Error saving ad campaign:', err)
		}
	}

	const handleDeleteCampaign = async (id: string) => {
		if (!window.confirm('Delete this campaign? All placement configs for this ad will be lost.')) return
		try {
			await deleteAd(id)
			toast.success('Campaign deleted successfully')
			await fetchData()
		} catch (err) {
			console.error('Error deleting campaign:', err)
		}
	}

	const handleOpenPlacement = () => {
		if (ads.length === 0) {
			toast.warning('Create an ad campaign first')
			return
		}
		setSelectedAdId(ads[0].id)
		setPageRoute('*')
		setPlacementKey('sidebar')
		setParagraphIndex('')
		setAdCategory('')
		setPlacementOpen(true)
	}

	const handleSavePlacement = async () => {
		if (!selectedAdId) return
		const payload = {
			ad_id: selectedAdId,
			page_route: pageRoute,
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

	const handleDeletePlacement = async (id: string) => {
		if (!window.confirm('Delete this placement configuration?')) return
		try {
			await deleteAdPlacement(id)
			toast.success('Placement deleted successfully')
			setPlacements((prev) => prev.filter((p) => p.id !== id))
		} catch (err) {
			console.error('Error deleting placement:', err)
		}
	}

	// Calculate analytics aggregates
	const totalImpressions = ads.reduce((acc, curr) => acc + curr.impressions, 0)
	const totalClicks = ads.reduce((acc, curr) => acc + curr.clicks, 0)
	const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0.0

	return (
		<Box sx={{ p: 1 }}>
			<Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ mb: 1 }}>
				Dynamic Advertisement Console
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
				Configure ad creatives, link them to specific page layouts or categories, and track click-through engagement.
			</Typography>

			{/* Analytics Widgets */}
			<Grid container spacing={3} sx={{ mb: 5 }}>
				<Grid size={{ xs: 12, sm: 4 }}>
					<Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Box>
									<Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
										Total Impressions
									</Typography>
									<Typography variant="h4" fontWeight={800} sx={{ mt: 1, color: '#0f172a' }}>
										{totalImpressions}
									</Typography>
								</Box>
								<AssessmentIcon sx={{ color: '#0d9488', fontSize: 32 }} />
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Box>
									<Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
										Total Clicks
									</Typography>
									<Typography variant="h4" fontWeight={800} sx={{ mt: 1, color: '#0f172a' }}>
										{totalClicks}
									</Typography>
								</Box>
								<AssessmentIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					<Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Box>
									<Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
										Avg. Click-Through-Rate (CTR)
									</Typography>
									<Typography variant="h4" fontWeight={800} sx={{ mt: 1, color: '#0f172a' }}>
										{averageCtr.toFixed(2)}%
									</Typography>
								</Box>
								<AssessmentIcon sx={{ color: '#10b981', fontSize: 32 }} />
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress sx={{ color: '#0d9488' }} />
				</Box>
			) : (
				<Stack spacing={5}>
					{/* Active Campaigns */}
					<Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
						<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
							<Typography variant="h6" fontWeight={700} color="#0f172a">
								Ad Campaigns
							</Typography>
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={handleOpenCreateCampaign}
								sx={{ bgcolor: '#0d9488', textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#0f766e' } }}
							>
								Create Campaign
							</Button>
						</Box>
						<TableContainer>
							<Table sx={{ minWidth: 650 }}>
								<TableHead sx={{ bgcolor: '#f8fafc' }}>
									<TableRow>
										<TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Target URL</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Impressions</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Clicks</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>CTR</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
										<TableCell align="right" sx={{ fontWeight: 700, pr: 3 }}>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{ads.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
												No campaigns created yet.
											</TableCell>
										</TableRow>
									) : (
										ads.map((ad) => (
											<TableRow key={ad.id} hover>
												<TableCell sx={{ fontWeight: 600 }}>{ad.title}</TableCell>
												<TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{ad.target_url}</TableCell>
												<TableCell>{ad.impressions}</TableCell>
												<TableCell>{ad.clicks}</TableCell>
												<TableCell sx={{ fontWeight: 600, color: '#10b981' }}>
													{ad.ctr}%
												</TableCell>
												<TableCell>
													<Chip
														label={ad.is_active ? 'ACTIVE' : 'INACTIVE'}
														size="small"
														sx={{
															bgcolor: ad.is_active ? '#d1fae5' : '#f1f5f9',
															color: ad.is_active ? '#065f46' : '#475569',
															fontWeight: 700,
															fontSize: '0.65rem',
														}}
													/>
												</TableCell>
												<TableCell align="right" sx={{ pr: 3 }}>
													<Stack direction="row" spacing={1} justifyContent="flex-end">
														<IconButton color="primary" onClick={() => handleOpenEditCampaign(ad)} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
															<EditIcon fontSize="small" />
														</IconButton>
														<IconButton color="error" onClick={() => handleDeleteCampaign(ad.id)} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
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
					</Card>

					{/* Layout Placements */}
					<Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
						<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
							<Typography variant="h6" fontWeight={700} color="#0f172a">
								Configured Placements
							</Typography>
							<Button
								variant="contained"
								startIcon={<DynamicFeedIcon />}
								onClick={handleOpenPlacement}
								sx={{ bgcolor: '#0d9488', textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#0f766e' } }}
							>
								Configure Placement
							</Button>
						</Box>
						<TableContainer>
							<Table sx={{ minWidth: 650 }}>
								<TableHead sx={{ bgcolor: '#f8fafc' }}>
									<TableRow>
										<TableCell sx={{ fontWeight: 700 }}>Campaign Title</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Target Screen/Route</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Placement Key</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Paragraph Index</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Category Match</TableCell>
										<TableCell align="right" sx={{ fontWeight: 700, pr: 3 }}>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{placements.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
												No placements configured.
											</TableCell>
										</TableRow>
									) : (
										placements.map((p) => (
											<TableRow key={p.id} hover>
												<TableCell sx={{ fontWeight: 600 }}>{p.ad.title}</TableCell>
												<TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{p.page_route}</TableCell>
												<TableCell>
													<Chip label={p.placement_key} size="small" sx={{ fontWeight: 600, textTransform: 'uppercase' }} />
												</TableCell>
												<TableCell>{p.paragraph_index !== undefined && p.paragraph_index !== null ? `After para ${p.paragraph_index}` : 'N/A'}</TableCell>
												<TableCell>
													{p.category ? (
														<Chip label={p.category} size="small" sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 600 }} />
													) : (
														<Typography variant="caption" color="text.secondary">Global / Any</Typography>
													)}
												</TableCell>
												<TableCell align="right" sx={{ pr: 3 }}>
													<IconButton color="error" onClick={() => handleDeletePlacement(p.id)} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Card>
				</Stack>
			)}

			{/* Create/Edit Campaign Dialog */}
			<Dialog open={campaignOpen} onClose={() => setCampaignOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 700 }}>
					{editingAd ? 'Edit Campaign Creative' : 'New Campaign Creative'}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ pt: 1.5 }}>
						<TextField
							fullWidth
							label="Campaign Title"
							value={adTitle}
							onChange={(e) => setAdTitle(e.target.value)}
							placeholder="E.g., Elder Mobility Wheelchair Rentals"
						/>
						<TextField
							fullWidth
							label="Creative Banner Image URL"
							value={imageUrl}
							onChange={(e) => setImageUrl(e.target.value)}
							placeholder="Enter image URL..."
						/>
						<TextField
							fullWidth
							label="Click Redirect Destination URL"
							value={targetUrl}
							onChange={(e) => setTargetUrl(e.target.value)}
							placeholder="E.g., /pharmacies or https://example.com"
						/>
						<Grid container spacing={2}>
							<Grid size={{ xs: 6 }}>
								<TextField
									fullWidth
									label="Start Date"
									type="datetime-local"
									InputLabelProps={{ shrink: true }}
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</Grid>
							<Grid size={{ xs: 6 }}>
								<TextField
									fullWidth
									label="End Date"
									type="datetime-local"
									InputLabelProps={{ shrink: true }}
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</Grid>
						</Grid>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Button onClick={() => setCampaignOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={handleSaveCampaign} sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}>
						Save Campaign
					</Button>
				</DialogActions>
			</Dialog>

			{/* Create Placement Dialog */}
			<Dialog open={placementOpen} onClose={() => setPlacementOpen(false)} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontWeight: 700 }}>Configure Placement Rules</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ pt: 1.5 }}>
						<TextField
							fullWidth
							select
							label="Select Campaign"
							value={selectedAdId}
							onChange={(e) => setSelectedAdId(e.target.value)}
						>
							{ads.map((ad) => (
								<MenuItem key={ad.id} value={ad.id}>
									{ad.title}
								</MenuItem>
							))}
						</TextField>

						<TextField
							fullWidth
							select
							label="Target Screen/Route"
							value={pageRoute}
							onChange={(e) => setPageRoute(e.target.value)}
						>
							{PAGE_ROUTES.map((route) => (
								<MenuItem key={route.value} value={route.value}>
									{route.label}
								</MenuItem>
							))}
						</TextField>

						<TextField
							fullWidth
							select
							label="Placement Location"
							value={placementKey}
							onChange={(e) => setPlacementKey(e.target.value)}
						>
							{PLACEMENT_KEYS.map((key) => (
								<MenuItem key={key} value={key}>
									{key.toUpperCase()}
								</MenuItem>
							))}
						</TextField>

						{placementKey === 'in-feed' && (
							<TextField
								fullWidth
								label="Paragraph Offset Index"
								type="number"
								placeholder="E.g., 2 (inserts after paragraph 2)"
								value={paragraphIndex}
								onChange={(e) => setParagraphIndex(e.target.value !== '' ? Number(e.target.value) : '')}
							/>
						)}

						<TextField
							fullWidth
							select
							label="Medical Category Match (Optional)"
							value={adCategory}
							onChange={(e) => setAdCategory(e.target.value)}
							helperText="Matches ad to articles/posts of this medical specialty automatically."
						>
							<MenuItem value="">Global / Any Category</MenuItem>
							{AD_CATEGORIES.filter((cat) => cat !== 'All').map((cat) => (
								<MenuItem key={cat} value={cat}>
									{cat}
								</MenuItem>
							))}
						</TextField>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Button onClick={() => setPlacementOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={handleSavePlacement} sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}>
						Add Rule
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}
