import { app } from './firebase-config.js';

console.log('Firebase initialized');
import { requestNotificationPermission }
from './notifications.js';

requestNotificationPermission();
import {
  requestNotificationPermission,
  getFCMToken
} from './notifications.js';

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
    .register('/firebase-messaging-sw.js')
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
