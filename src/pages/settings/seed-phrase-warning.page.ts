import {BOT} from '../../globals';
import {CLOSE_BUTTON} from '../buttons/close.button';

export const sendSeepPhraseWarning = async (chatId: number) =>
    BOT.sendMessage(
        chatId,
        '⚠️ <b>Warning!</b> ⚠️\n' +
            '\n' +
            'You are about to reveal your <b>seed phrase</b>.\n' +
            'Anyone who sees it can access your funds!\n' +
            'Keep it safe and private.\n' +
            '\n' +
            'Please reply with /reveal to get your seed phrase.',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[CLOSE_BUTTON]]
            }
        }
    );
