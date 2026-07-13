// firebase-messaging-sw.js - put this in root

importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCCW4G9JlVu_xb0bGjlKmsi5mdqXSwvFak",
  authDomain: "quantum-rio.firebaseapp.com",
  databaseURL: "https://quantum-rio-default-rtdb.firebaseio.com",
  projectId: "quantum-rio",
  storageBucket: "quantum-rio.firebasestorage.app",
  messagingSenderId: "805433999377",
  appId: "1:805433999377:web:d0efa8c46ec4a0fa30f1b0",
  measurementId: "G-4RSQXZJX44"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'CYPX Notification';
  const notificationBody = payload.notification?.body || payload.data?.body || '';

  const notificationOptions = {
    body: notificationBody,
    icon: '/CYPX-ONLINE-CRYPTO-/icon-192.png', // fixed path
    badge: '/CYPX-ONLINE-CRYPTO-/icon-192.png',
    data: payload.data // so we can open dashboard on click
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/CYPX-ONLINE-CRYPTO-/')
  );
});
