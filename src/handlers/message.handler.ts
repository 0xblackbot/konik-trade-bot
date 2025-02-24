import {TelegramEvents} from 'node-telegram-bot-api';

import {CommandEnum} from '../enums/command.enum';
import {BOT} from '../globals';
import {sendChatPage} from '../pages/chat.page';
import {sendHelpPage} from '../pages/help.page';
import {sendHomePage} from '../pages/home.page';
import {sendTokenPage} from '../pages/token.page';

export const messageHandler: TelegramEvents['message'] = async message => {
    try {
        console.log(message);
        if (message.chat.type === 'private') {
            const chatId = message.chat.id;
            const command = message.text?.split(' ')[0];

            if (command === CommandEnum.Start || command === CommandEnum.Home) {
                return sendHomePage(chatId);
            }

            if (command === CommandEnum.Help) {
                return sendHelpPage(chatId);
            }

            if (command === CommandEnum.Chat) {
                return sendChatPage(chatId);
            }

            if (command?.startsWith('/')) {
                return BOT.sendMessage(
                    chatId,
                    'I do not understand this, yet...\n' + 'Try /start command.'
                );
            }

            return sendTokenPage(message);
        }
    } catch (error) {
        console.log('Error while handling message', message, error);
    }
};
