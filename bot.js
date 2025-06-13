require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token);

// Init express app
const app = express();
app.use(bodyParser.json());

// Telegram webhook endpoint
app.post(`/bot${token}`, async (req, res) => {
  const msg = req.body.message;
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // LLM request
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openchat/openchat-7b',
        messages: [{ role: 'user', content: userMessage }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_TOKEN}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://your-domain.com', // required by OpenRouter
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

  res.sendStatus(200);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  // Set webhook (only needs to be done once or when you change the URL)
  const url = `${process.env.SERVER_URL}/bot${token}`;
  await bot.setWebHook(url);
  console.log(`✅ Webhook set to ${url}`);
});

