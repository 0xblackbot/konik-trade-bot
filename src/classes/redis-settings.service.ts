import {isDefined} from '@rnw-community/shared';

import {REDIS_CLIENT} from '../globals';
import {Settings} from '../interfaces/settings.interface';

export const DEFAULT_SETTINGS: Settings = {
    maxSlippage: 10
};

export abstract class RedisSettingsService {
    private static REDIS_KEYS = {
        settingsRecord: 'KONIK/settingsRecord'
    };

    public static getSettings = async (chatId: number) => {
        const serializedData = await REDIS_CLIENT.hget(
            this.REDIS_KEYS.settingsRecord,
            chatId.toString()
        );

        if (isDefined(serializedData)) {
            return JSON.parse(serializedData) as Settings;
        } else {
            return DEFAULT_SETTINGS;
        }
    };

    public static setSettings = (chatId: number, value: Settings) =>
        REDIS_CLIENT.hset(
            this.REDIS_KEYS.settingsRecord,
            chatId.toString(),
            JSON.stringify(value)
        );
}
