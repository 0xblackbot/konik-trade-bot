import {isDefined} from '@rnw-community/shared';

import {createMarketOrder} from './market.order';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {LITE_CLIENT} from '../../globals';
import {send404Page} from '../../pages/404.page';
import {getAssetBalance} from '../../utils/asset.utils';
import {getWallet} from '../../utils/wallet.utils';

const PRECISION_FACTOR = 10 ** 6;

export const createMarketSellOrder = async (
    chatId: number,
    inputPercentAmount: number
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
        Math.round(inputPercentAmount * PRECISION_FACTOR)
    );

    const inputAssetAmount =
        (inputAssetBalance * percentBigInt) / BigInt(100 * PRECISION_FACTOR);

    return createMarketOrder(chatId, 'sell', inputAssetAmount);
};
