// === src/ai.js ===
const axios = require('axios');
const { OPENROUTER_TOKEN, SERVER_URL, NODE_ENV } = require('./config');

async function fetchAIResponse(message) {
  const headers = {
    Authorization: `Bearer ${OPENROUTER_TOKEN}`,
    'Content-Type': 'application/json',
    'X-Title': 'TelegramBot',
    'HTTP-Referer': NODE_ENV === 'production' ? SERVER_URL : 'http://localhost',
  };

  const body = {
    model: 'mistralai/mistral-7b-instruct',
    messages: [{ role: 'user', content: message }],
  };

  const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', body, { headers });
  return response.data.choices[0].message.content;
}

module.exports = { fetchAIResponse };
