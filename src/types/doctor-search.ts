// src/types/doctor-search.ts

export interface DoctorSearchItem {
	id: string
	name: string
	is_verified: boolean
	avatar_s3_key: string | null
	location: string
	experience_years: number
	specialities: string[]
	distance?: number
	hospital?: {
		name: string
		address: string
		latitude: number | null
		longitude: number | null
	}
}

export interface DoctorSearchMeta {
	total: number
	page: number
	limit: number
	pages: number
}

export interface DoctorSearchResponse {
	success: boolean
	message: string
	data: DoctorSearchItem[]
	meta?: DoctorSearchMeta
	total?: number
	page?: number
	limit?: number
	pages?: number
}
