const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.approveDeposit = functions.database
.ref("/deposits/{uid}/{depositId}/status")
.onUpdate(async (change, context) => {

    const before = String(change.before.val()).toLowerCase();
    const after = String(change.after.val()).toLowerCase();

    // Only trigger when changing to approved
    if (before === "approved" || after !== "approved") {
        return null;
    }

    const uid = context.params.uid;
    const depositId = context.params.depositId;

    const depositRef = admin.database().ref(
        `deposits/${uid}/${depositId}`
    );

    const userRef = admin.database().ref(
        `users/${uid}`
    );

    const depositSnap = await depositRef.once("value");

    if (!depositSnap.exists()) return null;

    const deposit = depositSnap.val();

    // Prevent duplicate credits
    if (deposit.balanceCredited === true) {
        return null;
    }

    const amount = Number(deposit.amount || 0);

    await userRef.transaction(user => {

        if (!user) return user;

        user.balance = Number(user.balance || 0) + amount;

        return user;

    });

    await depositRef.update({
        balanceCredited: true
    });

    console.log(
        `Credited ${amount} to ${uid}`
    );

    return null;
});
