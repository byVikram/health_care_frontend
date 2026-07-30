// src/config/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging, getToken, Messaging } from 'firebase/messaging'

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
	appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

let messaging: Messaging | null = null

export function initFirebase() {
	try {
		if (typeof window === 'undefined') return null

		const isSecure = window.isSecureContext
		console.log('[FCM AUDIT] Origin Info:', {
			href: window.location.href,
			protocol: window.location.protocol,
			hostname: window.location.hostname,
			isSecureContext: isSecure,
		})

		console.log('[FCM AUDIT] Firebase Configuration Check:', {
			hasApiKey: Boolean(firebaseConfig.apiKey),
			apiKeyLength: firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 0,
			hasProjectId: Boolean(firebaseConfig.projectId),
			projectId: firebaseConfig.projectId,
			hasMessagingSenderId: Boolean(firebaseConfig.messagingSenderId),
			messagingSenderId: firebaseConfig.messagingSenderId,
			hasAppId: Boolean(firebaseConfig.appId),
			hasVapidKey: Boolean(vapidKey),
			vapidKeyLength: vapidKey ? vapidKey.length : 0,
		})

		if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.messagingSenderId) {
			console.error(
				'[FCM AUDIT ERROR] Missing required Firebase configuration in environment variables (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_MESSAGING_SENDER_ID).'
			)
		}

		const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
		if ('Notification' in window && 'serviceWorker' in navigator) {
			messaging = getMessaging(app)
			console.log('[FCM AUDIT] Firebase Messaging initialized successfully.')
		} else {
			console.error('[FCM AUDIT ERROR] Notification or ServiceWorker API not supported in this browser environment.')
		}
		return messaging
	} catch (error: any) {
		console.error('[FCM AUDIT ERROR] Exception during initFirebase:', {
			name: error?.name,
			code: error?.code,
			message: error?.message,
			stack: error?.stack,
		})
		return null
	}
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
		console.error('[FCM AUDIT ERROR] Service Worker API unavailable in window/navigator.')
		return null
	}

	try {
		console.log('[FCM AUDIT] Registering /firebase-messaging-sw.js...')
		const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
			scope: '/',
		})
		console.log('[FCM AUDIT] Service Worker registration state:', {
			scope: registration.scope,
			active: Boolean(registration.active),
			installing: Boolean(registration.installing),
			waiting: Boolean(registration.waiting),
		})
		return registration
	} catch (error: any) {
		console.error('[FCM AUDIT ERROR] Service Worker registration failed:', {
			name: error?.name,
			code: error?.code,
			message: error?.message,
			stack: error?.stack,
		})
		return null
	}
}

export async function getFcmToken(): Promise<string | null> {
	if (typeof window === 'undefined' || !('Notification' in window)) {
		console.error('[FCM AUDIT ERROR] Window or Notification API unavailable.')
		return null
	}

	const perm = Notification.permission
	console.log('[FCM AUDIT] Current Notification.permission before getToken():', perm)
	if (perm !== 'granted') {
		console.warn('[FCM AUDIT WARN] Notification permission is not "granted". Current status:', perm)
		return null
	}

	const swRegistration = await registerServiceWorker()
	if (!swRegistration) {
		console.error('[FCM AUDIT ERROR] Service Worker registration returned null. Cannot call getToken().')
		return null
	}

	if (!messaging) {
		messaging = initFirebase()
	}

	if (!messaging) {
		console.error('[FCM AUDIT ERROR] Firebase Messaging object is null after initFirebase().')
		return null
	}

	if (!vapidKey) {
		console.error(
			'[FCM AUDIT ERROR] VITE_FIREBASE_VAPID_KEY is missing or empty. Firebase getToken() requires a valid Web Push VAPID key from Firebase Console.'
		)
	}

	try {
		console.log('[FCM AUDIT] Executing Firebase getToken() with VAPID key:', vapidKey ? `${vapidKey.substring(0, 10)}...` : '(empty)')
		const token = await getToken(messaging, {
			serviceWorkerRegistration: swRegistration,
			vapidKey: vapidKey || undefined,
		})

		if (token && token.trim().length > 0) {
			console.log('[FCM AUDIT SUCCESS] Firebase getToken() returned valid token:', token)
			return token
		} else {
			console.error('[FCM AUDIT ERROR] Firebase getToken() returned empty token string or null.')
			return null
		}
	} catch (error: any) {
		console.error('[FCM AUDIT CRITICAL ERROR] Firebase getToken() failed! Complete error details:', {
			name: error?.name,
			code: error?.code,
			message: error?.message,
			customData: error?.customData,
			stack: error?.stack,
		})
		throw error
	}
}
