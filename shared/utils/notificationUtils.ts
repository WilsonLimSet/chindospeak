// Local notification utilities for PWA

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null;
  return Notification.permission;
}

export function showLocalNotification(title: string, body: string, options?: NotificationOptions): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    ...options
  });
}

export function notifyDueCards(dueCount: number): void {
  if (dueCount <= 0) return;

  const title = 'Cards Ready for Review';
  const body = dueCount === 1
    ? 'You have 1 card ready for review!'
    : `You have ${dueCount} cards ready for review!`;

  showLocalNotification(title, body, {
    tag: 'due-cards' // Prevents duplicate notifications
  });
}

export function notifyStreakReminder(currentStreak: number): void {
  if (currentStreak <= 0) return;

  const title = 'Keep Your Streak Alive!';
  const body = `Don't break your ${currentStreak}-day streak! Review some cards today.`;

  showLocalNotification(title, body, {
    tag: 'streak-reminder'
  });
}
