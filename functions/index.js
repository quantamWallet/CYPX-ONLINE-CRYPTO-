
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendNotification = functions.https.onCall(async (data, context) => {
    try {
        // Require an authenticated user
        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "You must be logged in."
            );
        }

        // Verify that the caller is an active admin
        const adminSnap = await admin.database()
            .ref("admins/" + context.auth.uid)
            .once("value");

        const adminData = adminSnap.val();

        if (
            !adminData ||
            adminData.status !== "active" ||
            !["admin", "superadmin"].includes(adminData.role)
        ) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Admin access required."
            );
        }

        const { token, title, body, url } = data || {};

        if (!token || !title || !body) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Token, title and body are required."
            );
        }

        // Data values must be strings
        const message = {
            token: token,

            data: {
                title: String(title),
                body: String(body),
                url: String(
                    url || "/CYPX-ONLINE-CRYPTO-/dashboard.html"
                )
            },

            webpush: {
                headers: {
                    Urgency: "high",
                    TTL: "86400"
                }
            }
        };

        const response = await admin.messaging().send(message);

        console.log("FCM notification sent:", response);

        return {
            success: true,
            messageId: response
        };

    } catch (error) {
        console.error("FCM sending error:", error);

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            "internal",
            error.message || "Unable to send notification."
        );
    }
});
