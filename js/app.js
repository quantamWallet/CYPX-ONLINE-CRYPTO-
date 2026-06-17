import { app } from './firebase-config.js';

console.log('Firebase initialized');
import { requestNotificationPermission }
from './notifications.js';

requestNotificationPermission();
