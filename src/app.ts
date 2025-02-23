import TelegramBot from 'node-telegram-bot-api';

import {TELEGRAM_BOT_API_TOKEN} from './secrets';

const bot = new TelegramBot(TELEGRAM_BOT_API_TOKEN, {polling: true});

bot.on('message', async msg => {
    console.log(msg);
    try {
        if (msg.chat.type === 'private') {
            const chatId = msg.chat.id;
            const text = msg.text?.split(' ')[0];

            if (text === '/start') {
                await bot.sendDice(chatId);
            } else {
                await bot.sendMessage(
                    chatId,
                    'I do not understand you, yet...\n' + 'Try /start command.'
                );
            }
        }
    } catch (error) {
        console.log('Error while processing', msg, error);
    }
});
