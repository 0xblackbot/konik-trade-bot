import {isDefined} from '@rnw-community/shared';
import {Asset} from 'rainbow-swap-sdk';

import {
    getLimitOrderKey,
    RedisLimitOrdersService
} from '../../classes/redis-limit-orders.service';
import {LimitOrderStatus} from '../../enums/limit-order-status.enum';
import {OrderSide} from '../../enums/order-side.enum';
import {BOT} from '../../globals';
import {LimitOrder} from '../../interfaces/limit-order.interface';
import {CLOSE_BUTTON} from '../../pages/buttons/close.button';
import {sendLimitOrderCanceledPage} from '../../pages/limit-order/limit-order-canceled.page';
import {getLimitOrderText} from '../../pages/limit-order/limit-order.page';

export const cancelLimitOrder = async (chatId: number, id: number) => {
    await RedisLimitOrdersService.updateLimitOrderStatus(
        chatId,
        id,
        LimitOrderStatus.Cancelled
    );

    return sendLimitOrderCanceledPage(chatId);
};

export const cancelLimitOrderWithError = async (
    limitOrder: LimitOrder,
    error: string
) => {
    await RedisLimitOrdersService.updateLimitOrderStatus(
        limitOrder.chatId,
        limitOrder.id,
        LimitOrderStatus.Cancelled
    );

    const limitOrderText = getLimitOrderText(limitOrder);

    return BOT.sendMessage(
        limitOrder.chatId,
        '<b>❗ Canceled </b>' +
            limitOrderText +
            '\n' +
            '<b>Reason:</b>\n' +
            error,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [CLOSE_BUTTON]
            }
        }
    );
};

export const getUserActiveLimitOrders = async (chatId: number) => {
    const keysArray =
        await RedisLimitOrdersService.getUserLimitOrderKeys(chatId);

    return Promise.all(
        keysArray.map(key => RedisLimitOrdersService.getLimitOrder(key))
    ).then(result =>
        result.filter(
            (value): value is LimitOrder =>
                isDefined(value) && value.status === LimitOrderStatus.Active
        )
    );
};

export const addUserLimitOrder = async (
    chatId: number,
    side: OrderSide,
    asset: Asset,
    inputAssetAmount: string,
    targetOutputAssetAmount: number,
    targetPrice: number
) => {
    const keysArray =
        await RedisLimitOrdersService.getUserLimitOrderKeys(chatId);

    const orderWithId: LimitOrder = {
        id: keysArray.length,
        chatId,
        status: LimitOrderStatus.Active,
        side,
        asset,
        inputAssetAmount,
        targetOutputAssetAmount,
        targetPrice
    };

    const newKeysArray = [...keysArray, getLimitOrderKey(orderWithId)];

    await RedisLimitOrdersService.setLimitOrder(orderWithId);
    await RedisLimitOrdersService.setUserLimitOrderKeys(chatId, newKeysArray);
};
