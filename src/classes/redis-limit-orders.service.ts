import {isDefined} from '@rnw-community/shared';

import {LimitOrderStatus} from '../enums/limit-order-status.enum';
import {REDIS_CLIENT} from '../globals';
import {LimitOrder} from '../interfaces/limit-order.interface';

export const getLimitOrderKey = (order: LimitOrder) =>
    `${order.chatId}_${order.id}`;

export abstract class RedisLimitOrdersService {
    private static REDIS_KEYS = {
        userLimitOrderKeysArray: 'KONIK/userLimitOrderKeysArray',
        limitOrdersRecord: 'KONIK/limitOrdersRecord'
    };

    public static getLimitOrder = async (key: string) => {
        const serializedData = await REDIS_CLIENT.hget(
            this.REDIS_KEYS.limitOrdersRecord,
            key
        );

        if (isDefined(serializedData)) {
            return JSON.parse(serializedData) as LimitOrder;
        } else {
            return undefined;
        }
    };

    public static getLimitOrders = async () => {
        const serializedDataRecord = await REDIS_CLIENT.hgetall(
            this.REDIS_KEYS.limitOrdersRecord
        );

        return Object.values(serializedDataRecord).map(
            serializedData => JSON.parse(serializedData) as LimitOrder
        );
    };

    public static setLimitOrder = (order: LimitOrder) =>
        REDIS_CLIENT.hset(
            this.REDIS_KEYS.limitOrdersRecord,
            getLimitOrderKey(order),
            JSON.stringify(order)
        );

    public static getUserLimitOrderKeys = async (chatId: number) => {
        const serializedData = await REDIS_CLIENT.hget(
            this.REDIS_KEYS.userLimitOrderKeysArray,
            chatId.toString()
        );

        return isDefined(serializedData)
            ? (JSON.parse(serializedData) as string[])
            : [];
    };

    public static setUserLimitOrderKeys = (
        chatId: number,
        keysArray: string[]
    ) =>
        REDIS_CLIENT.hset(
            this.REDIS_KEYS.userLimitOrderKeysArray,
            chatId.toString(),
            JSON.stringify(keysArray)
        );

    public static updateLimitOrderStatus = async (
        chatId: number,
        id: number,
        status: LimitOrderStatus
    ) => {
        const key = `${chatId}_${id}`;
        const limitOrder = await this.getLimitOrder(key);

        if (isDefined(limitOrder)) {
            return this.setLimitOrder({
                ...limitOrder,
                status
            });
        }
    };
}
