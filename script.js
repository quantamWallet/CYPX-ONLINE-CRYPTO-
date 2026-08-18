// 1. Function to update data silently
async function silentUpdate() {
  try {
    // Example: get wallet balance, prices, CYPX price
    const [balanceRes, priceRes] = await Promise.all([
      fetch('/api/wallet', { cache: 'no-store' }),
      fetch('/api/cypx-price', { cache: 'no-store' })
    ]);

    const balance = await balanceRes.json();
    const price = await priceRes.json();

    // 2. Update only the parts of the DOM that changed
    document.getElementById('balance').innerText = balance.amount;
    document.getElementById('cypxPrice').innerText = `$${price.usd}`;

  } catch (err) {
    console.error('Silent update failed:', err);
  }
}

// 3. Run on page load
document.addEventListener('DOMContentLoaded', silentUpdate);

// 4. Run every 20 seconds in background like Binance
setInterval(silentUpdate, 20000);

// 5. Also run when user comes back to the tab
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    silentUpdate();
  }
});
