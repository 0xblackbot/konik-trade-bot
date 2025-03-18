import {isDefined} from '@rnw-community/shared';

import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {BOT} from '../../globals';
import {addUserLimitOrder} from '../../utils/order-utils/limit-order.utils';
import {saveLastPage} from '../../utils/ui-state.utils';
import {send404Page} from '../404.page';
import {CLOSE_BUTTON} from '../buttons/close.button';

export const sendLimitOrderConfirmationConfirmPage = async (chatId: number) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (
        !isDefined(uiState.selectedToken) ||
        !isDefined(uiState.limitOrder?.side) ||
        !isDefined(uiState.limitOrder?.inputAssetAmount) ||
        !isDefined(uiState.limitOrder?.targetOutputAssetAmount) ||
        !isDefined(uiState.limitOrder?.targetPrice)
    ) {
        return send404Page(chatId);
    }

    await addUserLimitOrder(
        chatId,
        uiState.limitOrder.side,
        uiState.selectedToken,
        uiState.limitOrder.inputAssetAmount,
        uiState.limitOrder.targetOutputAssetAmount,
        uiState.limitOrder.targetPrice
    );

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        limitOrder: undefined
    });

    const newMessage = await BOT.sendMessage(
        chatId,
        'Limit Order <b>Created</b>',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[CLOSE_BUTTON]]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
