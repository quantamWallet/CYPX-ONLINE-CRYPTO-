const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.database();

/* =====================================================
   1. MANUAL ADMIN NOTIFICATION
   Keeps your existing admin notification page working.
===================================================== */

exports.sendNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be logged in."
        );
    }

    try {
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

        const messageId = await admin.messaging().send({
            token: String(token),
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
        });

        return {
            success: true,
            messageId: messageId
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

   Creates an in-app notification and sends an FCM push.
   Uses a fixed event ID to prevent duplicate records.
===================================================== */

async function sendAutomaticNotification({
    uid,
    recordId,
    type,
    status,
    title,
    body,
    url
}) {
    if (!uid || !recordId) {
        throw new Error("Missing user ID or transaction ID.");
    }

    const eventId = `${type}_${recordId}_${status}`;

    const eventRef = db.ref(
        `notificationEvents/${uid}/${eventId}`
    );

    const notificationRef = db.ref(
        `notifications/${uid}/${eventId}`
    );

    // Claim this event. A stale processing claim can be recovered.
    const claim = await eventRef.transaction(current => {
        if (current && current.status === "sent") {
            return;
        }

        const now = Date.now();

        if (
            current &&
            current.status === "processing" &&
            current.startedAt &&
            now - current.startedAt < 120000
        ) {
            return;
        }

        return {
            status: "processing",
            startedAt: now,
            type: type,
            recordId: recordId,
            transactionStatus: status
        };
    });

    if (!claim.committed) {
        const latest = (await eventRef.once("value")).val();

        if (latest && latest.status === "sent") {
            return;
        }

        // Throwing allows the configured background trigger to retry.
        throw new Error("Notification event is already processing.");
    }

    try {
        // Save the in-app notification at a predictable path.
        await notificationRef.set({
            title: title,
            body: body,
            type: type,
            status: status,
            read: false,
            timestamp: admin.database.ServerValue.TIMESTAMP,
            url: url,
            referenceId: recordId
        });

        // Look up the user's registered FCM token.
        const userSnap = await db
            .ref(`users/${uid}`)
            .once("value");

        const userData = userSnap.val() || {};
        const token = userData.fcmToken;

        if (token) {
            try {
                await admin.messaging().send({
                    token: String(token),
                    data: {
                        title: String(title),
                        body: String(body),
                        url: String(url)
                    },
                    webpush: {
                        headers: {
                            Urgency: "high",
                            TTL: "86400"
                        }
                    }
                });

            } catch (pushError) {
                const errorCode = pushError.code || "";

                // Remove a token only when FCM says it is invalid.
                if (
                    errorCode === "messaging/registration-token-not-registered" ||
                    errorCode === "messaging/invalid-registration-token"
                ) {
                    await db.ref(`users/${uid}/fcmToken`).remove();

                    console.warn(
                        "Removed invalid FCM token for user:",
                        uid
                    );
                } else {
                    // Other failures can be temporary. Retry the event.
                    throw pushError;
                }
            }
        } else {
            console.log(
                "No FCM token for user. In-app notification was saved:",
                uid
            );
        }

        await eventRef.update({
            status: "sent",
            completedAt: admin.database.ServerValue.TIMESTAMP
        });

        console.log(
            "Automatic notification completed:",
            eventId
        );

    } catch (error) {
        console.error(
            "Automatic notification failed:",
            eventId,
            error
        );

        // Release the claim so a retry can process the event again.
        await eventRef.update({
            status: "failed",
            failedAt: admin.database.ServerValue.TIMESTAMP,
            error: String(error.message || error).slice(0, 500)
        }).catch(releaseError => {
            console.error("Could not release notification claim:", releaseError);
        });

        throw error;
    }
}


/* =====================================================
   3. AUTOMATIC DEPOSIT STATUS NOTIFICATIONS

   Watches:
   deposits/{uid}/{depositId}

   Only sends when status changes:
   pending -> approved
   pending -> rejected

   For approvals, confirms the balance-credit marker
   created by admin-deposit.html before notifying.
===================================================== */

exports.depositStatusNotification = functions
    .runWith({
        failurePolicy: true
    })
    .database
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

        // Never announce an approval until the deposit credit marker exists.
        if (newStatus === "approved") {
            const creditSnap = await db
                .ref(`users/${uid}/processedDeposits/${depositId}`)
                .once("value");

            if (!creditSnap.exists()) {
                throw new Error(
                    `Deposit ${depositId} is approved but its balance-credit marker is missing.`
                );
            }
        }

        const amount = Number(
            after.amount ||
            after.depositAmount ||
            after.price ||
            0
        );

        const amountText = Number.isFinite(amount)
            ? amount.toLocaleString("en-US")
            : "your";

        let title;
        let body;

        if (newStatus === "approved") {
            title = "Deposit Approved";
            body = `Your deposit of KSh ${amountText} has been approved and credited to your account.`;
        } else {
            title = "Deposit Rejected";
            body = `Your deposit request of KSh ${amountText} has been rejected. Please contact support if you need assistance.`;
        }

        return sendAutomaticNotification({
            uid: uid,
            recordId: depositId,
            type: "deposit",
            status: newStatus,
            title: title,
            body: body,
            url: "/CYPX-ONLINE-CRYPTO-/dashboard.html"
        });
    });


/* =====================================================
   4. AUTOMATIC WITHDRAWAL STATUS NOTIFICATIONS

   Watches:
   withdrawals/{uid}/{requestId}

   Only sends when status changes:
   pending -> approved
   pending -> rejected

   This function does not change balances or withdrawals.
===================================================== */

exports.withdrawalStatusNotification = functions
    .runWith({
        failurePolicy: true
    })
    .database
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

        const amount = Number(
            after.amount ||
            after.withdrawAmount ||
            after.price ||
            0
        );

        const amountText = Number.isFinite(amount)
            ? amount.toLocaleString("en-US")
            : "your";

        let title;
        let body;

        if (newStatus === "approved") {
            title = "Withdrawal Approved";
            body = `Your withdrawal request of KSh ${amountText} has been approved.`;
        } else {
            title = "Withdrawal Rejected";
            body = `Your withdrawal request of KSh ${amountText} has been rejected. Please contact support if you need assistance.`;
        }

        return sendAutomaticNotification({
            uid: uid,
            recordId: requestId,
            type: "withdrawal",
            status: newStatus,
            title: title,
            body: body,
            url: "/CYPX-ONLINE-CRYPTO-/dashboard.html"
        });
    });
