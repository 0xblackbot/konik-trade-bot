import {isDefined} from '@rnw-community/shared';

import {REDIS_CLIENT} from '../globals';
import {TonSpentAmountRecord} from '../types/ton-spent-amount-record.type';

export abstract class RedisUserAssetsService {
    private static REDIS_KEYS = {
        tonSpentAmountRecord: 'KONIK/tonSpentAmountRecord'
    };

    public static getUserTonSpentAmountRecord = async (chatId: number) => {
        const serializedData = await REDIS_CLIENT.hget(
            this.REDIS_KEYS.tonSpentAmountRecord,
            chatId.toString()
        );

        if (isDefined(serializedData)) {
            return JSON.parse(serializedData) as TonSpentAmountRecord;
        } else {
            return {};
        }
    };

    public static getUserAssets = async (chatId: number) => {
        const spentRecord = await this.getUserTonSpentAmountRecord(chatId);

        return Object.keys(spentRecord);
    };

    public static addAssetTonSpentAmount = async (
        chatId: number,
        assetAddress: string,
        amount: number
    ) => {
        const spentRecord = await this.getUserTonSpentAmountRecord(chatId);

        const newSpentRecord: TonSpentAmountRecord = {
            ...spentRecord,
            [assetAddress]: (spentRecord[assetAddress] ?? 0) + amount
        };

        return REDIS_CLIENT.hset(
            this.REDIS_KEYS.tonSpentAmountRecord,
            chatId.toString(),
            JSON.stringify(newSpentRecord)
        );
    };
}
