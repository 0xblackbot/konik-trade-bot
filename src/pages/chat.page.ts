import {CallbackDataType} from '../enums/callback-data-type.enum';
import {BOT} from '../globals';

export const sendChatPage = (chatId: number) =>
    BOT.sendMessage(
        chatId,
        'Join the discussion, share bugs and feature requests in our Telegram chat: @konik\\_trade\\_chat',
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Close', callback_data: CallbackDataType.Close}]
                ]
            }
        }
    );
