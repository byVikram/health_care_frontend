// src/services/blogService.ts
import ApiService from './apiService'

export interface BlogAuthor {
	id?: string
	name: string
	bio?: string
	avatar_url?: string
	avatar?: string
	designation?: string
	specialty?: string
	credentials?: string
	experience?: string
}

export interface BlogPost {
	id: string
	title: string
	slug: string
	content: string
	category: string
	status: string
	image_url?: string
	is_featured: boolean
	published_at?: string
	created_at: string
	author: BlogAuthor
	content_type?: 'article' | 'blog' | 'podcast'
	tag?: string
	author_name?: string
	read_time_minutes?: number
	media_url?: string
	media_duration_seconds?: number
}

export interface BlogComment {
	id: string
	content: string
	status: string
	created_at: string
	user_id: string
	user_name: string
	user_role: string
	replies: BlogComment[]
}

export interface PaginatedBlogsResponse {
	success: boolean
	message: string
	data: BlogPost[]
	meta: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export type BlogContentType = 'article' | 'blog' | 'podcast'

export const listBlogs = async (
	category?: string,
	page = 1,
	limit = 10,
	isFeatured?: boolean,
	contentType?: BlogContentType,
	adminOnly?: boolean,
	search?: string,
	/** Leave this post out of the list (the page shows it separately). */
	excludeId?: string,
	/** Skip this many posts; overrides page, so one page can be smaller than the rest. */
	offset?: number
): Promise<PaginatedBlogsResponse> => {
	const params: Record<string, unknown> = { page, limit }
	if (adminOnly) {
		params.admin_only = true
	}
	if (contentType) {
		params.content_type = contentType
	}
	if (category) {
		params.category = category
	}
	if (isFeatured !== undefined) {
		params.is_featured = isFeatured
	}
	if (search?.trim()) {
		params.search = search.trim()
	}
	if (excludeId) {
		params.exclude_id = excludeId
	}
	if (offset !== undefined) {
		params.offset = offset
	}
	const res = await ApiService.getWithParams<PaginatedBlogsResponse>('/api/blogs', params)
	return res.data
}

/** Categories that have at least one published post of this type, for the filter chips. */
export const listBlogCategories = async (contentType: BlogContentType): Promise<string[]> => {
	const res = await ApiService.getWithParams<{ success: boolean; data: string[] }>('/api/blogs/categories', {
		content_type: contentType,
	})
	return res.data.data
}

export const getBlogPost = async (slug: string): Promise<{ success: boolean; data: BlogPost }> => {
	const res = await ApiService.get<{ success: boolean; data: BlogPost }>(`/api/blogs/${slug}`)
	return res.data
}

export const getBlogComments = async (slug: string): Promise<{ success: boolean; data: BlogComment[] }> => {
	const res = await ApiService.get<{ success: boolean; data: BlogComment[] }>(`/api/blogs/${slug}/comments`)
	return res.data
}

export const createBlogComment = async (
	slug: string,
	content: string,
	parentId?: string
): Promise<{ success: boolean; data: BlogComment }> => {
	const body: { content: string; parent_id?: string } = { content }
	if (parentId) {
		body.parent_id = parentId
	}
	const res = await ApiService.post<{ success: boolean; data: BlogComment }>(`/api/blogs/${slug}/comments`, body)
	return res.data
}
