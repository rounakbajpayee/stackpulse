import { rewrite } from '@vercel/edge';

export const config = {
  matcher: ['/supabase', '/vercel', '/hasura', '/atlan'],
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  
  // Extract geo headers (provided automatically by Vercel)
  const city = request.headers.get('x-vercel-ip-city') || 'Unknown City';
  const country = request.headers.get('x-vercel-ip-country') || 'Unknown Country';
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'Unknown IP';
  const ua = request.headers.get('user-agent') || 'Unknown Device';

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    const text = 🚨 *StackPulse VIP Visit*\n\n*Path:* \n*Location:* , \n*IP:* \n*Device:* ;
    const telegramUrl = https://api.telegram.org/bot/sendMessage;
    
    try {
      await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        }),
      });
    } catch (err) {
      console.error('Telegram webhook failed', err);
    }
  }
  
  // Rewrite the URL to "/" so the React SPA loads normally
  // The user's URL bar will still display /supabase, keeping the vanity path intact.
  url.pathname = '/';
  return rewrite(url);
}
