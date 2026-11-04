import 'dotenv/config';
import { callTelegramTransport } from '../server/telegramTransport.js';
const url = new URL('/api/telegram/webhook', process.env.APP_URL);
if (url.protocol !== 'https:' || !process.env.TELEGRAM_WEBHOOK_SECRET) throw new Error('APP_URL must use HTTPS; TELEGRAM_WEBHOOK_SECRET is required');
const result = await callTelegramTransport(process.env.TELEGRAM_BOT_TOKEN, 'setWebhook', {
  url: url.href,
  secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
  allowed_updates: ['message', 'callback_query'],
});
if (!result.ok) throw new Error(result.reason);
console.log('Webhook configured:', url.href);
