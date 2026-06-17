import { app } from './firebase-config.js';

console.log('Firebase initialized');
import { requestNotificationPermission }
from './notifications.js';

requestNotificationPermission();
import {
  getFCMToken
} from './notifications.js';

getFCMToken();
if ('serviceWorker' in navigator) {

  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then(registration => {
      console.log(
        'Service Worker Registered',
        registration
      );
    });
}
