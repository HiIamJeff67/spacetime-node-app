const SESSION_USER_ID_KEY = 'spacetime.demo.user_id_hash'

function getSessionUserIdHash() {
  try {
    const existing = window.sessionStorage.getItem(SESSION_USER_ID_KEY)
    if (existing) return existing
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    const generated = `sha256:${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`
    window.sessionStorage.setItem(SESSION_USER_ID_KEY, generated)
    return generated
  } catch {
    // ponytail: keep the seeded fallback for restricted browser storage; add auth when login exists.
    return 'sha256:' + 'a'.repeat(64)
  }
}

export const DEMO_USER_ID_HASH = getSessionUserIdHash()
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export type UserProfile = {
  user_id: string
  user_id_hash: string
  display_name: string
  created_at: string
  updated_at: string
  favorite_station_ids: string[]
  preferred_categories: string[]
  budget_min_points: number
  budget_max_points: number
  timezone: string
  notifications_enabled: boolean
  notification_start_local?: string
  notification_end_local?: string
}

export type UserPreferencesUpdate = {
  favorite_station_ids: string[]
  preferred_categories: string[]
  budget_min_points: number
  budget_max_points: number
  timezone: string
  notifications_enabled: boolean
  notification_start_local: string
  notification_end_local: string
}

export type Recommendation = {
  recommendation_id: string
  journey_id: string
  offer_id: string
  title: string
  body: string
  reasons: string[]
  copy_source: string
  decision_latency_ms: number
  candidates: RecommendationCandidate[]
  offers?: RecommendedOffer[]
}

export type RecommendationCandidate = {
  offer_id: string
  vector_score: number
  rule_score: number
  eligible: boolean
  reasons: string[]
}

export type RecommendedOffer = {
  offer_id: string
  title: string
  body: string
  reasons: string[]
  score: number
  points_cost: number
  station_id: string
}

export type Redemption = {
  redemption_id: string
  journey_id: string
  offer_id: string
  status: 'REDEMPTION_STATUS_UNSPECIFIED' | 'REDEMPTION_STATUS_PENDING' | 'REDEMPTION_STATUS_SUCCEEDED' | 'REDEMPTION_STATUS_REJECTED' | 'REDEMPTION_STATUS_VERIFIED'
  points_cost: number
  merchant_verification_code?: string
}

export type NotificationSubscription = {
  subscription_id: string
  active: boolean
  channel: string
}

export type BrowserPushSubscription = {
  endpoint: string
  p256dh: string
  auth: string
}

export type BeaconObservation = {
  uuid: string
  major: number
  minor: number
  power: number
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function base64UrlToBytes(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const normalized = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const decoded = window.atob(normalized)
  return Uint8Array.from(decoded, character => character.charCodeAt(0))
}

export async function registerBrowserPushSubscription(): Promise<BrowserPushSubscription | null> {
  if (!VAPID_PUBLIC_KEY || !('serviceWorker' in navigator) || !('PushManager' in window)) return null
  const registration = await navigator.serviceWorker.register('/sw.js')
  const subscription = await registration.pushManager.getSubscription()
    || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY),
    })
  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error('瀏覽器未提供完整 Web Push subscription')
  }
  return { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }
}

export async function unregisterBrowserPushSubscription() {
  if (!('serviceWorker' in navigator)) return
  const registration = await navigator.serviceWorker.getRegistration('/sw.js')
  const subscription = await registration?.pushManager.getSubscription()
  if (subscription) await subscription.unsubscribe()
}

const REDEMPTION_STATUS_BY_NUMBER: Record<number, Redemption['status']> = {
  0: 'REDEMPTION_STATUS_UNSPECIFIED',
  1: 'REDEMPTION_STATUS_PENDING',
  2: 'REDEMPTION_STATUS_SUCCEEDED',
  3: 'REDEMPTION_STATUS_REJECTED',
  4: 'REDEMPTION_STATUS_VERIFIED',
}

function normalizeRedemption(redemption: Redemption & { status: Redemption['status'] | number }): Redemption {
  return {
    ...redemption,
    status: typeof redemption.status === 'number'
      ? REDEMPTION_STATUS_BY_NUMBER[redemption.status] || 'REDEMPTION_STATUS_UNSPECIFIED'
      : redemption.status,
  }
}

