import {BOT} from '../globals';
import {CLOSE_BUTTON} from './buttons/close.button';

export const sendChatPage = (chatId: number) =>
    BOT.sendMessage(
        chatId,
        'Join the discussion, share bugs and feature requests in our Telegram chat: @konik\\_trade\\_chat',
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [CLOSE_BUTTON]
            }
        }
    );
