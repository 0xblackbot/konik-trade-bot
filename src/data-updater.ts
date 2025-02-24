import {getSwapHistoryData, SwapStatusEnum} from 'rainbow-swap-sdk';

import {RedisOrderHistoryService} from './classes/redis-orders-history.service';
import {BOT} from './globals';
import {getOrderPageText} from './pages/order.page';
import {sleep} from './utils/promise.utils';

const UPDATE_INTERVAL = 3 * 1000;

const app = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        await sleep(UPDATE_INTERVAL);

        const pendingOrders = await RedisOrderHistoryService.getPendingOrders();

        await Promise.all(
            pendingOrders.map(async pendingOrder => {
                const historyData = await getSwapHistoryData({
                    bocHash: pendingOrder.bocHash
                });

                await BOT.editMessageText(
                    getOrderPageText(
                        historyData,
                        pendingOrder.expectedMessageCount
                    ),
                    {
                        chat_id: pendingOrder.chatId,
                        message_id: pendingOrder.messageId,
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    }
                ).catch(error =>
                    console.log('BOT.editMessageText error', error)
                );

                // completed
                if (historyData.status !== SwapStatusEnum.Pending) {
                    await RedisOrderHistoryService.deletePendingOrder(
                        pendingOrder
                    );
                }
            })
        );
    }
};

app();
