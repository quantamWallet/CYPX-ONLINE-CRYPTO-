export async function requestNotificationPermission() {

  const permission =
    await Notification.requestPermission();

  if (permission === 'granted') {
    console.log('Permission granted');
  } else {
    console.log('Permission denied');
  }
}
