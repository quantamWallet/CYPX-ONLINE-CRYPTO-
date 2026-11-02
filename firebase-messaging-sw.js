// firebase-messaging-sw.js
// Keep this file in the ROOT of your GitHub Pages repository.

// Handle notification clicks
self.addEventListener("notificationclick", function(event) {
    event.notification.close();

    event.waitUntil((async function() {
        const dashboardUrl = "/CYPX-ONLINE-CRYPTO-/dashboard.html";

        const windows = await clients.matchAll({
            type: "window",
            includeUncontrolled: true
        });

        for (const client of windows) {
            if (client.url.includes("/CYPX-ONLINE-CRYPTO-/")) {
                await client.focus();
                return;
            }
        }

        if (clients.openWindow) {
            await clients.openWindow(dashboardUrl);
        }
    })());
});


// Load Firebase SDK versions matching the dashboard
importScripts(
    "https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js"
);


// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyCCW4G9JlVu_xb0bGjlKmsi5mdqXSwvFak",
    authDomain: "quantum-rio.firebaseapp.com",
    databaseURL: "https://quantum-rio-default-rtdb.firebaseio.com",
    projectId: "quantum-rio",
    storageBucket: "quantum-rio.firebasestorage.app",
    messagingSenderId: "805433999377",
    appId: "1:805433999377:web:d0efa8c46ec4a0fa30f1b0",
    measurementId: "G-4RSQXZJX44"
});


// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();


// Receive background notifications
messaging.onBackgroundMessage(function(payload) {

    console.log(
        "[CYPX] Background message received:",
        payload
    );

    const data = payload.data || {};

    const title =
        payload.notification?.title ||
        data.title ||
        "CYPX HOLDINGS";

    const body =
        payload.notification?.body ||
        data.body ||
        "You have a new notification.";

    const options = {
        body: body,
        data: {
            url: "/CYPX-ONLINE-CRYPTO-/dashboard.html"
        },
        tag: data.notificationId || "cypx-notification",
        renotify: false
    };

    return self.registration.showNotification(
        title,
        options
    );
});
