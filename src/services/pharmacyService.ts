import ApiService from './apiService'
import { API_ENDPOINTS } from '../constants/apiUrls'
import { PharmaciesResponse, PharmacySearchParams } from '../types/pharmacy'

export const getPharmacies = async (params: PharmacySearchParams = {}): Promise<PharmaciesResponse> => {
	const queryParams: PharmacySearchParams = {
		page: params.page ?? 1,
		limit: params.limit ?? 12,
	}

	if (params.search) queryParams.search = params.search
	if (params.city) queryParams.city = params.city
	if (params.home_delivery !== undefined) queryParams.home_delivery = params.home_delivery
	if (params.is_24_x_7 !== undefined) queryParams.is_24_x_7 = params.is_24_x_7
	if (params.emergency_medicine !== undefined) queryParams.emergency_medicine = params.emergency_medicine

	// Cast to Record<string, unknown> to satisfy the method signature
	const response = await ApiService.getWithParams<PharmaciesResponse>(
		API_ENDPOINTS.PHARMACIES.LIST,
		queryParams as Record<string, unknown>
	)

	return response.data
}
