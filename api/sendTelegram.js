// api/sendTelegram.js
import axios from 'axios';

export default async function handler(req, res) {
  // --- CORS Headers ---
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://fire8327.github.io'

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);

  // --- Обработка запроса ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userReason, userName, userPhone, userEmail, textButton } = req.body;

  // Валидация (минимальная)
  if (!userName || !userPhone) {
    return res.status(400).json({ error: 'Не все поля заполнены' });
  }

  // Получение токенов из переменных окружения
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Не найдены токен или ID чата в переменных окружения.');
    return res.status(500).json({ error: 'Ошибка серверной конфигурации' });
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  let message = `<b>Заявка с сайта.</b>\n`;
  message += `<b>Причина обращения: </b> ${userReason || 'Не указана'}\n`;
  message += `<b>Отправитель: </b> ${userName}\n`;
  message += `<b>Номер телефона: </b> ${userPhone}\n`;
  message += `<b>Email: </b> ${userEmail || 'Не указан'}\n`;
  message += `<b>Кнопка: </b> ${textButton || ''}`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      parse_mode: 'html',
      text: message,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending to Telegram:', error.response?.data || error.message);
    res.status(500).json({ error: 'Ошибка при отправке данных' });
  }
}