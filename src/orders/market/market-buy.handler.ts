import {isDefined} from '@rnw-community/shared';
import {getBestRoute} from 'rainbow-swap-sdk';

import {RedisSettingsService} from '../../classes/redis-settings.service';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {send404Page} from '../../pages/404.page';
import {RAINBOW_AG_AUTH_HEADER} from '../../secrets';
import {getWallet} from '../../utils/wallet.utils';

export const marketBuyHandler = async (
    chatId: number,
    inputAssetAmount: bigint
) => {
    const wallet = await getWallet(chatId);

    const uiState = await RedisUiStateService.getUiState(chatId);
    const settings = await RedisSettingsService.getSettings(chatId);

    if (!isDefined(uiState)) {
        return send404Page(chatId);
    }

    const bestRoute = await getBestRoute(
        {
            inputAssetAmount: inputAssetAmount.toString(),
            inputAssetAddress: 'TON',
            outputAssetAddress: uiState.selectedToken.address,
            maxDepth: 1,
            maxSplits: 1,
            senderAddress: wallet.address.toString(),
            maxSlippage: settings.maxSlippage
        },
        RAINBOW_AG_AUTH_HEADER
    );

    // TODO: do swap
    console.log('bestRoute', bestRoute);
};
