import { app } from './firebase-config.js';

import {
  requestNotificationPermission,
  getFCMToken
} from './notifications.js';

console.log('Firebase initialized');
alert('App loaded');

if ('serviceWorker' in navigator) {

  navigator.serviceWorker
    .register('/CYPX-ONLINE-CRYPTO-/firebase-messaging-sw.js')
    .then(async (registration) => {

      console.log(
        'Service Worker Registered',
        registration
      );

      alert('Service Worker Registered');

      try {

  alert('Before permission');

  await requestNotificationPermission();

  alert('Permission completed');

} catch (e) {

  alert('Permission error: ' + e);

}

try {

  alert('Before token');

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

  console.log('FCM token saved');
}
alert('TOKEN START');
alert(token);
alert('TOKEN END');

alert('AFTER TOKEN');

console.log('FCM Token:', token);

alert('FCM Token generated');
  console.log(token);

} catch (e) {

  alert('Token error: ' + e);

}
      console.log('FCM Token:', token);

      alert('FCM Token generated');

    })
    .catch(error => {

      console.error(
        'Service Worker Error',
        error
      );

      alert('Service Worker Error: ' + error);

    });

}
