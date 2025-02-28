import {RedisWalletService} from '../classes/redis-wallet.service';
import {BOT} from '../globals';
import {CLOSE_BUTTON} from './buttons/close.button';

export const sendSeepPhraseWarning = async (chatId: number) => {
    const mnemonic = await RedisWalletService.getMnemonic(chatId);

    return BOT.sendMessage(
        chatId,
        'Here is your seed phrase:\n' + '\n' + `<code>${mnemonic}</code>`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [CLOSE_BUTTON]
            }
        }
    );
};
