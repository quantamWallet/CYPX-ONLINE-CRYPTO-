const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.onDepositApproved = functions.database
.ref("/deposits/{uid}/{depositId}")
.onUpdate(async (change, context) => {

    const before = change.before.val();
    const after = change.after.val();

    // Ignore if already processed
    if (after.balanceCredited === true) {
        return null;
    }

    // Only trigger when status changes to approved
    if (
        before.status !== "approved" &&
        after.status === "approved"
    ) {

        const uid = context.params.uid;
        const amount = Number(after.amount || 0);

        const userRef = admin.database().ref("users/" + uid);

        // Credit balance safely
        await userRef.transaction(user => {

            if (!user) return user;

            user.balance = Number(user.balance || 0) + amount;

            return user;

        });

        // Mark this deposit as already credited
        await change.after.ref.update({
            balanceCredited: true
        });

        console.log(
            `Credited ${amount} to ${uid}`
        );
    }

    return null;
});
