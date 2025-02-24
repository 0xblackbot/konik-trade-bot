import {REDIS_CLIENT} from '../globals';
import {PendingOrder} from '../interfaces/pending-order.interface';

export abstract class RedisOrderHistoryService {
    private static REDIS_KEYS = {
        pendingOrdersRecord: 'KONIK/pendingOrdersRecord'
    };

    public static getPendingOrders = async () => {
        const serializedData = await REDIS_CLIENT.hgetall(
            this.REDIS_KEYS.pendingOrdersRecord
        );

        return Object.values(serializedData).map<PendingOrder>(value =>
            JSON.parse(value)
        );
    };

    public static addPendingOrder = (value: PendingOrder) =>
        REDIS_CLIENT.hset(
            this.REDIS_KEYS.pendingOrdersRecord,
            value.bocHash,
            JSON.stringify(value)
        );

    public static deletePendingOrder = (value: PendingOrder) =>
        REDIS_CLIENT.hdel(this.REDIS_KEYS.pendingOrdersRecord, value.bocHash);
}
