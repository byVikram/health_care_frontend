// src/types/radiology-search.ts

export interface RadiologySearchResultItem {
	id: string
	name: string
	address: string
	city: string
	state: string
	scan_id: number
	scan_name: string
	pricing_model: 'fixed' | 'starting_from' | 'quote_required'
	base_price: number | null
	price_details: string | null
	logo_s3_key: string | null
}
