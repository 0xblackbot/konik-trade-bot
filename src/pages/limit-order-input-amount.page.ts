import {isDefined} from '@rnw-community/shared';

import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
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
                            callback_data: CallbackDataType.LimitBuy + 10
                        },
                        {
                            text: 'Sell 50%',
                            callback_data: CallbackDataType.LimitSell + 50
                        }
                    ],
                    [
                        {
                            text: 'Buy 100 TON',
                            callback_data: CallbackDataType.LimitBuy + 100
                        },
                        {
                            text: 'Sell 100%',
                            callback_data: CallbackDataType.LimitSell + 100
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
                    CLOSE_BUTTON
                ]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
