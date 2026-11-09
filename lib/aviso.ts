// Aviso opcional no Telegram (só se TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID existirem no .env).
export async function avisar(texto: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN,
    chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: texto }),
    });
  } catch (e) {
    console.error('telegram:', e);
  }
}
