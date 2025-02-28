import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {OrderSide} from '../../enums/order-side.enum';
import {send404Page} from '../../pages/404.page';
import {sendLimitOrderConfirmationPage} from '../../pages/limit-order-confirmation.page';

export const processTargetPercentPriceChange = async (
    chatId: number,
    priceChangePercent: number
) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (
        !uiState.limitOrder?.currentOutputAssetAmount ||
        !uiState.limitOrder.currentPrice ||
        !uiState.limitOrder?.side
    ) {
        return send404Page(chatId);
    }

    const K = (100 + priceChangePercent) / 100;

    const targetOutputAssetAmount =
        uiState.limitOrder.side === OrderSide.Buy
            ? uiState.limitOrder.currentOutputAssetAmount / K
            : uiState.limitOrder.currentOutputAssetAmount * K;
    const targetPrice = uiState.limitOrder.currentPrice * K;

    return sendLimitOrderConfirmationPage(
        chatId,
        targetOutputAssetAmount,
        targetPrice
    );
};
