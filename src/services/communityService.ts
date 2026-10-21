// src/services/communityService.ts
import ApiService from './apiService'

export interface CommunityGroup {
	id: string
	name: string
	description?: string
	category: string
	icon_name?: string
	is_featured: boolean
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

export const listCommunityGroups = async (isFeatured?: boolean): Promise<{ success: boolean; data: CommunityGroup[] }> => {
	const params: Record<string, unknown> = {}
	if (isFeatured !== undefined) {
		params.is_featured = isFeatured
	}
	const res = await ApiService.getWithParams<{ success: boolean; data: CommunityGroup[] }>('/api/communities', params)
	return res.data
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
