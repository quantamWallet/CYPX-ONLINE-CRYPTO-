import { app } from './firebase-config.js';

import {
  requestNotificationPermission,
  getFCMToken
} from './notifications.js';

console.log('Firebase initialized');

requestNotificationPermission();

getFCMToken()
  .then(token => {
    console.log('FCM Token:', token);
  })
  .catch(error => {
    console.error('FCM Error:', error);
  });

if ('serviceWorker' in navigator) {

  navigator.serviceWorker
    .register('./firebase-messaging-sw.js')
    .then(registration => {
      console.log(
        'Service Worker Registered',
        registration
      );
    })
    .catch(error => {
      console.error(
        'Service Worker Error',
        error
      );
    });

}
