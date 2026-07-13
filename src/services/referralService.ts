// src/services/referralService.ts
import ApiService from './apiService'
import { API_ENDPOINTS } from '../constants/apiUrls'
import {
	CreateReferralPayload,
	Referral,
	ReferralResponse,
	ReferralsListResponse,
	NotificationsResponse,
	AppNotification,
} from '../types/referral'

// ── Referral APIs ─────────────────────────────────────────────────────────────

export const createReferral = async (payload: CreateReferralPayload): Promise<Referral> => {
	const res = await ApiService.post<ReferralResponse>(API_ENDPOINTS.REFERRALS.CREATE, payload)
	return res.data.data
}

export const getReferralsSent = async (): Promise<Referral[]> => {
	const res = await ApiService.get<ReferralsListResponse>(API_ENDPOINTS.REFERRALS.SENT)
	return res.data.data
}

export const getReferralsReceived = async (): Promise<Referral[]> => {
	const res = await ApiService.get<ReferralsListResponse>(API_ENDPOINTS.REFERRALS.RECEIVED)
	return res.data.data
}

export const getReferralDetail = async (id: string): Promise<Referral> => {
	const res = await ApiService.get<ReferralResponse>(API_ENDPOINTS.REFERRALS.DETAIL(id))
	return res.data.data
}

// ── Notification APIs ─────────────────────────────────────────────────────────

export const getNotifications = async (unread_only = false): Promise<AppNotification[]> => {
	const res = await ApiService.getWithParams<NotificationsResponse>(API_ENDPOINTS.NOTIFICATIONS.LIST, {
		unread_only,
	})
	return res.data.data
}

export const markNotificationRead = async (
	id: string
): Promise<AppNotification> => {
	const res = await ApiService.patch<{ success: boolean; message: string; data: AppNotification }>(
		API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
		{ is_read: true }
	)
	return res.data.data
}
