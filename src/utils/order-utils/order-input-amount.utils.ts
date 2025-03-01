import {isDefined} from '@rnw-community/shared';

import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {OrderSide} from '../../enums/order-side.enum';
import {OrderType} from '../../enums/order-type.enum';
import {LITE_CLIENT} from '../../globals';
import {sendErrorPage} from '../../pages/error.page';
import {sendLimitOrderTargetPricePage} from '../../pages/limit-order/limit-order-target-price.page';
import {sendMarketOrderConfirmationPage} from '../../pages/market-order/market-order-confirmation.page';
import {getInputOutputAssets} from '../asset.utils';
import {getInputAssetAmountValidationError} from '../validation.utils';

export const processOrderInputAmount = async (
    chatId: number,
    orderType: OrderType,
    side: OrderSide,
    inputAssetAmount: bigint
) => {
    await LITE_CLIENT.updateLastBlock();

    const uiState = await RedisUiStateService.getUiState(chatId);
    const {inputAsset} = getInputOutputAssets(side, uiState.selectedToken);

    const error = await getInputAssetAmountValidationError(
        chatId,
        inputAsset,
        inputAssetAmount
    );

    if (isDefined(error)) {
        return sendErrorPage(chatId, error);
    }

    if (orderType === OrderType.Market) {
        return sendMarketOrderConfirmationPage(chatId, side, inputAssetAmount);
    }

    if (orderType === OrderType.Limit) {
        return sendLimitOrderTargetPricePage(chatId, side, inputAssetAmount);
    }
};
