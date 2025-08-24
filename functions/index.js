// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.database();
const inc = admin.database.ServerValue.increment;

exports.applyReferrerBonusOnFirstDeposit = functions.database
  .ref("/deposits/{uid}/{depositId}")
  .onCreate(async (snap, ctx) => {
    try {
      const deposit = snap.val() || {};
      const uid = ctx.params.uid;
      const depositId = ctx.params.depositId;

      const amount = Number(deposit.amount || 0);
      const status = String(deposit.status || "").toLowerCase();

      // Only interested in successful deposits
      if (!amount || status !== "success") {
        // mark processed to avoid future confusion
        await snap.ref.update({ bonusProcessed: false });
        return null;
      }

      // Load user profile
      const userRef = db.ref("users/" + uid);
      const userSnap = await userRef.once("value");
      if (!userSnap.exists()) return null;

      const user = userSnap.val();

      // If user already had a deposit (bonus applied or not), do nothing:
      if (user.hasDeposited === true) {
        // Mark this deposit as processed to avoid reprocessing
        await snap.ref.update({ bonusProcessed: true });
        return null;
      }

      const referrerUID = user.referrer || null;
      if (!referrerUID) {
        // No referrer — just mark user as having deposited
        await userRef.update({ hasDeposited: true });
        await snap.ref.update({ bonusProcessed: true });
        return null;
      }

      // Determine referrer bonus:
      // < 50,000 => 500
      // >= 50,000 => 16,000 (15,500 + 500)
      const referrerBonus = amount >= 50000 ? 16000 : 500;

      // Prepare atomic update
      const updates = {};
      updates[`users/${referrerUID}/balance`] = inc(referrerBonus);
      updates[`users/${uid}/hasDeposited`] = true;
      updates[`deposits/${uid}/${depositId}/bonusProcessed`] = true;
      updates[`bonus_ledger/${referrerUID}/${depositId}`] = {
        fromUser: uid,
        amountDeposited: amount,
        referrerBonus: referrerBonus,
        at: admin.database.ServerValue.TIMESTAMP
      };

      await db.ref().update(updates);
      return null;

    } catch (error) {
      console.error("applyReferrerBonusOnFirstDeposit error:", error);
      return null;
    }
  });
