// src/features/bookings/bookingsService.ts
import ApiService from '../../services/apiService'
import { API_ENDPOINTS } from '../../constants/apiUrls'
import type { BookingsCategoryFilter, BookingsPage, BookingsWhen } from './bookingsTypes'

type Envelope<T> = { success: boolean; message?: string; data: T }

/** One page of the signed-in patient's combined bookings list (their own and their family members'). */
export const getMyBookings = async (params: {
	when: BookingsWhen
	category?: BookingsCategoryFilter
	page?: number
	limit?: number
}): Promise<BookingsPage> => {
	const res = await ApiService.getWithParams<Envelope<BookingsPage>>(API_ENDPOINTS.PATIENT.BOOKINGS, {
		when: params.when,
		category: params.category ?? 'all',
		page: params.page ?? 1,
		limit: params.limit ?? 20,
	})
	return res.data.data
}
