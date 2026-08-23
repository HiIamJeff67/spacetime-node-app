self.addEventListener('push', event => {
  const fallback = { title: 'MetroPoint AI', body: '有新的專屬優惠推薦。', data: { url: '/' } }
  let payload = fallback
  try {
    payload = event.data ? { ...fallback, ...event.data.json() } : fallback
  } catch {
    payload = { ...fallback, body: event.data ? event.data.text() : fallback.body }
  }
  const notification = self.registration.showNotification(payload.title, {
    body: payload.body,
    data: payload.data || { url: '/' },
    icon: '/favicon.ico',
  })
  const inAppNotification = clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
    for (const client of windows) client.postMessage({ type: 'push-notification', payload })
  })
  event.waitUntil(Promise.all([notification, inAppNotification]))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
    const existing = windows.find(window => window.url === url)
    return existing ? existing.focus() : clients.openWindow(url)
  }))
})
