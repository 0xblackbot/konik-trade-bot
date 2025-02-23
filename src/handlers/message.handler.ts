import {TelegramEvents} from 'node-telegram-bot-api';

import {BOT} from '../globals';
import {sendHomePage} from '../pages/home.page';

export const messageHandler: TelegramEvents['message'] = async message => {
    try {
        console.log(message);
        if (message.chat.type === 'private') {
            const chatId = message.chat.id;
            const text = message.text?.split(' ')[0];

            if (text === '/start') {
                await sendHomePage(chatId);
            } else {
                await BOT.sendMessage(
                    chatId,
                    'I do not understand you, yet...\n' + 'Try /start command.'
                );
            }
        }
    } catch (error) {
        console.log('Error while handling message', message, error);
    }
};
