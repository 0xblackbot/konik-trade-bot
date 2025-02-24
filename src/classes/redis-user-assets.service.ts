import {isDefined} from '@rnw-community/shared';

import {REDIS_CLIENT} from '../globals';
import {AssetsRecord} from '../types/assets-record.type';

export abstract class RedisUserAssetsService {
    private static REDIS_KEYS = {
        assetsRecord: 'KONIK/assetsRecord'
    };

    public static getUserAssetsRecord = async (chatId: number) => {
        const serializedData = await REDIS_CLIENT.hget(
            this.REDIS_KEYS.assetsRecord,
            chatId.toString()
        );

        if (isDefined(serializedData)) {
            return JSON.parse(serializedData) as AssetsRecord;
        } else {
            return {};
        }
    };

    public static getUserAssets = async (chatId: number) => {
        const assetsRecord = await this.getUserAssetsRecord(chatId);

        return Object.keys(assetsRecord);
    };

    public static addUserAsset = async (chatId: number, address: string) => {
        const assetsRecord = await this.getUserAssetsRecord(chatId);

        const newAssetsRecord: AssetsRecord = {
            ...assetsRecord,
            [address]: true
        };

        return REDIS_CLIENT.hset(
            this.REDIS_KEYS.assetsRecord,
            chatId.toString(),
            JSON.stringify(newAssetsRecord)
        );
    };
}
