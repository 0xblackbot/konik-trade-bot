import {TelegramEvents} from 'node-telegram-bot-api';

import {BOT} from '../globals';
import {sendHomePage} from '../pages/home.page';
import {sendTokenPage} from '../pages/token.page';

export const messageHandler: TelegramEvents['message'] = async message => {
    try {
        console.log(message);
        if (message.chat.type === 'private') {
            const chatId = message.chat.id;
            const command = message.text?.split(' ')[0];

            if (command === '/start') {
                await sendHomePage(chatId);
            } else if (command?.startsWith('/')) {
                await BOT.sendMessage(
                    chatId,
                    'I do not understand this, yet...\n' + 'Try /start command.'
                );
            } else {
                await sendTokenPage(message);
            }
        }
    } catch (error) {
        console.log('Error while handling message', message, error);
    }
};
