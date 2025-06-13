require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Load env vars
const token = process.env.TELEGRAM_TOKEN;
const useWebhook = process.env.USE_WEBHOOK === 'true';
const openrouterToken = process.env.OPENROUTER_TOKEN;
const serverUrl = process.env.SERVER_URL;

if (!token || !openrouterToken) {
  console.error("❌ Missing TELEGRAM_TOKEN or OPENROUTER_TOKEN in .env");
  process.exit(1);
}

// 🧠 Set up Telegram Bot
const bot = new TelegramBot(token, useWebhook ? undefined : { polling: true });

if (useWebhook) {
  // === Webhook Mode ===

  const app = express();
  app.use(bodyParser.json());

  // Handle Telegram updates
  app.post(`/bot${token}`, async (req, res) => {
    const msg = req.body.message;
    if (!msg || !msg.text) return res.sendStatus(200);

    const chatId = msg.chat.id;
    const userMessage = msg.text;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
        model: 'mistralai/mistral-7b-instruct',
          messages: [{ role: 'user', content: userMessage }],
        },
        {
          headers: {
            'Authorization': `Bearer ${openrouterToken}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': serverUrl,
            'X-Title': 'TelegramBot',
          },
        }
      );

      const aiReply = response.data.choices[0].message.content;
      await bot.sendMessage(chatId, aiReply);
    } catch (error) {
      console.error(error?.response?.data || error.message);
      bot.sendMessage(chatId, '❌ AI error. Please try again later.');
    }

    res.sendStatus(200);
  });

  // Start Express server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    const webhookUrl = `${serverUrl}/bot${token}`;
    await bot.setWebHook(webhookUrl);
    console.log(`✅ Webhook set to: ${webhookUrl}`);
  });

} else {
  // === Polling Mode ===
  console.log('🧪 Running in polling mode');

  bot.on('message', async (msg) => {
    if (!msg.text) return;

    const chatId = msg.chat.id;
    const userMessage = msg.text;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
        model: 'mistralai/mistral-7b-instruct',
          messages: [{ role: 'user', content: userMessage }],
        },
        {
          headers: {
            'Authorization': `Bearer ${openrouterToken}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost', // Doesn't matter locally
            'X-Title': 'TelegramBot',
          },
        }
      );

      const aiReply = response.data.choices[0].message.content;
      bot.sendMessage(chatId, aiReply);
    } catch (error) {
      console.error(error?.response?.data || error.message);
      bot.sendMessage(chatId, '❌ AI error. Please try again later.');
    }
  });
}

