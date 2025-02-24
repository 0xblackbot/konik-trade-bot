import {RedisSettingsService} from '../classes/redis-settings.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {BOT} from '../globals';
import {formatOutputNumber} from '../utils/format.utils';

export const sendSettingsPage = async (chatId: number) => {
    const settings = await RedisSettingsService.getSettings(chatId);

    return BOT.sendMessage(
        chatId,
        '<b>Settings:</b>\n' +
            '\n' +
            `<b>Max slippage: ${formatOutputNumber(settings.maxSlippage)}%</b>\n` +
            'Your transaction will revert if the price changes unfavorably by more than this percentage.\n' +
            '\n' +
            'Press the button with the desired action below.',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Export Seed Phrase',
                            callback_data: CallbackDataType.ExportSeedPhrase
                        }
                    ],
                    [
                        {
                            text: 'Change Max Slippage',
                            callback_data: CallbackDataType.ChangeMaxSlippage
                        }
                    ],
                    [{text: 'Close', callback_data: CallbackDataType.Close}]
                ]
            }
        }
    );
};
