const apiBaseUrl = process.env.VITE_API_BASE_URL?.trim() || "(missing)";
const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY?.trim() || "(missing)";

console.log(`[build-env] VITE_API_BASE_URL=${apiBaseUrl}`);
console.log(`[build-env] VITE_VAPID_PUBLIC_KEY=${vapidPublicKey}`);
