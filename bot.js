const token = process.env.TELEGRAM_TOKEN;
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(token, { polling: true });

const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

let lastCallTime = 0;
bot.on('message', async (msg) => {
  const now = Date.now();
  if (now - lastCallTime < 20000) { // 20 seconds cooldown
    bot.sendMessage(msg.chat.id, '⏳ Please wait a few seconds before asking again.');
    return;
  }
  lastCallTime = now;

  const chatId = msg.chat.id;
  const userMessage = msg.text;

  try {
    const response = await axios.post(
      
  'https://openrouter.ai/api/v1/chat/completions'
,{
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
      },
      {
        headers: {
          'Authorization': `Bearer process.env.OPENROUTER_TOKEN`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiReply = response.data.choices[0].message.content;
    bot.sendMessage(chatId, aiReply);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, '❌ Sorry, something went wrong.');
  }
});

