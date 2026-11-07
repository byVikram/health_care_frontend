// src/components/admin/ContentImageField.tsx
// Picture picker for the admin forms of blogs, ads and events. Upload only: the file goes to the server
// (POST /api/admin/content-images), which stores it in the public bucket; this field holds the URL it returns.
// An older item may still carry an external link: it is shown and kept until the admin replaces or removes it.
import { useRef, useState, ChangeEvent } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { toast } from 'react-toastify'

import AppButton from '../common/Button/AppButton'
import {
	CONTENT_IMAGE_ACCEPTED_TYPES,
	ContentImageKind,
	uploadContentImage,
	validateContentImage,
} from '../../features/admin/adminService'

interface ContentImageFieldProps {
	label: string
	kind: ContentImageKind
	/** The picture's URL ('' for none). */
	value: string
	onChange: (url: string) => void
	/** Height of the preview, in px. */
	previewHeight?: number
	disabled?: boolean
	hint?: string
}

export default function ContentImageField({
	label,
	kind,
	value,
	onChange,
	previewHeight = 120,
	disabled = false,
	hint = 'JPEG, PNG or WebP, up to 5 MB. It is resized and optimised on upload.',
}: ContentImageFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [uploading, setUploading] = useState(false)
	const [loadFailed, setLoadFailed] = useState(false)

	const handlePick = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		e.target.value = '' // the same file can be picked again
		if (!file) return
		const problem = validateContentImage(file)
		if (problem) {
			toast.warning(problem)
			return
		}
		setUploading(true)
		try {
			const url = await uploadContentImage(file, kind)
			setLoadFailed(false)
			onChange(url)
		} catch (err) {
			// the API wrapper already showed the server's message
			console.error('Image upload failed:', err)
		} finally {
			setUploading(false)
		}
	}

	return (
		<Stack spacing={1}>
			<Typography variant="caption" fontWeight={700} color="text.secondary">
				{label}
			</Typography>
			{value && !loadFailed ? (
				<Box
					component="img"
					src={value}
					alt={label}
					onError={() => setLoadFailed(true)}
					sx={{
						width: '100%',
						height: previewHeight,
						objectFit: 'cover',
						borderRadius: 2,
						border: '1px solid #e2e8f0',
					}}
				/>
			) : (
				<Box
					sx={{
						width: '100%',
						height: previewHeight,
						borderRadius: 2,
						border: '1px dashed #cbd5e1',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: '#94a3b8',
						fontSize: 13,
						textAlign: 'center',
						px: 2,
					}}
				>
					{value ? 'The current picture could not be loaded' : 'No image yet'}
				</Box>
			)}
			<Stack direction="row" spacing={1}>
				<AppButton
					variant="outlined"
					size="small"
					loading={uploading}
					disabled={disabled}
					startIcon={<CloudUploadIcon />}
					label={value ? 'Replace image' : 'Upload image'}
					onClick={() => inputRef.current?.click()}
					sx={{ borderColor: '#0d9488', color: '#0d9488', '&:hover': { borderColor: '#0f766e' } }}
				/>
				{value && (
					<AppButton
						variant="text"
						size="small"
						color="error"
						disabled={disabled || uploading}
						startIcon={<DeleteOutlineIcon />}
						label="Remove"
						onClick={() => {
							setLoadFailed(false)
							onChange('')
						}}
					/>
				)}
			</Stack>
			<Typography variant="caption" color="text.secondary">
				{hint}
			</Typography>
			<input
				ref={inputRef}
				type="file"
				hidden
				accept={CONTENT_IMAGE_ACCEPTED_TYPES.join(',')}
				onChange={handlePick}
			/>
		</Stack>
	)
}
