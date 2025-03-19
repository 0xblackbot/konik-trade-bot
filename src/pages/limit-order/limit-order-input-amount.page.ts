import {isDefined} from '@rnw-community/shared';

import {RedisSettingsService} from '../../classes/redis-settings.service';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {CallbackDataType} from '../../enums/callback-data-type.enum';
import {BOT} from '../../globals';
import {formatOutputNumber} from '../../utils/format.utils';
import {saveLastPage} from '../../utils/ui-state.utils';
import {send404Page} from '../404.page';
import {CLOSE_BUTTON} from '../buttons/close.button';

export const sendLimitOrderInputAmountPage = async (chatId: number) => {
    const uiState = await RedisUiStateService.getUiState(chatId);
    const settings = await RedisSettingsService.getSettings(chatId);

    if (!isDefined(uiState.selectedToken)) {
        return send404Page(chatId);
    }

    /** update ui state */
    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        limitOrder: undefined
    });

    const newMessage = await BOT.sendMessage(
        chatId,
        'Enter the amount of tokens to <b>Buy</b> or <b>Sell</b> with a <b>Limit Order</b>',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `Buy ${formatOutputNumber(settings.buyTop, 0)} TON`,
                            callback_data:
                                CallbackDataType.LimitBuy + settings.buyTop
                        },
                        {
                            text: `Sell ${formatOutputNumber(settings.sellTop, 0)}%`,
                            callback_data:
                                CallbackDataType.LimitSell + settings.sellTop
                        }
                    ],
                    [
                        {
                            text: `Buy ${formatOutputNumber(settings.buyBottom, 0)} TON`,
                            callback_data:
                                CallbackDataType.LimitBuy + settings.buyBottom
                        },
                        {
                            text: `Sell ${formatOutputNumber(settings.sellBottom, 0)}%`,
                            callback_data:
                                CallbackDataType.LimitSell + settings.sellBottom
                        }
                    ],
                    [
                        {
                            text: 'Buy X TON',
                            callback_data: CallbackDataType.LimitBuy + 'X'
                        },
                        {
                            text: 'Sell X %',
                            callback_data: CallbackDataType.LimitSell + 'X'
                        }
                    ],
                    [CLOSE_BUTTON]
                ]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
