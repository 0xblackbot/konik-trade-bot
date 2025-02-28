import {RedisLimitOrdersService} from '../../classes/redis-limit-orders.service';
import {sendLimitOrderCanceledPage} from '../../pages/limit-order-canceled.page';

export const cancelLimitOrder = async (chatId: number, id: number) => {
    await RedisLimitOrdersService.cancelUserLimitOrder(chatId, id);

    return sendLimitOrderCanceledPage(chatId);
};
