import {isDefined} from '@rnw-community/shared';

import {getLimitOrderText} from './limit-order.page';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {CallbackDataType} from '../../enums/callback-data-type.enum';
import {LimitOrderStatus} from '../../enums/limit-order-status.enum';
import {BOT} from '../../globals';
import {LimitOrder} from '../../interfaces/limit-order.interface';
import {saveLastPage} from '../../utils/ui-state.utils';
import {send404Page} from '../404.page';

export const sendLimitOrderConfirmationPage = async (
    chatId: number,
    targetOutputAssetAmount: number,
    targetPrice: number
) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (
        !isDefined(uiState.selectedToken) ||
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
        status: LimitOrderStatus.Active,
        side: uiState.limitOrder.side,
        asset: uiState.selectedToken,
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
