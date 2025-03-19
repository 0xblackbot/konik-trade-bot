import {RedisSettingsService} from '../../classes/redis-settings.service';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {CallbackDataType} from '../../enums/callback-data-type.enum';
import {BOT} from '../../globals';
import {Settings} from '../../interfaces/settings.interface';
import {formatOutputNumber} from '../../utils/format.utils';
import {saveSettingsPage} from '../../utils/ui-state.utils';
import {CLOSE_BUTTON} from '../buttons/close.button';

export const updateSettingsPage = async (chatId: number) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (uiState.messageIds?.settingsPage) {
        const settings = await RedisSettingsService.getSettings(chatId);

        return BOT.editMessageText(getSettingsPageMessageText(settings), {
            chat_id: chatId,
            message_id: uiState.messageIds?.settingsPage,
            ...getSettingsPageOptions(settings)
        }).catch(() => 0);
    }
};

export const sendSettingsPage = async (chatId: number) => {
    const settings = await RedisSettingsService.getSettings(chatId);

    const newMessage = await BOT.sendMessage(
        chatId,
        getSettingsPageMessageText(settings),
        getSettingsPageOptions(settings)
    );

    await saveSettingsPage(chatId, newMessage);
};

const getSettingsPageMessageText = (settings: Settings) =>
    '<b>Settings:</b>\n' +
    '\n' +
    `<b>Max slippage: ${formatOutputNumber(settings.maxSlippage)}%</b>\n` +
    'Your transaction will revert if the price changes unfavorably by more than this percentage.\n' +
    '\n' +
    'Press the button with the desired action below.';

const getSettingsPageOptions = (settings: Settings) => ({
    parse_mode: 'HTML' as const,
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'Export Seed Phrase',
                    callback_data: CallbackDataType.ExportSeedPhrase
                },
                {
                    text: 'Withdraw TON',
                    callback_data: CallbackDataType.WithdrawTON
                }
            ],
            [
                {
                    text: 'Change Max Slippage',
                    callback_data: CallbackDataType.ChangeMaxSlippage
                }
            ],
            [
                {
                    text: '--- BUTTONS CONFIG ---',
                    callback_data: CallbackDataType.Nothing
                }
            ],
            [
                {
                    text: `Buy: ${formatOutputNumber(settings.buyTop, 0)} TON`,
                    callback_data: CallbackDataType.ChangeBuyTop
                },
                {
                    text: `Sell: ${formatOutputNumber(settings.sellTop, 0)}%`,
                    callback_data: CallbackDataType.ChangeSellTop
                }
            ],
            [
                {
                    text: `Buy: ${formatOutputNumber(settings.buyBottom, 0)} TON`,
                    callback_data: CallbackDataType.ChangeBuyBottom
                },
                {
                    text: `Sell: ${formatOutputNumber(settings.sellBottom, 0)}%`,
                    callback_data: CallbackDataType.ChangeSellBottom
                }
            ],
            [CLOSE_BUTTON]
        ]
    }
});