type APIErrorPayload = { message?: string; reason?: string }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`
    try {
      const payload = (await response.json()) as APIErrorPayload
      detail = payload.message || payload.reason || detail
    } catch {
      // Keep the HTTP status when the backend returns an empty/non-JSON error.
    }
    throw new Error(detail)
  }
  return (await response.json()) as T
}

export function getUserProfile(userIdHash = DEMO_USER_ID_HASH) {
  return request<{ profile: UserProfile }>(`/v1/users/me?user_id_hash=${encodeURIComponent(userIdHash)}`)
}

export function updateUserPreferences(preferences: UserPreferencesUpdate, userIdHash = DEMO_USER_ID_HASH) {
  return request<{ profile: UserProfile }>('/v1/users/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify({ user_id_hash: userIdHash, ...preferences }),
  })
}

export function createEntryEvent(stationId: string, userIdHash = DEMO_USER_ID_HASH, traceId: string = crypto.randomUUID()) {
  return request<{ journey_id: string }>('/v1/entry-events', {
    method: 'POST',
    body: JSON.stringify({
      user_id_hash: userIdHash,
      station_id: stationId,
      request_context: { trace_id: traceId },
    }),
  })
}

export function createBeaconEntryEvent(beacon: BeaconObservation, userIdHash = DEMO_USER_ID_HASH, traceId: string = crypto.randomUUID()) {
  return request<{ journey_id: string }>('/v1/entry-events', {
    method: 'POST',
    body: JSON.stringify({
      user_id_hash: userIdHash,
      beacon,
      request_context: { trace_id: traceId },
    }),
  })
}

export function getLatestRecommendation(journeyId: string) {
  return request<Recommendation>(`/v1/recommendations/latest?journey_id=${encodeURIComponent(journeyId)}`)
}

export function createRedemption(
  offerId: string,
  journeyId: string,
  idempotencyKey: string,
  userIdHash = DEMO_USER_ID_HASH,
  traceId: string = crypto.randomUUID(),
) {
  return request<{ redemption: Redemption & { status: Redemption['status'] | number } }>('/v1/redemptions', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      user_id_hash: userIdHash,
      offer_id: offerId,
      idempotency_key: idempotencyKey,
      request_context: { journey_id: journeyId, trace_id: traceId },
    }),
  }).then(result => ({ redemption: normalizeRedemption(result.redemption) }))
}

export function recordRecommendationEvent(input: {
  eventType: 'recommendation.impressed.v1' | 'recommendation.clicked.v1' | 'recommendation.dismissed.v1'
  recommendationId: string
  journeyId: string
  offerId: string
  traceId: string
  userIdHash?: string
}) {
  return request<{ event_id: string }>('/v1/recommendation-events', {
    method: 'POST',
    body: JSON.stringify({
      user_id_hash: input.userIdHash || DEMO_USER_ID_HASH,
      recommendation_id: input.recommendationId,
      offer_id: input.offerId,
      event_type: input.eventType,
      surface: 'web',
      request_context: { journey_id: input.journeyId, trace_id: input.traceId },
    }),
  })
}

export function getRedemption(redemptionId: string) {
  return request<{ redemption: Redemption & { status: Redemption['status'] | number } }>(`/v1/redemptions/${encodeURIComponent(redemptionId)}`)
    .then(result => ({ redemption: normalizeRedemption(result.redemption) }))
}

export function registerNotificationSubscription(subscription: {
  endpoint: string
  p256dh: string
  auth: string
  user_agent?: string
}, userIdHash = DEMO_USER_ID_HASH) {
  return request<NotificationSubscription>('/v1/notification-subscriptions', {
    method: 'POST',
    body: JSON.stringify({ user_id_hash: userIdHash, ...subscription }),
  })
}

export function revokeNotificationSubscription(subscriptionId: string, userIdHash = DEMO_USER_ID_HASH) {
  return request<NotificationSubscription>(
    `/v1/notification-subscriptions/${encodeURIComponent(subscriptionId)}?user_id_hash=${encodeURIComponent(userIdHash)}`,
    { method: 'DELETE' },
  )
}
