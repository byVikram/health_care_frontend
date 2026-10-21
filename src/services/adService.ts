// src/services/adService.ts
import ApiService from './apiService'

export interface Advertisement {
	id: string
	title: string
	image_url: string
	target_url: string
	is_active: boolean
	start_date?: string
	end_date?: string
	impressions: number
	clicks: number
	ctr?: number
}

export interface AdPlacementConfig {
	id: string
	page_route: string
	placement_key: string
	paragraph_index?: number
	category?: string
	ad: {
		id: string
		title: string
		image_url: string
		target_url: string
	}
}

export const getActiveAds = async (
	pageRoute: string,
	category?: string
): Promise<{ success: boolean; data: AdPlacementConfig[] }> => {
	const params: Record<string, string> = { page_route: pageRoute }
	if (category) {
		params.category = category
	}
	const res = await ApiService.getWithParams<{ success: boolean; data: AdPlacementConfig[] }>('/api/ads/active', params)
	return res.data
}

export const trackAdMetric = async (
	adId: string,
	action: 'impression' | 'click'
): Promise<{ success: boolean; message: string }> => {
	const res = await ApiService.post<{ success: boolean; message: string }>(
		`/api/ads/${adId}/track?action=${action}`,
		{}
	)
	return res.data
}
