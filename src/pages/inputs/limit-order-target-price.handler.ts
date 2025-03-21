import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {OrderSide} from '../../enums/order-side.enum';
import {send404Page} from '../404.page';
import {sendErrorPage} from '../error.page';
import {sendLimitOrderConfirmationPage} from '../limit-order/limit-order-confirmation.page';

export const limitOrderTargetPriceHandler = async (
    chatId: number,
    messageText: string
) => {
    const targetPrice = parseFloat(messageText);

    if (isNaN(targetPrice)) {
        return sendErrorPage(
            chatId,
            'Invalid amount. Press button and try again.'
        );
    }

    if (targetPrice <= 0) {
        return sendErrorPage(
            chatId,
            `Invalid price. Please enter a value <b>greater than 0</b> and try again."`
        );
    }

    const uiState = await RedisUiStateService.getUiState(chatId);

    if (
        !uiState.limitOrder?.currentOutputAssetAmount ||
        !uiState.limitOrder.currentPrice ||
        !uiState.limitOrder?.side
    ) {
        return send404Page(chatId);
    }

    const K = targetPrice / uiState.limitOrder.currentPrice;

    const targetOutputAssetAmount =
        uiState.limitOrder.side === OrderSide.Buy
            ? uiState.limitOrder.currentOutputAssetAmount / K
            : uiState.limitOrder.currentOutputAssetAmount * K;

    return sendLimitOrderConfirmationPage(
        chatId,
        targetOutputAssetAmount,
        targetPrice
    );
};
