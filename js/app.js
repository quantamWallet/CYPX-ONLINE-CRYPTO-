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

      await requestNotificationPermission();

      const token = await getFCMToken();

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
