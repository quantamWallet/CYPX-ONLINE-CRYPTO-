const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.database();
const retryable = functions.runWith({ failurePolicy: true });

const DASHBOARD_URL = "/CYPX-ONLINE-CRYPTO-/dashboard.html";

/* =====================================================
   1. EXISTING MANUAL ADMIN NOTIFICATION FUNCTION
   ===================================================== */

exports.sendNotification = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "You must be logged in."
            );
        }

        const adminSnap = await db
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

        const response = await admin.messaging().send({
            token: token,
            data: {
                title: String(title),
                body: String(body),
                url: String(url || DASHBOARD_URL)
            },
            webpush: {
                headers: {
                    Urgency: "high",
                    TTL: "86400"
                }
            }
        });

        console.log("Manual notification sent:", response);

        return {
            success: true,
            messageId: response
        };

    } catch (error) {
        console.error("Manual notification error:", error);

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            "internal",
            error.message || "Unable to send notification."
        );
    }
});


/* =====================================================
   2. AUTOMATIC NOTIFICATION HELPER
   ===================================================== */

function safeKey(value) {
    return String(value).replace(/[.#$/\[\]]/g, "_");
}

async function sendAutomaticNotification({
    uid,
    recordId,
    type,
    status,
    title,
    body
}) {
    const eventId = safeKey(
        type + "_" + recordId + "_" + status
    );

    const eventRef = db.ref(
        "notificationEvents/" + uid + "/" + eventId
    );

    const notificationRef = db.ref(
        "notifications/" + uid + "/" + eventId
    );

    /*
       For approved deposits, verify that the admin page
       has completed the balance credit first.
    */

    if (type === "deposit" && status === "approved") {
        const creditSnap = await db
            .ref("users/" + uid + "/processedDeposits/" + recordId)
            .once("value");

        if (!creditSnap.exists()) {
            throw new Error(
                "Deposit balance credit is not confirmed. Notification postponed."
            );
        }
    }

    /*
       Claim this notification event to reduce duplicate
       processing if Firebase retries the function.
    */

    const now = Date.now();

    const claim = await eventRef.transaction(current => {
        if (current && current.status === "sent") {
            return;
        }

        if (
            current &&
            current.status === "processing" &&
            now - Number(current.processingAt || 0) < 120000
        ) {
            return;
        }

        return {
            status: "processing",
            processingAt: now,
            type: type,
            recordId: String(recordId),
            result: status
        };
    });

    if (!claim.committed) {
        console.log("Notification already being processed:", eventId);
        return;
    }

    try {
        /*
           Save the in-app notification first.
           This remains available even if push delivery fails.
        */

        await notificationRef.set({
            title: title,
            body: body,
            type: type,
            status: status,
            read: false,
            timestamp: admin.database.ServerValue.TIMESTAMP,
            url: DASHBOARD_URL,
            referenceId: String(recordId)
        });

        /*
           Get the investor's saved FCM token.
        */

        const tokenSnap = await db
            .ref("users/" + uid + "/fcmToken")
            .once("value");

        const token = tokenSnap.val();

        if (token) {
            await admin.messaging().send({
                token: String(token),
                data: {
                    title: String(title),
                    body: String(body),
                    url: DASHBOARD_URL,
                    type: String(type),
                    status: String(status),
                    eventId: eventId
                },
                webpush: {
                    headers: {
                        Urgency: "high",
                        TTL: "86400"
                    }
                }
            });

            console.log("Automatic push sent:", eventId);
        } else {
            console.log(
                "In-app notification saved; no FCM token for:",
                uid
            );
        }

        await eventRef.update({
            status: "sent",
            completedAt: admin.database.ServerValue.TIMESTAMP
        });

    } catch (error) {
        await eventRef.update({
            status: "failed",
            error: String(error.message || error),
            failedAt: admin.database.ServerValue.TIMESTAMP
        });

        throw error;
    }
}


/* =====================================================
   3. AUTOMATIC DEPOSIT APPROVAL / REJECTION
   ===================================================== */

exports.depositStatusNotification = retryable.database
    .ref("/deposits/{uid}/{depositId}")
    .onUpdate(async (change, context) => {

        const before = change.before.val() || {};
        const after = change.after.val() || {};

        const oldStatus = String(before.status || "").toLowerCase();
        const newStatus = String(after.status || "").toLowerCase();

        if (
            oldStatus !== "pending" ||
            !["approved", "rejected"].includes(newStatus)
        ) {
            return null;
        }

        const uid = context.params.uid;
        const depositId = context.params.depositId;

        const amount = Number(
            after.amount ||
            after.depositAmount ||
            after.price ||
            0
        );

        const formattedAmount = amount.toLocaleString("en-KE");

        let title;
        let body;

        if (newStatus === "approved") {
            title = "Deposit Approved";
            body =
                "Your deposit of KSH " +
                formattedAmount +
                " has been approved and credited to your account.";
        } else {
            title = "Deposit Rejected";
            body =
                "Your deposit of KSH " +
                formattedAmount +
                " has been rejected. Please check your deposit details.";
        }

        await sendAutomaticNotification({
            uid: uid,
            recordId: depositId,
            type: "deposit",
            status: newStatus,
            title: title,
            body: body
        });

        return null;
    });


/* =====================================================
   4. AUTOMATIC WITHDRAWAL APPROVAL / REJECTION
   ===================================================== */

exports.withdrawalStatusNotification = retryable.database
    .ref("/withdrawals/{uid}/{requestId}")
    .onUpdate(async (change, context) => {

        const before = change.before.val() || {};
        const after = change.after.val() || {};

        const oldStatus = String(before.status || "").toLowerCase();
        const newStatus = String(after.status || "").toLowerCase();

        if (
            oldStatus !== "pending" ||
            !["approved", "rejected"].includes(newStatus)
        ) {
            return null;
        }

        const uid = context.params.uid;
        const requestId = context.params.requestId;

        const amount = Number(after.amount || 0);
        const formattedAmount = amount.toLocaleString("en-KE");

        let title;
        let body;

        if (newStatus === "approved") {
            title = "Withdrawal Approved";
            body =
                "Your withdrawal request of KSH " +
                formattedAmount +
                " has been approved.";
        } else {
            title = "Withdrawal Rejected";
            body =
                "Your withdrawal request of KSH " +
                formattedAmount +
                " has been rejected.";
        }

        await sendAutomaticNotification({
            uid: uid,
            recordId: requestId,
            type: "withdrawal",
            status: newStatus,
            title: title,
            body: body
        });

        return null;
    });
