import {isDefined} from '@rnw-community/shared';

import {RedisLimitOrdersService} from '../../classes/redis-limit-orders.service';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {BOT} from '../../globals';
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

    await RedisLimitOrdersService.addUserLimitOrder({
        id: 0,
        chatId,
        side: uiState.limitOrder.side,
        asset: uiState.selectedToken,
        inputAssetAmount: uiState.limitOrder.inputAssetAmount,
        targetOutputAssetAmount: uiState.limitOrder.targetOutputAssetAmount,
        targetPrice: uiState.limitOrder.targetPrice
    });

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        limitOrder: undefined
    });

    const newMessage = await BOT.sendMessage(
        chatId,
        'Limit Order <b>created</b>',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [CLOSE_BUTTON]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
