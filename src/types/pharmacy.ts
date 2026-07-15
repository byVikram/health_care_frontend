export interface OperatingHours {
	open: string
	close: string
}

export interface PharmacyItem {
	id: string
	owner_name: string
	avatar_s3_key: string | null
	name: string
	address: string
	city: string
	operating_hours: OperatingHours
	home_delivery_available: boolean
	is_24_x_7: boolean
	emergency_medicine_available: boolean
}

export interface PharmaciesResponse {
	success: boolean
	message: string
	data: PharmacyItem[]
	meta: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

export interface PharmacySearchParams {
	page?: number
	limit?: number
	search?: string
	city?: string
	home_delivery?: boolean
	is_24_x_7?: boolean
	emergency_medicine?: boolean
}
// Add to pharmacyService.ts
export interface PharmacyListParams {
	page?: number
	limit?: number
	search?: string
	city?: string
	home_delivery?: boolean
	is_24_x_7?: boolean
	emergency_medicine?: boolean
}
