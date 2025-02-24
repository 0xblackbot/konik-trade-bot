import {RedisWalletService} from '../classes/redis-wallet.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {BOT} from '../globals';

export const sendSeepPhraseWarning = async (chatId: number) => {
    const mnemonic = await RedisWalletService.getMnemonic(chatId);

    return BOT.sendMessage(
        chatId,
        'Here is your seed phrase:\n' + '\n' + `<code>${mnemonic}</code>`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Close', callback_data: CallbackDataType.Close}]
                ]
            }
        }
    );
};
