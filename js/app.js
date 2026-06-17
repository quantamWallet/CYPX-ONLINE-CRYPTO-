import { app } from './firebase-config.js';

import {
  requestNotificationPermission,
  getFCMToken
} from './notifications.js';

console.log('Firebase initialized');
alert('App loaded');
requestNotificationPermission();

getFCMToken()
  .then(token => {
    console.log('FCM Token:', token);
  })
  alert('FCM Token generated');
  .catch(error => {
    console.error('FCM Error:', error);
  });

if ('serviceWorker' in navigator) {

  navigator.serviceWorker
    .register('/CYPX-ONLINE-CRYPTO-/firebase-messaging-sw.js')
    .then(registration => {
      console.log(
        'Service Worker Registered',
        registration
        alert('Service Worker Registered');
      );
    })
    .catch(error => {
      console.error(
        'Service Worker Error',
        error
      );
    });

}
