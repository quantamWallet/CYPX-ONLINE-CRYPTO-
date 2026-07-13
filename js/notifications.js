// js/notifications.js

import { getMessaging, getToken, onMessage }
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js";

import { app } from "./firebase-config.js";

const messaging = getMessaging(app);

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Permission granted');
  } else {
    console.log('Permission denied');
  }
}

export async function getFCMToken() {
  const registration = await navigator.serviceWorker.ready;
  
  const token = await getToken(messaging, {
    vapidKey: "BA5WTygmBXbFaID-siEqdgUsIE9a9NbSA2I3Pd0gQBLU4KFaI0IcaNdpUaJA-ry9-gDGrCi5AP8foATgGgO-CUQ",
    serviceWorkerRegistration: registration
  });

  console.log('FCM Token:', token);
  return token;
}

// NEW: Handle messages when app is open
export function listenForegroundMessages() {
  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    const title = payload.notification?.title || payload.data?.title;
    const body = payload.notification?.body || payload.data?.body;

    new Notification(title, {
      body: body,
      icon: '/CYPX-ONLINE-CRYPTO-/icon-192.png'
    });
  });
}
