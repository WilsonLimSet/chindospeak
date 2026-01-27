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

export function notifyDueCards(dueCount: number, streakDays?: number): void {
  if (dueCount <= 0 && (!streakDays || streakDays <= 0)) return;

  let title = '';
  let body = '';

  if (streakDays && streakDays > 0) {
    title = `🔥 ${streakDays} day streak!`;

    if (dueCount > 0) {
      body = dueCount === 1
        ? `Keep it going - you have 1 card to review`
        : `Keep it going - you have ${dueCount} cards to review`;
    } else {
      body = `Great job! Come back tomorrow to keep your streak`;
    }
  } else {
    title = 'Cards Ready for Review';
    body = dueCount === 1
      ? 'You have 1 card ready for review!'
      : `You have ${dueCount} cards ready for review!`;
  }

  showLocalNotification(title, body, {
    tag: 'daily-reminder'
  });
}

export function notifyStreakReminder(currentStreak: number, dueCount?: number): void {
  let title = '';
  let body = '';

  if (currentStreak > 0) {
    title = `🔥 ${currentStreak} day streak!`;

    if (dueCount && dueCount > 0) {
      body = `Don't break your streak! ${dueCount} cards waiting for you`;
    } else {
      body = `Keep it going - review some cards today!`;
    }
  } else {
    title = 'Start a new streak today!';
    body = dueCount && dueCount > 0
      ? `${dueCount} cards ready to review`
      : 'Practice makes perfect - review some cards!';
  }

  showLocalNotification(title, body, {
    tag: 'streak-reminder'
  });
}

export function notifyStreakAchievement(streakDays: number): void {
  if (streakDays <= 0) return;

  // Only notify on milestone streaks
  const milestones = [3, 7, 14, 21, 30, 50, 100, 365];
  if (!milestones.includes(streakDays)) return;

  const title = `🎉 ${streakDays} day streak!`;
  const body = streakDays >= 30
    ? `Incredible dedication! You're on fire!`
    : `Amazing! Keep the momentum going!`;

  showLocalNotification(title, body, {
    tag: 'streak-achievement'
  });
}
