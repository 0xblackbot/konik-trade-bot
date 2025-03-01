import {getSwapHistoryData, SwapStatusEnum} from 'rainbow-swap-sdk';

import {RedisOrderHistoryService} from '../classes/redis-orders-history.service';
import {RedisUserAssetsService} from '../classes/redis-user-assets.service';
import {BOT} from '../globals';
import {getMarketOrderPageText} from '../pages/market-order/market-order.page';
import {sleep} from '../utils/promise.utils';

const UPDATE_INTERVAL = 3 * 1000;

export const updatePendingTransactions = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        await sleep(UPDATE_INTERVAL);

        const pendingTransactions =
            await RedisOrderHistoryService.getPendingTransactions();

        await Promise.all(
            pendingTransactions.map(async pendingTransaction => {
                const historyData = await getSwapHistoryData({
                    bocHash: pendingTransaction.bocHash
                });

                await BOT.editMessageText(
                    getMarketOrderPageText(
                        historyData,
                        pendingTransaction.expectedMessageCount
                    ),
                    {
                        chat_id: pendingTransaction.chatId,
                        message_id: pendingTransaction.messageId,
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    }
                ).catch(error =>
                    console.log('BOT.editMessageText error', error)
                );

                // completed
                if (historyData.status !== SwapStatusEnum.Pending) {
                    await RedisOrderHistoryService.deletePendingTransaction(
                        pendingTransaction
                    );

                    await RedisUserAssetsService.addUserAsset(
                        pendingTransaction.chatId,
                        pendingTransaction.assetAddress
                    );
                }
            })
        );
    }
};
