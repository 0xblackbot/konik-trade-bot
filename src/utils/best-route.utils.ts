import {getBestRoute as default_getBestRoute} from 'rainbow-swap-sdk';

import {RAINBOW_AG_AUTH_HEADER} from '../secrets';
import {getWallet} from './wallet.utils';
import {RedisSettingsService} from '../classes/redis-settings.service';

export const getBestRoute = async (
    chatId: number,
    inputAssetAmount: bigint,
    inputAssetAddress: string,
    outputAssetAddress: string
) => {
    const wallet = await getWallet(chatId);
    const settings = await RedisSettingsService.getSettings(chatId);

    return default_getBestRoute(
        {
            inputAssetAmount: inputAssetAmount.toString(),
            inputAssetAddress: inputAssetAddress,
            outputAssetAddress: outputAssetAddress,
            maxDepth: 1,
            maxSplits: 1,
            senderAddress: wallet.address.toString(),
            maxSlippage: settings.maxSlippage
        },
        RAINBOW_AG_AUTH_HEADER
    );
};
