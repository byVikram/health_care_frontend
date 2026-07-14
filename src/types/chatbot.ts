export interface SourceReference {
	title: string
	url?: string
}

export interface NearbyDoctor {
	id?: string
	name: string
	avatar_s3_key?: string | null
	rating?: number
	speciality: string[]
	experience_years: number
	hospital_name?: string
	location: string
	distance?: string
	earliest_slot?: string
	fees: number
	consultation_mode: string
}

export interface ChatResponse {
	possible_conditions?: string[]
	home_remedies?: string[]
	recommended_speciality?: string
	nearby_doctors?: NearbyDoctor[]
}
