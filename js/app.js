import { app } from './firebase-config.js';

import {
  requestNotificationPermission,
  getFCMToken
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

  navigator.serviceWorker
    .register('/CYPX-ONLINE-CRYPTO-/firebase-messaging-sw.js')
    .then(async () => {

      try {

        await requestNotificationPermission();

        const token = await getFCMToken();

        const auth = getAuth();
        const db = getDatabase();

        onAuthStateChanged(auth, async (user) => {

          if (!user) {
            return;
          }

          try {

            await update(
              ref(db, 'users/' + user.uid),
              {
                fcmToken: token
              }
            );

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
