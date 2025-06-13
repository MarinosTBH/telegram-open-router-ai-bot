require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

let lastCallTime = 0;
bot.on('message', async (msg) => {
  const now = Date.now();
  if (now - lastCallTime < 5000) { // 5 seconds cooldown
    bot.sendMessage(msg.chat.id, '⏳ Please wait a few seconds before asking again.');
    return;
  }
  lastCallTime = now;

  const chatId = msg.chat.id;
  const userMessage = msg.text;

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
      },
      {
        headers: {
          'Authorization': `Bearer {process.env.OPENROUTER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiReply = response.data.choices[0].message.content;
    bot.sendMessage(chatId, aiReply);
  } catch (error) {
    console.error(error.response.status);
    bot.sendMessage(chatId, '❌ Sorry, something went wrong.');
  }
});

