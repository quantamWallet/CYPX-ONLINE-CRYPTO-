export async function requestNotificationPermission() {

  const permission =
    await Notification.requestPermission();

  if (permission === 'granted') {
    console.log('Permission granted');
  } else {
    console.log('Permission denied');
  }
}
import { getMessaging }
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js";

import { app }
from "./firebase-config.js";

const messaging = getMessaging(app);
import { getToken }
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js";

export async function getFCMToken() {

  const token = await getToken(messaging, {
    vapidKey: "YOUR_VAPID_KEY"
  });

  console.log(token);

  return token;
}
