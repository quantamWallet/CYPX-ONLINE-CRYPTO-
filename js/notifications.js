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
    vapidKey: "R8zh-jtBaa37JonYyMU0B9Ufm2gt9T-pljqkabtsdc4",
  });

  console.log(token);

  return token;
}
document.addEventListener("DOMContentLoaded", () => {

  const container =
    document.getElementById("notifications-list");

  if (!container) return;

  const notifications = [
    {
      title: "New Message",
      message: "John sent you a message",
      time: "Just now"
    },
    {
      title: "Order Received",
      message: "You have a new order",
      time: "5 min ago"
    }
  ];

  notifications.forEach(notification => {

    const card = document.createElement("div");

    card.className = "notification-card";

    card.innerHTML = `
      <h3>${notification.title}</h3>
      <p>${notification.message}</p>
      <small>${notification.time}</small>
    `;

    container.appendChild(card);

  });

});
