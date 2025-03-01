import {isDefined} from '@rnw-community/shared';

import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {LITE_CLIENT} from '../../globals';
import {processOrderSellPercentAmount} from '../../utils/order-utils/sell-percent-input.utils';
import {send404Page} from '../404.page';
import {sendErrorPage} from '../error.page';

export const sellPercentInputHandler = async (
    chatId: number,
    messageText: string
) => {
    await LITE_CLIENT.updateLastBlock();

    const uiState = await RedisUiStateService.getUiState(chatId);

    const inputAmount = parseFloat(messageText);

    if (!isDefined(uiState.orderType)) {
        return send404Page(chatId);
    }

    if (isNaN(inputAmount)) {
        return sendErrorPage(
            chatId,
            'Invalid amount. Press button and try again.'
        );
    }

    if (inputAmount <= 0 || inputAmount > 100) {
        return sendErrorPage(
            chatId,
            `Number out of range (0 - 100). Press button and try again.`
        );
    }

    return processOrderSellPercentAmount(
        chatId,
        uiState.orderType,
        inputAmount
    );
};
