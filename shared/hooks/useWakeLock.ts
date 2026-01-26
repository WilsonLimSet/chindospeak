import { useState, useEffect, useCallback } from 'react';

interface WakeLockState {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
}

export function useWakeLock(): WakeLockState {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const request = useCallback(async () => {
    if (!isSupported) return;

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      setWakeLock(sentinel);

      sentinel.addEventListener('release', () => {
        setWakeLock(null);
      });
    } catch (err) {
      // Wake lock request can fail if:
      // - Document is not visible
      // - Device is low on battery
      // - User denied permission
      console.error('Wake Lock request failed:', err);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
      } catch (err) {
        console.error('Wake Lock release failed:', err);
      }
    }
  }, [wakeLock]);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        // Re-request wake lock when page becomes visible
        await request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock, request]);

  return {
    isSupported,
    isActive: wakeLock !== null,
    request,
    release,
  };
}
