import { app } from './firebase-config.js';

console.log('Firebase initialized');
import { requestNotificationPermission }
from './notifications.js';

requestNotificationPermission();
import {
  getFCMToken
} from './notifications.js';

getFCMToken();
