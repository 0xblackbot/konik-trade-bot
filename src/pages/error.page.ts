import {BOT} from '../globals';
import {CLOSE_BUTTON} from './buttons/close.button';

export const sendErrorPage = (chatId: number, text: string) =>
    BOT.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [CLOSE_BUTTON]
        }
    });
