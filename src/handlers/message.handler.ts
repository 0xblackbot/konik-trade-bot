import {TelegramEvents} from 'node-telegram-bot-api';

import {CommandEnum} from '../enums/command.enum';
import {BOT} from '../globals';
import {sendChatPage} from '../pages/chat.page';
import {sendHelpPage} from '../pages/help.page';
import {sendHomePage} from '../pages/home.page';
import {sendTokenPage} from '../pages/token.page';

export const messageHandler: TelegramEvents['message'] = async message => {
    console.log('message', message);
    const command = message.text?.split(' ')[0];

    if (command === CommandEnum.Start || command === CommandEnum.Home) {
        return sendHomePage(message.chat.id);
    }

    if (command === CommandEnum.Help) {
        return sendHelpPage(message.chat.id);
    }

    if (command === CommandEnum.Chat) {
        return sendChatPage(message.chat.id);
    }

    if (command?.startsWith('/')) {
        return BOT.sendMessage(
            message.chat.id,
            'I do not understand this, yet...\n' + 'Try /start command.'
        );
    }

    return sendTokenPage(message);
};
