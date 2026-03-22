// Service Worker - sw.js
// รับ scheduled alarm และแจ้งเตือนแม้ปิดแอป

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// รับข้อความจากแอป
self.addEventListener('message', e => {
  const { type, key, name, time, ms } = e.data || {};

  if (type === 'SET_ALARM') {
    // เก็บ timer id ไว้ใน indexedDB-like via global
    if (self._alarms) clearTimeout(self._alarms[key]);
    if (!self._alarms) self._alarms = {};

    self._alarms[key] = setTimeout(() => {
      self.registration.showNotification('🎤 แจ้งเตือนวิทยากร', {
        body: `ถึงเวลา ${time} — ${name}`,
        icon: '/icon.png',
        badge: '/icon.png',
        tag: key,
        requireInteraction: true,
        vibrate: [500, 200, 500, 200, 500],
        actions: [
          { action: 'ok', title: '✅ รับทราบ' }
        ]
      });
    }, ms);
  }

  if (type === 'CLEAR_ALARM') {
    if (self._alarms && self._alarms[key]) {
      clearTimeout(self._alarms[key]);
      delete self._alarms[key];
    }
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length) clients[0].focus();
      else self.clients.openWindow('/');
    })
  );
});
