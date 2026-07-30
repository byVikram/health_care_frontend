// src/types/speciality.ts

export interface SpecialityItem {
	id: string
	label: string
	icon_key?: string | null
	description?: string | null
}

export interface SpecialitiesResponse {
	success: boolean
	message: string
	data: SpecialityItem[]
}
