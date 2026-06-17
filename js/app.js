import { app } from './firebase-config.js';

import {
  requestNotificationPermission,
  getFCMToken
} from './notifications.js';

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  update
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

console.log('Firebase initialized');
alert('App loaded');

if ('serviceWorker' in navigator) {

  navigator.serviceWorker
    .register('/CYPX-ONLINE-CRYPTO-/firebase-messaging-sw.js')
    .then(async (registration) => {

      alert('Service Worker Registered');

      try {

        await requestNotificationPermission();

        const token = await getFCMToken();

        const auth = getAuth();
        const db = getDatabase();

        if (auth.currentUser) {

          await update(
            ref(db, 'users/' + auth.currentUser.uid),
            {
              fcmToken: token
            }
          );

          alert('Token saved to database');
        }

        alert(token);

      } catch (e) {

        alert('Error: ' + e);

      }

    })
    .catch(error => {

      alert('Service Worker Error: ' + error);

    });

}
