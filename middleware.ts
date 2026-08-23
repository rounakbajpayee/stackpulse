import { rewrite } from '@vercel/edge';

export const config = {
  matcher: ['/', '/supabase', '/vercel', '/hasura', '/atlan'],
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);

  // Extract Vercel's built-in geo and device headers
  const city    = decodeURIComponent(request.headers.get('x-vercel-ip-city')    || 'Unknown');
  const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
  const ip      = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'Unknown';
  const ua      = request.headers.get('user-agent') || 'Unknown';
  const path    = url.pathname;

  const botToken  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId    = process.env.TELEGRAM_CHAT_ID;
  const logApiUrl = process.env.VISIT_LOG_API_URL; // VPS endpoint

  const visitPayload = {
    domain: 'stackpulse.rounakbajpayee.com',
    path,
    full_url: `https://stackpulse.rounakbajpayee.com${path}`,
    ip,
    city,
    country,
    ua,
    timestamp: new Date().toISOString(),
  };

  const promises: Promise<any>[] = [];
  const ignoredIps = (process.env.IGNORE_IPS || '49.37.111.166').split(',').map((s) => s.trim());
  const isIgnored = ignoredIps.includes(ip);

  // 1. Fire Telegram alert (skip for your own IP)
  if (botToken && chatId && !isIgnored) {
    const text =
      `🚨 *StackPulse Visit*\n\n` +
      `*Path:* \`${path}\`\n` +
      `*Location:* ${city}, ${country}\n` +
      `*IP:* \`${ip}\`\n` +
      `*Device:* ${ua.substring(0, 120)}`;

    promises.push(
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      }).catch(console.error)
    );
  }

  // 2. Log to VPS for the dashboard
  if (logApiUrl) {
    promises.push(
      fetch(logApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitPayload),
      }).catch(console.error)
    );
  }

  await Promise.all(promises);

  // Rewrite to "/" — URL bar still shows /supabase etc.
  url.pathname = '/';
  return rewrite(url);
}
