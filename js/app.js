// js/app.js

import { app } from './firebase-config.js';
import {
  requestNotificationPermission,
  getFCMToken,
  listenForegroundMessages // new
} from './notifications.js';

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  update
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

console.log('Firebase initialized');

if ('serviceWorker' in navigator) {

  // FIX: Register from root, not subfolder
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then(async (registration) => {
      console.log('SW registered:', registration.scope);

      try {
        await requestNotificationPermission();
        listenForegroundMessages(); // FIX: handle messages when tab is open

        const token = await getFCMToken();

        const auth = getAuth();
        const db = getDatabase();

        onAuthStateChanged(auth, async (user) => {
          if (!user) return;

          try {
            await update(
              ref(db, 'users/' + user.uid),
              { fcmToken: token }
            );
            console.log('FCM Token saved');
          } catch (err) {
            console.error('Database save error', err);
          }
        });

      } catch (e) {
        console.error('FCM Error', e);
      }
    })
    .catch(error => {
      console.error('Service Worker Error', error);
    });
}
