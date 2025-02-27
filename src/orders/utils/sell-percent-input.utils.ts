import {isDefined} from '@rnw-community/shared';

import {processOrderInputAmount} from './order-input-amount.utils';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {OrderSide} from '../../enums/order-side.enum';
import {LITE_CLIENT} from '../../globals';
import {send404Page} from '../../pages/404.page';
import {getAssetBalance} from '../../utils/asset.utils';
import {getWallet} from '../../utils/wallet.utils';

const PRECISION_FACTOR = 10 ** 6;

export const processOrderSellPercentAmount = async (
    chatId: number,
    sellPercentAmount: number
) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);

    const uiState = await RedisUiStateService.getUiState(chatId);

    if (!isDefined(uiState?.selectedToken)) {
        return send404Page(chatId);
    }

    const inputAssetBalance = await getAssetBalance(
        uiState.selectedToken.data.address,
        wallet.address
    );

    const percentBigInt = BigInt(
        Math.round(sellPercentAmount * PRECISION_FACTOR)
    );

    const inputAssetAmount =
        (inputAssetBalance * percentBigInt) / BigInt(100 * PRECISION_FACTOR);

    return processOrderInputAmount(chatId, OrderSide.Sell, inputAssetAmount);
};
