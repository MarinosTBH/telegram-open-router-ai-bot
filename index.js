// === index.js ===
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN, SERVER_URL, PORT, NODE_ENV } = require('./src/config');
const { registerBotHandlers } = require('./src/handlers');

if (!TELEGRAM_TOKEN) {
  console.error('❌ TELEGRAM_TOKEN missing in environment.');
  process.exit(1);
}

const useWebhook = NODE_ENV === 'production';
const bot = new TelegramBot(TELEGRAM_TOKEN, useWebhook ? undefined : { polling: true });

if (useWebhook) {
  const app = express();
  app.use(bodyParser.json());

  app.post(`/bot${TELEGRAM_TOKEN}`, async (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  app.listen(PORT, async () => {
    const webhookUrl = `${SERVER_URL}/bot${TELEGRAM_TOKEN}`;
    await bot.setWebHook(webhookUrl);
    console.log(`🚀 Webhook running at ${webhookUrl}`);
  });
} else {
  console.log('🧪 Running in polling mode');
}

registerBotHandlers(bot);
