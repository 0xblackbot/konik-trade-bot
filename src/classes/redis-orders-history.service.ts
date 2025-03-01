import {REDIS_CLIENT} from '../globals';
import {PendingTransaction} from '../interfaces/pending-transaction.interface';

export abstract class RedisOrderHistoryService {
    private static REDIS_KEYS = {
        pendingTransactionsRecord: 'KONIK/pendingTransactionsRecord'
    };

    public static getPendingTransactions = async () => {
        const serializedData = await REDIS_CLIENT.hgetall(
            this.REDIS_KEYS.pendingTransactionsRecord
        );

        return Object.values(serializedData).map<PendingTransaction>(value =>
            JSON.parse(value)
        );
    };

    public static addPendingTransaction = (value: PendingTransaction) =>
        REDIS_CLIENT.hset(
            this.REDIS_KEYS.pendingTransactionsRecord,
            value.bocHash,
            JSON.stringify(value)
        );

    public static deletePendingTransaction = (value: PendingTransaction) =>
        REDIS_CLIENT.hdel(
            this.REDIS_KEYS.pendingTransactionsRecord,
            value.bocHash
        );
}
