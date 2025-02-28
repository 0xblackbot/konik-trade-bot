import {isDefined} from '@rnw-community/shared';

import {REDIS_CLIENT} from '../globals';
import {LimitOrder} from '../orders/interfaces/limit-order.interface';

const getOrderKey = (order: LimitOrder) => `${order.chatId}_${order.id}`;

export abstract class RedisLimitOrdersService {
    private static REDIS_KEYS = {
        pendingLimitOrdersStack: 'KONIK/pendingLimitOrdersStack',
        userLimitOrderKeysArray: 'KONIK/userLimitOrderKeysArray',
        limitOrdersRecord: 'KONIK/limitOrdersRecord'
    };

    public static getLimitOrder = async (key: string) => {
        const serializedData = await REDIS_CLIENT.hget(
            this.REDIS_KEYS.userLimitOrderKeysArray,
            key
        );

        if (isDefined(serializedData)) {
            return JSON.parse(serializedData) as LimitOrder;
        } else {
            return undefined;
        }
    };

    public static setLimitOrder = (order: LimitOrder) =>
        REDIS_CLIENT.hset(
            this.REDIS_KEYS.userLimitOrderKeysArray,
            getOrderKey(order),
            JSON.stringify(order)
        );

    public static getUserLimitOrders = async (chatId: number) => {
        const serializedData = await REDIS_CLIENT.hget(
            this.REDIS_KEYS.userLimitOrderKeysArray,
            chatId.toString()
        );

        const keysArray: string[] = isDefined(serializedData)
            ? JSON.parse(serializedData)
            : [];

        return Promise.all(keysArray.map(key => this.getLimitOrder(key))).then(
            result => result.filter(isDefined)
        );
    };

    public static addUserLimitOrder = async (order: LimitOrder) => {
        const ordersArray = await this.getUserLimitOrders(order.chatId);

        const orderWithId: LimitOrder = {
            ...order,
            id: ordersArray.length
        };

        const newKeysArray = [
            ...ordersArray.map(getOrderKey),
            getOrderKey(orderWithId)
        ];

        await this.setLimitOrder(orderWithId);
        await this.pendingOrdersStackPush(orderWithId);
        await REDIS_CLIENT.hset(
            this.REDIS_KEYS.userLimitOrderKeysArray,
            order.chatId.toString(),
            JSON.stringify(newKeysArray)
        );
    };

    public static cancelUserLimitOrder = async (chatId: number, id: number) => {
        const key = `${chatId}_${id}`;
        const ordersArray = await this.getUserLimitOrders(chatId);

        const newKeysArray = ordersArray
            .map(getOrderKey)
            .filter(value => value !== key);

        await REDIS_CLIENT.hdel(this.REDIS_KEYS.userLimitOrderKeysArray, key);
        await REDIS_CLIENT.hset(
            this.REDIS_KEYS.userLimitOrderKeysArray,
            chatId.toString(),
            JSON.stringify(newKeysArray)
        );
    };

    public static pendingOrdersStackPush = async (order: LimitOrder) => {
        const key = getOrderKey(order);

        const items = await REDIS_CLIENT.lrange(
            this.REDIS_KEYS.pendingLimitOrdersStack,
            0,
            -1
        );

        if (items.includes(key)) {
            return;
        }

        return REDIS_CLIENT.lpush(this.REDIS_KEYS.pendingLimitOrdersStack, key);
    };

    public static pendingOrdersStackPop = async () => {
        const orderKey = await REDIS_CLIENT.rpop(
            this.REDIS_KEYS.pendingLimitOrdersStack
        );

        if (isDefined(orderKey)) {
            return this.getLimitOrder(orderKey);
        } else {
            return undefined;
        }
    };
}
