import {BOT} from '../globals';
import {CLOSE_BUTTON} from './buttons/close.button';
import {getTokenPageLink} from '../utils/links.utils';

export const sendShareTokenPage = (chatId: number, assetAddress: string) =>
    BOT.sendMessage(
        chatId,
        'To share the token send this link (tap to copy):\n' +
            '\n' +
            `<code>${getTokenPageLink(assetAddress)}</code>`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[CLOSE_BUTTON]]
            }
        }
    );
