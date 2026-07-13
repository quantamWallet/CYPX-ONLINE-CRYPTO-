import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js";
import { app } from "./firebase-config.js";

const messaging = getMessaging(app);

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  console.log(permission === 'granted' ? 'Permission granted' : 'Permission denied');
}

export async function getFCMToken() {
  const registration = await navigator.serviceWorker.ready;
  const token = await getToken(messaging, {
    vapidKey: "BA5WTygmBXbFaID-siEqdgUsIE9a9NbSA2I3Pd0gQBLU4KFaI0IcaNdpUaJA-ry9-gDGrCi5AP8foATgGgO-CUQ",
    serviceWorkerRegistration: registration
  });
  return token;
}

export function listenForegroundMessages() {
  onMessage(messaging, (payload) => {
    console.log('Foreground message:', payload);
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: '/CYPX-ONLINE-CRYPTO-/icon-192.png'
    });
  });
}
