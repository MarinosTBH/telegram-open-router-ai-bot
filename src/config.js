// === src/config.js ===
require('dotenv').config();

module.exports = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  OPENROUTER_TOKEN: process.env.OPENROUTER_TOKEN,
  SERVER_URL: process.env.SERVER_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
};
