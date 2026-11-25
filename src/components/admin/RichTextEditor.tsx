// src/components/admin/RichTextEditor.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
	Box,
	Stack,
	IconButton,
	Tooltip,
	Divider,
	Select,
	MenuItem,
	Tabs,
	Tab,
	TextField,
	Paper,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from '@mui/material'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import CodeIcon from '@mui/icons-material/Code'
import LinkIcon from '@mui/icons-material/Link'
import ImageIcon from '@mui/icons-material/Image'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import FormatClearIcon from '@mui/icons-material/FormatClear'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import { toast } from 'react-toastify'
import { safeUrl, sanitizeHtml } from '../../utils/sanitize'

export interface RichTextEditorProps {
	value: string
	onChange: (htmlValue: string) => void
	minHeight?: number
	placeholder?: string
}

export default function RichTextEditor({
	value,
	onChange,
	minHeight = 300,
	placeholder = 'Compose your healthcare blog article using rich formatting, headings, lists, images...',
}: RichTextEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null)
	const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual')
	const [heading, setHeading] = useState<string>('p')
	const isMounted = useRef(false)
	// Link / image URL dialog. The editor loses focus while it is open, so the caret / selection is saved first and restored on insert.
	const [urlDialog, setUrlDialog] = useState<'link' | 'image' | null>(null)
	const [urlInput, setUrlInput] = useState('')
	const savedRange = useRef<Range | null>(null)

	// Sync initial value or tab switch back to visual
	useEffect(() => {
		if (editorRef.current && (!isMounted.current || activeTab === 'visual')) {
			// Only rewrites the DOM when it differs from `value`, which is not the case while typing (onChange sends innerHTML back),
			// so the caret does not jump; it does when `value` changes from outside (e.g. the article loads).
			if (editorRef.current.innerHTML !== value) {
				// Sanitised: a stored body with an onerror/script payload must not run when an admin opens it to edit.
				editorRef.current.innerHTML = sanitizeHtml(value || '')
			}
			isMounted.current = true
		}
	}, [activeTab, value])

	const handleInput = useCallback(() => {
		if (editorRef.current) {
			onChange(editorRef.current.innerHTML)
		}
	}, [onChange])

	// Make Enter create <p> (not <div>) so the saved HTML matches what the reader page styles
	useEffect(() => {
		try {
			document.execCommand('defaultParagraphSeparator', false, 'p')
		} catch {
			// unsupported browser: keep default
		}
	}, [])

	// document.execCommand is deprecated but still supported by every browser and has no standard replacement for contentEditable;
	// moving off it means a rich-text library (e.g. Tiptap / Lexical).
	const execCommand = (command: string, arg: string | undefined = undefined) => {
		document.execCommand(command, false, arg)
		handleInput()
	}

	const handleHeadingChange = (tag: string) => {
		setHeading(tag)
		if (tag === 'p') {
			execCommand('formatBlock', '<p>')
		} else {
			execCommand('formatBlock', `<${tag}>`)
		}
	}

	const openUrlDialog = (kind: 'link' | 'image') => {
		const sel = window.getSelection()
		const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null
		savedRange.current = range && editorRef.current?.contains(range.commonAncestorContainer) ? range.cloneRange() : null
		setUrlInput('https://')
		setUrlDialog(kind)
	}

	const closeUrlDialog = () => setUrlDialog(null)

	const submitUrlDialog = () => {
		const kind = urlDialog
		if (!kind || !urlInput.trim() || urlInput.trim() === 'https://') return
		const url = safeUrl(urlInput.trim())
		if (!url) {
			toast.error(kind === 'link' ? 'Only http:// or https:// links are allowed' : 'Only http:// or https:// image URLs are allowed')
			return
		}
		setUrlDialog(null)
		editorRef.current?.focus()
		if (savedRange.current) {
			const sel = window.getSelection()
			sel?.removeAllRanges()
			sel?.addRange(savedRange.current)
		}
		execCommand(kind === 'link' ? 'createLink' : 'insertImage', url)
	}

	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: 2.5,
				borderColor: '#0d9488',
				borderWidth: '2px',
				overflow: 'hidden',
				bgcolor: '#ffffff',
				boxShadow: '0 4px 20px rgba(13, 148, 136, 0.08)',
			}}
		>
			{/* Header Banner */}
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={{
					px: 2,
					py: 1,
					bgcolor: '#f0fdf4',
					borderBottom: '1px solid #ccfbf1',
				}}
			>
				{/* <Stack direction="row" alignItems="center" spacing={1}>
					<AutoAwesomeIcon sx={{ fontSize: 18, color: '#0d9488' }} />
					<Typography variant="subtitle2" fontWeight={800} color="#0f766e">
						WYSIWYG Rich Text Article Composer
					</Typography>
					<Chip label="Rich Formatting Mode" size="small" sx={{ bgcolor: '#0d9488', color: '#fff', fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
				</Stack> */}

				<Tabs
					value={activeTab}
					onChange={(_, v) => setActiveTab(v)}
					sx={{
						minHeight: 30,
						'& .MuiTab-root': {
							minHeight: 30,
							py: 0,
							px: 1.5,
							fontSize: '0.78rem',
							fontWeight: 700,
							textTransform: 'none',
							color: '#64748b',
							'&.Mui-selected': { color: '#0d9488' },
						},
						'& .MuiTabs-indicator': { bgcolor: '#0d9488', height: 2, borderRadius: 2 },
					}}
				>
					<Tab label="Visual Editor" value="visual" />
					<Tab label="HTML Source Code" value="code" />
				</Tabs>
			</Stack>

			{/* Formatting Toolbar (Only shown in Visual Mode) */}
			{activeTab === 'visual' && (
				<Stack
					direction="row"
					flexWrap="wrap"
					alignItems="center"
					spacing={0.5}
					sx={{
						p: 1.25,
						bgcolor: '#f8fafc',
						borderBottom: '1px solid #e2e8f0',
						gap: 0.5,
					}}
				>
					{/* Heading Selector */}
					<Select
						size="small"
						value={heading}
						onChange={(e) => handleHeadingChange(e.target.value)}
						sx={{
							height: 34,
							fontSize: '0.8rem',
							fontWeight: 700,
							color: '#0f172a',
							borderRadius: 1.5,
							bgcolor: '#ffffff',
							'& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
						}}
					>
						<MenuItem value="p">Paragraph Body</MenuItem>
						<MenuItem value="h1">Heading 1 (Main Title)</MenuItem>
						<MenuItem value="h2">Heading 2 (Section Title)</MenuItem>
						<MenuItem value="h3">Heading 3 (Sub-heading)</MenuItem>
					</Select>

					<Divider orientation="vertical" flexItem sx={{ my: 0.5, mx: 0.5 }} />

					{/* Text Formatting Tools */}
					<Tooltip title="Bold (Ctrl+B)">
						<IconButton
							size="small"
							onClick={() => execCommand('bold')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #e2e8f0',
								bgcolor: '#fff',
								'&:hover': { bgcolor: '#f1f5f9' },
							}}
						>
							<FormatBoldIcon sx={{ fontSize: 18, color: '#0f172a' }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Italic (Ctrl+I)">
						<IconButton
							size="small"
							onClick={() => execCommand('italic')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #e2e8f0',
								bgcolor: '#fff',
								'&:hover': { bgcolor: '#f1f5f9' },
							}}
						>
							<FormatItalicIcon sx={{ fontSize: 18, color: '#0f172a' }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Underline (Ctrl+U)">
						<IconButton
							size="small"
							onClick={() => execCommand('underline')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #e2e8f0',
								bgcolor: '#fff',
								'&:hover': { bgcolor: '#f1f5f9' },
							}}
						>
							<FormatUnderlinedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Strikethrough">
						<IconButton
							size="small"
							onClick={() => execCommand('strikeThrough')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #e2e8f0',
								bgcolor: '#fff',
								'&:hover': { bgcolor: '#f1f5f9' },
							}}
						>
							<StrikethroughSIcon sx={{ fontSize: 18, color: '#0f172a' }} />
						</IconButton>
					</Tooltip>

					<Divider orientation="vertical" flexItem sx={{ my: 0.5, mx: 0.5 }} />

					{/* Lists & Quotes */}
					<Tooltip title="Bullet List">
						<IconButton
							size="small"
							onClick={() => execCommand('insertUnorderedList')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #e2e8f0',
								bgcolor: '#fff',
								'&:hover': { bgcolor: '#f1f5f9' },
							}}
						>
							<FormatListBulletedIcon sx={{ fontSize: 18, color: '#0d9488' }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Numbered List">
						<IconButton
							size="small"
							onClick={() => execCommand('insertOrderedList')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #e2e8f0',
								bgcolor: '#fff',
								'&:hover': { bgcolor: '#f1f5f9' },
							}}
						>
							<FormatListNumberedIcon sx={{ fontSize: 18, color: '#0d9488' }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Blockquote Callout">
						<IconButton
							size="small"
							onClick={() => execCommand('formatBlock', 'blockquote')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #e2e8f0',
								bgcolor: '#fff',
								'&:hover': { bgcolor: '#f1f5f9' },
							}}
						>
							<FormatQuoteIcon sx={{ fontSize: 18, color: '#0d9488' }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Code Block">
						<IconButton
							size="small"
							onClick={() => execCommand('formatBlock', 'pre')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #e2e8f0',
								bgcolor: '#fff',
								'&:hover': { bgcolor: '#f1f5f9' },
							}}
						>
							<CodeIcon sx={{ fontSize: 18, color: '#475569' }} />
						</IconButton>
					</Tooltip>

					<Divider orientation="vertical" flexItem sx={{ my: 0.5, mx: 0.5 }} />

					{/* Media & Link */}
					<Tooltip title="Insert Hyperlink">
						<IconButton
							size="small"
							onClick={() => openUrlDialog('link')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #bbf7d0',
								bgcolor: '#f0fdf4',
								color: '#16a34a',
								'&:hover': { bgcolor: '#dcfce7' },
							}}
						>
							<LinkIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Insert Image Banner">
						<IconButton
							size="small"
							onClick={() => openUrlDialog('image')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #bbf7d0',
								bgcolor: '#f0fdf4',
								color: '#16a34a',
								'&:hover': { bgcolor: '#dcfce7' },
							}}
						>
							<ImageIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Horizontal Divider Line">
						<IconButton
							size="small"
							onClick={() => execCommand('insertHorizontalRule')}
							sx={{ borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}
						>
							<HorizontalRuleIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>

					<Divider orientation="vertical" flexItem sx={{ my: 0.5, mx: 0.5 }} />

					{/* History & Reset */}
					<Tooltip title="Undo">
						<IconButton
							size="small"
							onClick={() => execCommand('undo')}
							sx={{ borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}
						>
							<UndoIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Redo">
						<IconButton
							size="small"
							onClick={() => execCommand('redo')}
							sx={{ borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}
						>
							<RedoIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Clear Formatting">
						<IconButton
							size="small"
							onClick={() => execCommand('removeFormat')}
							sx={{
								borderRadius: 1.5,
								border: '1px solid #fecaca',
								bgcolor: '#fff1f2',
								color: '#dc2626',
								'&:hover': { bgcolor: '#fee2e2' },
							}}
						>
							<FormatClearIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>
				</Stack>
			)}

			{/* Editor Content Area */}
			{activeTab === 'visual' ? (
				<Box
					ref={editorRef}
					contentEditable
					onInput={handleInput}
					sx={{
						minHeight,
						maxHeight: 550,
						overflowY: 'auto',
						p: 3,
						outline: 'none',
						fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
						fontSize: 18,
						lineHeight: '30px',
						'& p, & div': { m: '0 0 18px' },
						color: '#0f172a',
						bgcolor: '#ffffff',
						'&:empty:before': {
							content: `"${placeholder}"`,
							color: '#94a3b8',
							fontStyle: 'italic',
							cursor: 'text',
						},
						'& h1': {
							fontSize: '1.85rem',
							fontWeight: 800,
							color: '#0f172a',
							mt: 2,
							mb: 1,
							letterSpacing: '-0.02em',
						},
						'& h2': { fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', mt: 2, mb: 1 },
						'& h3': { fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', mt: 1.5, mb: 0.75 },
						'& p': { mb: 1.5 },
						'& blockquote': {
							borderLeft: '4px solid #0d9488',
							pl: 2.5,
							ml: 0,
							my: 2,
							color: '#334155',
							fontStyle: 'italic',
							bgcolor: '#f0fdf4',
							py: 1.5,
							borderRadius: '0 10px 10px 0',
						},
						'& pre': {
							bgcolor: '#0f172a',
							color: '#e2e8f0',
							p: 2,
							borderRadius: 2,
							fontFamily: 'monospace',
							fontSize: '0.85rem',
							overflowX: 'auto',
						},
						'& img': { maxWidth: '100%', borderRadius: 2, my: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
						'& a': { color: '#0d9488', textDecoration: 'underline', fontWeight: 700 },
						'& ul, & ol': { pl: 3, mb: 1.5 },
					}}
				/>
			) : (
				<TextField
					fullWidth
					multiline
					rows={14}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					sx={{
						'& .MuiOutlinedInput-notchedOutline': { border: 'none' },
						'& .MuiInputBase-input': {
							fontFamily: 'monospace',
							fontSize: '0.88rem',
							p: 2.5,
							lineHeight: 1.6,
							// bgcolor: '#b9c2d6ff',
							// color: '#38bdf8',
						},
					}}
				/>
			)}

			<Dialog open={urlDialog !== null} onClose={closeUrlDialog} maxWidth="xs" fullWidth>
				<DialogTitle>{urlDialog === 'image' ? 'Insert image' : 'Insert link'}</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						fullWidth
						margin="dense"
						label={urlDialog === 'image' ? 'Public image URL (http or https)' : 'Destination web link (http or https)'}
						value={urlInput}
						onChange={(e) => setUrlInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault()
								submitUrlDialog()
							}
						}}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeUrlDialog}>Cancel</Button>
					<Button variant="contained" onClick={submitUrlDialog}>
						Insert
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	)
}
