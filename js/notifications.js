import { getMessaging, getToken }
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js";

import { app }
from "./firebase-config.js";

const messaging = getMessaging(app);

export async function requestNotificationPermission() {

  const permission =
    await Notification.requestPermission();

  if (permission === 'granted') {
    console.log('Permission granted');
  } else {
    console.log('Permission denied');
  }
}

export async function getFCMToken() {

  const registration =
    await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey: "R8zh-jtBaa37JonYyMU0B9Ufm2gt9T-pljqkabtsdc4",
    serviceWorkerRegistration: registration
  });

  console.log(token);

  return token;
}
