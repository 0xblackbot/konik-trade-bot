import {isDefined} from '@rnw-community/shared';

import {sendLimitOrderPage} from './limit-order.page';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {addUserLimitOrder} from '../../utils/order-utils/limit-order.utils';
import {send404Page} from '../404.page';

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

    const newLimitOrder = await addUserLimitOrder(
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

    return sendLimitOrderPage(
        chatId,
        newLimitOrder.id.toString(),
        '<b>Created </b>'
    );
};
