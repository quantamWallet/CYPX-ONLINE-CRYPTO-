import { app } from './firebase-config.js';
import { requestNotificationPermission, getFCMToken, listenForegroundMessages } from './notifications.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

if ('serviceWorker' in navigator) {
  // FIX: Register from root
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then(async () => {
    await requestNotificationPermission();
    listenForegroundMessages(); // FIX: Handle when tab is open

    const token = await getFCMToken();
    const auth = getAuth();
    const db = getDatabase();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await update(ref(db, 'users/' + user.uid), { fcmToken: token });
        console.log("Token saved for:", user.uid);
      }
    });
  })
  .catch(err => console.error("SW Error:", err));
                                                    }
