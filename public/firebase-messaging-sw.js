// public/firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Environment values can be customized or passed dynamically if required
const firebaseConfig = {
  apiKey: "AIzaSy_demo_key_placeholder",
  authDomain: "healthcare-app.firebaseapp.com",
  projectId: "healthcare-app",
  storageBucket: "healthcare-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:demo"
};

try {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'Health Care Notification';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: payload.notification?.icon || '/vite.svg',
      data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  console.log('[firebase-messaging-sw.js] Service Worker initialized successfully');
} catch (error) {
  console.error('[firebase-messaging-sw.js] Error initializing Firebase SW:', error);
}
