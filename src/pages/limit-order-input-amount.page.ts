import {isDefined} from '@rnw-community/shared';

import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {OrderType} from '../enums/order-type.enum';
import {BOT} from '../globals';
import {send404Page} from './404.page';
import {saveLastPage} from '../utils/ui-state.utils';
import {CLOSE_BUTTON} from './buttons/close.button';

export const sendLimitOrderInputAmountPage = async (chatId: number) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (!isDefined(uiState.selectedToken)) {
        return send404Page(chatId);
    }

    /** update ui state */
    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        selectedToken: {
            ...uiState.selectedToken,
            orderType: OrderType.Limit
        },
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
                            text: 'Buy 10 TON',
                            callback_data: CallbackDataType.Buy_10
                        },
                        {
                            text: 'Sell 50%',
                            callback_data: CallbackDataType.Sell_50
                        }
                    ],
                    [
                        {
                            text: 'Buy 100 TON',
                            callback_data: CallbackDataType.Buy_100
                        },
                        {
                            text: 'Sell 100%',
                            callback_data: CallbackDataType.Sell_100
                        }
                    ],
                    [
                        {
                            text: 'Buy X TON',
                            callback_data: CallbackDataType.Buy_X
                        },
                        {
                            text: 'Sell X %',
                            callback_data: CallbackDataType.Sell_X
                        }
                    ],
                    CLOSE_BUTTON
                ]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
