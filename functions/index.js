const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Your FCM Server Key from Project Settings > Cloud Messaging
const SERVER_KEY = "PASTE_YOUR_SERVER_KEY_HERE"; 

exports.sendNotification = functions.https.onCall(async (data, context) => {
  const { token, title, body, url } = data;
  
  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing token');
  }

  const message = {
    to: token,
    notification: {
      title: title,
      body: body,
    },
    data: {
      url: url,
    },
    webpush: {
      fcm_options: {
        link: url,
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (error) {
    console.error("Error sending message:", error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
