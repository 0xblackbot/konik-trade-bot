import {REDIS_CLIENT} from '../globals';

export abstract class RedisCacheService {
    private static REDIS_KEYS = {
        cacheRecord: 'KONIK/cacheRecord'
    };

    public static getCache = (key: string) =>
        REDIS_CLIENT.hget(this.REDIS_KEYS.cacheRecord, key);

    public static setCache = (key: string, value: string) =>
        REDIS_CLIENT.hset(this.REDIS_KEYS.cacheRecord, key, value);
}
