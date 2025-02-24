import {CallbackDataType} from '../enums/callback-data-type.enum';
import {BOT} from '../globals';

export const sendErrorPage = (chatId: number, text: string) =>
    BOT.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{text: 'Close', callback_data: CallbackDataType.Close}]
            ]
        }
    });
