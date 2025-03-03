import {getSwapHistoryData, SwapStatusEnum} from 'rainbow-swap-sdk';
import {SwapHistoryData} from 'rainbow-swap-sdk/dist/interfaces/swap-history-data.interface';

import {RedisLimitOrdersService} from '../classes/redis-limit-orders.service';
import {RedisOrderHistoryService} from '../classes/redis-orders-history.service';
import {RedisUserAssetsService} from '../classes/redis-user-assets.service';
import {LimitOrderStatus} from '../enums/limit-order-status.enum';
import {OrderType} from '../enums/order-type.enum';
import {BOT} from '../globals';
import {
    LimitPendingTransaction,
    MarketPendingTransaction
} from '../interfaces/pending-transaction.interface';
import {getSwapHistoryDataText} from '../pages/swap-history-data.page';
import {getTonSpentAmount} from '../utils/pnl.utils';
import {promiseAllByChunks, sleep} from '../utils/promise.utils';

const UPDATE_INTERVAL = 3 * 1000;
const PARALLEL_REQUESTS_LIMIT = 5;

export const checkPendingTransactions = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        await sleep(UPDATE_INTERVAL);

        const pendingTransactions =
            await RedisOrderHistoryService.getPendingTransactions();

        await promiseAllByChunks(
            PARALLEL_REQUESTS_LIMIT,
            pendingTransactions.map(pendingTransaction => async () => {
                const historyData = await getSwapHistoryData({
                    bocHash: pendingTransaction.bocHash
                });

                // completed
                if (historyData.status !== SwapStatusEnum.Pending) {
                    await RedisOrderHistoryService.deletePendingTransaction(
                        pendingTransaction
                    );

                    await RedisUserAssetsService.addAssetTonSpentAmount(
                        pendingTransaction.chatId,
                        pendingTransaction.assetAddress,
                        getTonSpentAmount(historyData)
                    );
                }

                if (pendingTransaction.type === OrderType.Market) {
                    return processMarketTransaction(
                        pendingTransaction,
                        historyData
                    );
                }

                if (pendingTransaction.type === OrderType.Limit) {
                    return processLimitTransaction(
                        pendingTransaction,
                        historyData
                    );
                }
            })
        );
    }
};

const processMarketTransaction = async (
    pendingTransaction: MarketPendingTransaction,
    historyData: SwapHistoryData
) => {
    await BOT.editMessageText(
        getSwapHistoryDataText(
            historyData,
            pendingTransaction.expectedMessageCount
        ),
        {
            chat_id: pendingTransaction.chatId,
            message_id: pendingTransaction.messageId,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        }
    ).catch(error => console.log('BOT.editMessageText error', error));
};

const processLimitTransaction = async (
    pendingTransaction: LimitPendingTransaction,
    historyData: SwapHistoryData
) => {
    if (
        historyData.status === SwapStatusEnum.Success ||
        historyData.status === SwapStatusEnum.PartiallyFilled
    ) {
        await RedisLimitOrdersService.updateLimitOrderStatus(
            pendingTransaction.chatId,
            pendingTransaction.limitOrderId,
            LimitOrderStatus.Filled
        );

        const historyDataText = getSwapHistoryDataText(
            historyData,
            pendingTransaction.expectedMessageCount
        );

        await BOT.sendMessage(
            pendingTransaction.chatId,
            `<b>Limit Order Filled</b>\n` + '\n' + historyDataText,
            {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            }
        ).catch(error => console.log('BOT.editMessageText error', error));
    }

    if (historyData.status === SwapStatusEnum.Failed) {
        await RedisLimitOrdersService.updateLimitOrderStatus(
            pendingTransaction.chatId,
            pendingTransaction.limitOrderId,
            LimitOrderStatus.Active
        );
    }
};
