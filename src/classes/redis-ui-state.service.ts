import {isDefined} from '@rnw-community/shared';

import {REDIS_CLIENT} from '../globals';
import {UiState} from '../interfaces/ui-state.interface';

export abstract class RedisUiStateService {
    private static REDIS_KEYS = {
        uiStateRecord: 'KONIK/uiStateRecord'
    };

    public static getUiState = async (chatId: number) => {
        const serializedData = await REDIS_CLIENT.hget(
            this.REDIS_KEYS.uiStateRecord,
            chatId.toString()
        );

        if (isDefined(serializedData)) {
            return JSON.parse(serializedData) as UiState;
        } else {
            return undefined;
        }
    };

    public static setUiState = (chatId: number, value: UiState) =>
        REDIS_CLIENT.hset(
            this.REDIS_KEYS.uiStateRecord,
            chatId.toString(),
            JSON.stringify(value)
        );
}
