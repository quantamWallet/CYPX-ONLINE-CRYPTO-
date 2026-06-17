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

alert('APP.JS RUNNING ON DASHBOARD');

console.log('Firebase initialized');
alert('App loaded');

if ('serviceWorker' in navigator) {

  navigator.serviceWorker
    .register('/CYPX-ONLINE-CRYPTO-/firebase-messaging-sw.js')
    .then(async (registration) => {

      alert('Service Worker Registered');

      try {

        alert('STEP 1');

        await requestNotificationPermission();

        alert('STEP 2');

        const token = await getFCMToken();

        alert('STEP 3');

        alert(token);

        const auth = getAuth();
const db = getDatabase();

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    alert('User still not loaded');
    return;
  }

  alert('UID FOUND');

  await update(
    ref(db, 'users/' + user.uid),
    {
      fcmToken: token
    }
  );

  alert('Token saved to database');

});

      } catch (e) {

        alert('ERROR');

        if (e.message) {
          alert(e.message);
        }

        console.error(e);

      }

    })
    .catch(error => {

      console.error('Service Worker Error', error);

      alert('Service Worker Error: ' + error);

    });

}
