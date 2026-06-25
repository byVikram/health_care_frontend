// src/types/laboratory-search.ts

export interface LaboratorySearchResultItem {
	id: string          // laboratory public_id
	name: string
	address: string
	city: string
	state: string
	test_id: number     // laboratory_tests.id
	test_name: string
	pricing_model: 'fixed' | 'starting_from' | 'quote_required'
	base_price: number | null
	price_details: string | null
	logo_s3_key: string | null
}
