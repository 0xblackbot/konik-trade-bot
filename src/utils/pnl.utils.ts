import {SwapHistoryData} from 'rainbow-swap-sdk/dist/interfaces/swap-history-data.interface';

import {LITE_CLIENT, TON} from '../globals';
import {getAssetBalance} from './asset.utils';
import {getBestRoute} from './best-route.utils';
import {getWallet} from './wallet.utils';
import {RedisUserAssetsService} from '../classes/redis-user-assets.service';

export const getTonSpentAmount = (historyData: SwapHistoryData) => {
    if (historyData.sentInfo && historyData.receivedInfo) {
        if (historyData.sentInfo.symbol === TON) {
            return historyData.sentInfo.amount;
        } else {
            return -historyData.receivedInfo.amount;
        }
    }

    return 0;
};

export const getPnl = async (chatId: number, assetAddress: string) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);
    const spentRecord =
        await RedisUserAssetsService.getUserTonSpentAmountRecord(chatId);
    const tonSpentAmount = spentRecord[assetAddress] ?? 0;

    if (tonSpentAmount === 0) {
        return 0;
    }

    const assetBalance = await getAssetBalance(assetAddress, wallet.address);
    const bestRoute = await getBestRoute(
        chatId,
        assetBalance,
        assetAddress,
        TON
    );

    const currentTonValue = bestRoute.displayData.outputAssetAmount;

    return ((currentTonValue - tonSpentAmount) / tonSpentAmount) * 100;
};
