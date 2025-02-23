import {TelegramEvents} from 'node-telegram-bot-api';

import {ButtonType} from '../enums/button-type.enum';
import {BOT} from '../globals';
import {sendHelpPage} from '../pages/help.page';

export const callbackQueryHandler: TelegramEvents['callback_query'] = query => {
    console.log(query);

    if (query.data === ButtonType.Help) {
        return sendHelpPage(query.from.id);
    }

    if (query.data === ButtonType.Close && query.message) {
        return BOT.deleteMessage(
            query.message.chat.id,
            query.message.message_id
        );
    }
};
