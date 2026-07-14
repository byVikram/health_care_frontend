// src/types/chatbot.ts

export interface SourceReference {
	title: string
	source: string
	url?: string
	chunk_id: string
}

export interface HospitalSuggestion {
	name: string
	address: string
	distance?: string
	fees: number
	consultation_mode: string
	earliest_slot?: string
}

export interface DoctorSuggestion {
	id?: string
	name: string
	speciality: string[]
	location: string
	hospital_name?: string
	avatar_s3_key?: string
	fees: number
	availability?: string[]
	rating?: number
	consultation_mode: string
	distance?: string
	experience_years: number
	earliest_slot?: string
	hospitals?: HospitalSuggestion[]
}

export interface ChatResponse {
	answer: string
	home_remedies: string[]
	possible_conditions: string[]
	severity: 'low' | 'medium' | 'high' | 'emergency'
	doctor_needed: boolean
	recommended_speciality?: string
	nearby_doctors: DoctorSuggestion[]
	sources: SourceReference[]
	confidence_category: 'High' | 'Moderate' | 'Low'
	confidence_score: number
	disclaimer: string
}

export interface ChatMessageResponse {
	id: string
	role: 'user' | 'assistant'
	content: string
	triage_level?: string
	conversation_mode?: string
	confidence_category?: string
	confidence_score?: number
	sources?: SourceReference[]
	structured_payload?: ChatResponse
	is_helpful?: boolean
	feedback_comments?: string
	created_at: string
}

export interface ChatSessionResponse {
	id: string
	title: string
	persistent_memory: Record<string, any>
	memory_summary: string
	created_at: string
	updated_at: string
	messages?: ChatMessageResponse[]
}
