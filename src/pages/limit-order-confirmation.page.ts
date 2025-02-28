import {isDefined} from '@rnw-community/shared';

import {send404Page} from './404.page';
import {BOT} from '../globals';
import {getLimitOrderText} from './limit-order.page';
import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {LimitOrder} from '../orders/interfaces/limit-order.interface';
import {saveLastPage} from '../utils/ui-state.utils';

export const sendLimitOrderConfirmationPage = async (
    chatId: number,
    targetOutputAssetAmount: number,
    targetPrice: number
) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (
        !isDefined(uiState.selectedToken?.data) ||
        !isDefined(uiState.limitOrder?.side) ||
        !isDefined(uiState.limitOrder?.inputAssetAmount)
    ) {
        return send404Page(chatId);
    }

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        limitOrder: {
            ...uiState.limitOrder,
            targetOutputAssetAmount,
            targetPrice
        }
    });

    const orderRequest: LimitOrder = {
        id: 0,
        chatId,
        side: uiState.limitOrder.side,
        asset: uiState.selectedToken.data,
        inputAssetAmount: uiState.limitOrder.inputAssetAmount,
        targetOutputAssetAmount,
        targetPrice
    };

    const text = getLimitOrderText(orderRequest);

    const newMessage = await BOT.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '❌ Cancel',
                        callback_data: CallbackDataType.CreateLimitOrderCancel
                    },
                    {
                        text: '✅ Confirm',
                        callback_data: CallbackDataType.CreateLimitOrderConfirm
                    }
                ]
            ]
        }
    });

    await saveLastPage(chatId, newMessage);
};
