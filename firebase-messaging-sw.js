importScripts(
'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js'
);

importScripts(
'https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey:
  "AIzaSyCCW4G9JlVu_xb0bGjlKmsi5mdqXSwvFak",

  authDomain:
  "quantum-rio.firebaseapp.com",

  databaseURL:
  "https://quantum-rio-default-rtdb.firebaseio.com",

  projectId:
  "quantum-rio",

  storageBucket:
  "quantum-rio.firebasestorage.app",

  messagingSenderId:
  "805433999377",

  appId:
  "1:805433999377:web:d0efa8c46ec4a0fa30f1b0"
});

const messaging =
firebase.messaging();

messaging.onBackgroundMessage(
(payload) => {

self.registration.showNotification(
payload.notification.title,
{
body:
payload.notification.body,

icon:
"cypx_icon_192x192.png",

badge:
"cypx_icon_192x192.png"
}
);
});
