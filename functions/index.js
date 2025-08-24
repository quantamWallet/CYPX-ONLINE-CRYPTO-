const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.database();

/**
 * Trigger when a deposit is approved by server
 * Path: deposits/{uid}/{depositId}/status
 */
exports.handleDepositApproval = functions.database
  .ref("/deposits/{uid}/{depositId}/status")
  .onUpdate(async (change, context) => {
    const before = change.before.val();
    const after = change.after.val();

    // Only act when status changes to "approved"
    if (before === "approved" || after !== "approved") {
      return null;
    }

    const { uid, depositId } = context.params;

    // Get deposit details
    const depositSnap = await db.ref(`/deposits/${uid}/${depositId}`).once("value");
    const deposit = depositSnap.val();
    if (!deposit || !deposit.amount) return null;

    const amount = deposit.amount;

    // Get user data
    const userRef = db.ref(`/users/${uid}`);
    const userSnap = await userRef.once("value");
    const userData = userSnap.val();

    if (!userData) return null;

    let updates = {};

    // Update user balance
    const newBalance = (userData.balance || 0) + amount;
    updates[`/users/${uid}/balance`] = newBalance;

    // If first deposit, handle referral reward
    if (!userData.hasDeposited) {
      updates[`/users/${uid}/hasDeposited`] = true;

      if (userData.referrer) {
        const referrerRef = db.ref(`/users/${userData.referrer}`);
        const referrerSnap = await referrerRef.once("value");
        const referrerData = referrerSnap.val();

        if (referrerData) {
          let bonus = 0;
          if (amount >= 50000) {
            bonus = 15500;
          } else {
            bonus = 500;
          }

          const referrerNewBalance = (referrerData.balance || 0) + bonus;
          updates[`/users/${userData.referrer}/balance`] = referrerNewBalance;

          // Log referral bonus
          updates[`/referralBonuses/${userData.referrer}/${depositId}`] = {
            referredUser: uid,
            bonus,
            depositAmount: amount,
            timestamp: admin.database.ServerValue.TIMESTAMP,
          };
        }
      }
    }

    // Apply updates atomically
    await db.ref().update(updates);

    console.log(
      `Deposit processed for user ${uid}. Amount: ${amount}. Balance updated.`
    );

    return null;
  });
