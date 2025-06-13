// === src/handlers.js ===
const { fetchAIResponse } = require('./ai');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function registerBotHandlers(bot) {
  bot.onText(/^seb\s+(\w+)$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const name = match[1].toLowerCase();

    let response;
    switch (name) {
      case 'fawzi':
        response = '🧿 Yaatek asba ya libi ya masakh';
        break;
      case 'basla':
        response = '🧿 Yaatek asba ya taxist ya mnayek';
        break;
      case 'rod':
        response = '🧿 Yaatek asba ya rottweiler ya kalb';
        break;
      case 'tarek':
        response = '🧿 Yaatek asba ya sarakik ya taiwan';
        break;
      case 'esra':
        response = '🧿 Ya esra ya 97 ya sbo3 l9ay';
        break;
      default:
        response = '🧿 Yaatek asba ala rasek enty weli maak !';
        break;
    }

    await bot.sendMessage(chatId, response);

    if (!['fawzi', 'basla', 'rod', 'tarek'].includes(name)) {
      await sleep(2000);
      await bot.sendMessage(chatId, '💫 Nfdlk maak');
    }
  });

  bot.on('message', async (msg) => {
    if (!msg.text || /^seb\s+\w+$/i.test(msg.text)) return;
    const chatId = msg.chat.id;
    try {
      const aiReply = await fetchAIResponse(msg.text);
      bot.sendMessage(chatId, aiReply);
    } catch (error) {
      console.error(error?.response?.data || error.message);
      bot.sendMessage(chatId, '❌ AI error. Please try again later.');
    }
  });
}

module.exports = { registerBotHandlers };

