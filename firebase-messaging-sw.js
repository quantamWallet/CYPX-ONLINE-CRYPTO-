importScripts(
'https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js'
);

importScripts(
'https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js'
);

firebase.initializeApp({
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCW4G9JlVu_xb0bGjlKmsi5mdqXSwvFak",
  authDomain: "quantum-rio.firebaseapp.com",
  databaseURL: "https://quantum-rio-default-rtdb.firebaseio.com",
  projectId: "quantum-rio",
  storageBucket: "quantum-rio.firebasestorage.app",
  messagingSenderId: "805433999377",
  appId: "1:805433999377:web:d0efa8c46ec4a0fa30f1b0",
  measurementId: "G-4RSQXZJX44"
};

const messaging = firebase.messaging();
