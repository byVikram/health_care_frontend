// src/components/common/NotificationPermissionPopup.tsx
import React, { useEffect, useState, useRef } from 'react'
import { useAuth, setNotificationPromptShown } from '../../hooks/useAuth'
import ApiService from '../../services/apiService'
import ConfirmModal from './Modal/ConfirmModal'
import { getFcmToken } from '../../config/firebase'

export default function NotificationPermissionPopup() {
	const { notificationPromptShown, accessToken } = useAuth()
	const [isVisible, setIsVisible] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const hasSyncedFcmRef = useRef<string | null>(null)

	// Helper to send FCM token to dedicated backend API
	const syncFcmToken = async () => {
		try {
			console.log('[FCM FLOW] Triggering syncFcmToken()...')
			const fcmToken = await getFcmToken()
			if (fcmToken) {
				console.log('[FCM FLOW] Valid FCM token retrieved:', fcmToken)
				console.log('[FCM FLOW] Sending PATCH /api/auth/session/fcm-token...')
				const response = await ApiService.patch(
					'/api/auth/session/fcm-token',
					{ fcm_token: fcmToken },
					{ suppressErrorToast: true }
				)
				console.log('[FCM FLOW SUCCESS] Backend response:', response.data)
			} else {
				console.error('[FCM FLOW ERROR] getFcmToken() returned null. FCM token was NOT synced to backend.')
			}
		} catch (error: any) {
			console.error('[FCM FLOW CRITICAL ERROR] Exception inside syncFcmToken():', {
				name: error?.name,
				code: error?.code,
				message: error?.message,
				stack: error?.stack,
			})
		}
	}

	// Helper to update prompt flag on backend
	const markPromptShownOnBackend = async () => {
		try {
			console.log('[FCM FLOW] Updating notification_prompt_shown flag on backend...')
			await ApiService.patch('/api/auth/session/notification-prompt', undefined, {
				suppressErrorToast: true,
			})
			setNotificationPromptShown(true)
		} catch (error) {
			console.error('[FCM FLOW ERROR] Failed to update notification-prompt flag:', error)
		}
	}

	useEffect(() => {
		if (!accessToken || !('Notification' in window)) {
			setIsVisible(false)
			return
		}

		const permission = Notification.permission
		console.log('[FCM POPUP useEffect] State Audit:', {
			accessTokenPresent: Boolean(accessToken),
			notificationPromptShown,
			notificationPermission: permission,
		})

		// Case 1: Permission is "granted"
		if (permission === 'granted') {
			setIsVisible(false)
			if (hasSyncedFcmRef.current !== accessToken) {
				hasSyncedFcmRef.current = accessToken
				console.log('[FCM POPUP] Permission is GRANTED. Triggering syncFcmToken()...')
				syncFcmToken()
				if (notificationPromptShown === false) {
					markPromptShownOnBackend()
				}
			}
			return
		}

		// Case 2: Permission is "denied"
		if (permission === 'denied') {
			setIsVisible(false)
			if (notificationPromptShown === false) {
				markPromptShownOnBackend()
			}
			return
		}

		// Case 3: Permission is "default"
		if (permission === 'default') {
			if (notificationPromptShown === false) {
				console.log('[FCM POPUP] Permission is DEFAULT & prompt not shown. Showing modal dialog...')
				setIsVisible(true)
			} else {
				setIsVisible(false)
			}
		}
	}, [accessToken, notificationPromptShown])

	const handleNotifyMe = async () => {
		if (!('Notification' in window)) return

		setIsLoading(true)
		try {
			console.log('[FCM POPUP handleNotifyMe] Invoking Notification.requestPermission()...')
			const permission = await Notification.requestPermission()
			console.log('[FCM POPUP handleNotifyMe] Browser permission result:', permission)

			if (permission === 'granted') {
				await syncFcmToken()
			} else {
				console.warn('[FCM POPUP handleNotifyMe] Browser permission was not granted by user:', permission)
			}

			await markPromptShownOnBackend()
			setIsVisible(false)
		} catch (error) {
			console.error('[FCM POPUP handleNotifyMe ERROR] Exception during permission request:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleClose = async () => {
		console.log('[FCM POPUP handleClose] User dismissed modal via backdrop/close. Marking prompt shown on backend...')
		await markPromptShownOnBackend()
		setIsVisible(false)
	}

	if (!isVisible) return null

	return (
		<ConfirmModal
			open={isVisible}
			onClose={handleClose}
			onConfirm={handleNotifyMe}
			title="Enable Notifications"
			description="Stay up to date with your appointments and important alerts. We promise not to spam you!"
			confirmLabel="Notify Me"
			loading={isLoading}
			variant="info"
		/>
	)
}
