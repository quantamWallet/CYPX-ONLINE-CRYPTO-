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

  alert('STEP 1');

  await requestNotificationPermission();

  alert('STEP 2');

  const token = await getFCMToken();

  alert('STEP 3');

  alert(token);

  const auth = getAuth();

  alert('STEP 4');

  const db = getDatabase();

  alert('STEP 5');

  if (auth.currentUser) {

    alert('STEP 6');

    await update(
      ref(db, 'users/' + auth.currentUser.uid),
      {
        fcmToken: token
      }
    );

    alert('STEP 7');
  }

} catch (e) {

  alert('ERROR');
  alert(e.message);
  alert(JSON.stringify(e));

      }
