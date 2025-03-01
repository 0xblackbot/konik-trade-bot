import {isDefined} from '@rnw-community/shared';

import {RedisLimitOrdersService} from '../classes/redis-limit-orders.service';
import {RedisOrderHistoryService} from '../classes/redis-orders-history.service';
import {LimitOrderStatus} from '../enums/limit-order-status.enum';
import {OrderType} from '../enums/order-type.enum';
import {LITE_CLIENT} from '../globals';
import {getInputOutputAssets} from '../utils/asset.utils';
import {getBestRoute} from '../utils/best-route.utils';
import {cancelLimitOrderWithError} from '../utils/order-utils/limit-order.utils';
import {sleep} from '../utils/promise.utils';
import {
    getGasValidationError,
    getInputAssetAmountValidationError
} from '../utils/validation.utils';
import {getWallet} from '../utils/wallet.utils';

const UPDATE_INTERVAL = 15 * 1000;

export const checkLimitOrders = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        await sleep(UPDATE_INTERVAL);

        await LITE_CLIENT.updateLastBlock();

        const activeLimitOrders =
            await RedisLimitOrdersService.getLimitOrders().then(orders =>
                orders.filter(value => value.status === LimitOrderStatus.Active)
            );

        await Promise.all(
            activeLimitOrders.map(async limitOrder => {
                const inputAssetAmount = BigInt(limitOrder.inputAssetAmount);
                const {inputAsset, outputAsset} = getInputOutputAssets(
                    limitOrder.side,
                    limitOrder.asset
                );

                const bestRoute = await getBestRoute(
                    limitOrder.chatId,
                    inputAssetAmount,
                    inputAsset.address,
                    outputAsset.address
                );

                if (
                    bestRoute.displayData.routes.length !== 0 &&
                    bestRoute.displayData.outputAssetAmount >=
                        limitOrder.targetOutputAssetAmount
                ) {
                    const [inputAmountError, gasError] = await Promise.all([
                        getInputAssetAmountValidationError(
                            limitOrder.chatId,
                            inputAsset,
                            inputAssetAmount
                        ),
                        getGasValidationError(limitOrder.chatId, bestRoute)
                    ]);

                    const error = inputAmountError ?? gasError;

                    if (isDefined(error)) {
                        return cancelLimitOrderWithError(limitOrder, error);
                    }

                    const wallet = await getWallet(limitOrder.chatId);
                    const transferBoc = await wallet.createTransferBoc(
                        bestRoute.swapMessages
                    );
                    const bocHash = await wallet.sendBoc(transferBoc);

                    await RedisLimitOrdersService.updateLimitOrderStatus(
                        limitOrder.chatId,
                        limitOrder.id,
                        LimitOrderStatus.Pending
                    );
                    await RedisOrderHistoryService.addPendingTransaction({
                        type: OrderType.Limit,
                        bocHash,
                        chatId: limitOrder.chatId,
                        assetAddress: limitOrder.asset.address,
                        limitOrderId: limitOrder.id,
                        expectedMessageCount: bestRoute.messageCount
                    });
                }
            })
        );
    }
};
