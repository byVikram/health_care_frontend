// src/services/communityService.ts
import ApiService from './apiService'

export interface CommunityGroup {
	id: string
	name: string
	description?: string
	category: string
	icon_name?: string
	is_featured: boolean
	group_type?: string
	member_count?: number
	is_joined?: boolean
}

export interface CommunityPost {
	id: string
	title: string
	content: string
	is_pinned: boolean
	created_at: string
	user_id: string
	user_name: string
	user_role: string
}

export interface CommunityComment {
	id: string
	content: string
	status: string
	created_at: string
	user_id: string
	user_name: string
	user_role: string
	replies: CommunityComment[]
}

export interface PaginatedPostsResponse {
	success: boolean
	message: string
	data: CommunityPost[]
	meta: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface PaginatedGroupsResponse {
	success: boolean
	message?: string
	data: CommunityGroup[]
	meta: { total: number; page: number; limit: number; pages: number }
}

export interface ListGroupsOptions {
	category?: string
	search?: string
	/** Only the groups the signed-in user joined. */
	joinedOnly?: boolean
	/** Page size; leave out to get every group. */
	limit?: number
	page?: number
}

export const listCommunityGroups = async (isFeatured?: boolean, opts: ListGroupsOptions = {}): Promise<PaginatedGroupsResponse> => {
	const params: Record<string, unknown> = {}
	if (isFeatured !== undefined) {
		params.is_featured = isFeatured
	}
	if (opts.category) params.category = opts.category
	if (opts.search?.trim()) params.search = opts.search.trim()
	if (opts.joinedOnly) params.joined_only = true
	if (opts.limit) {
		params.limit = opts.limit
		params.page = opts.page ?? 1
	}
	const res = await ApiService.getWithParams<PaginatedGroupsResponse>('/api/communities', params)
	return res.data
}

/** Categories that have at least one community group, for the filter chips. */
export const listCommunityCategories = async (): Promise<string[]> => {
	const res = await ApiService.get<{ success: boolean; data: string[] }>('/api/communities/categories')
	return res.data.data
}

export const listCommunityPosts = async (
	groupId: string,
	page = 1,
	limit = 15
): Promise<PaginatedPostsResponse> => {
	const res = await ApiService.getWithParams<PaginatedPostsResponse>(`/api/communities/${groupId}/posts`, { page, limit })
	return res.data
}

export const createCommunityPost = async (
	groupId: string,
	title: string,
	content: string
): Promise<{ success: boolean; data: CommunityPost }> => {
	const res = await ApiService.post<{ success: boolean; data: CommunityPost }>(`/api/communities/${groupId}/posts`, {
		title,
		content,
	})
	return res.data
}

export const getCommunityPostDetails = async (postId: string): Promise<{ success: boolean; data: CommunityPost }> => {
	const res = await ApiService.get<{ success: boolean; data: CommunityPost }>(`/api/communities/threads/${postId}`)
	return res.data
}

export const getCommunityPostComments = async (postId: string): Promise<{ success: boolean; data: CommunityComment[] }> => {
	const res = await ApiService.get<{ success: boolean; data: CommunityComment[] }>(`/api/communities/threads/${postId}/comments`)
	return res.data
}

export const createCommunityComment = async (
	postId: string,
	content: string,
	parentId?: string
): Promise<{ success: boolean; data: CommunityComment }> => {
	const body: { content: string; parent_id?: string } = { content }
	if (parentId) {
		body.parent_id = parentId
	}
	const res = await ApiService.post<{ success: boolean; data: CommunityComment }>(
		`/api/communities/threads/${postId}/comments`,
		body
	)
	return res.data
}

export const joinCommunityGroup = async (groupId: string): Promise<{ success: boolean }> => {
	const res = await ApiService.post<{ success: boolean }>(`/api/communities/${groupId}/join`, {})
	return res.data
}

export const leaveCommunityGroup = async (groupId: string): Promise<{ success: boolean }> => {
	const res = await ApiService.delete<{ success: boolean }>(`/api/communities/${groupId}/join`)
	return res.data
}
