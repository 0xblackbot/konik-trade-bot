import {REDIS_CLIENT} from '../globals';

export abstract class RedisWalletService {
    private static REDIS_KEYS = {
        mnemonicRecord: 'KONIK/mnemonicRecord'
    };

    public static getMnemonic = (chatId: number) =>
        REDIS_CLIENT.hget(this.REDIS_KEYS.mnemonicRecord, chatId.toString());

    public static setMnemonic = (chatId: number, value: string) =>
        REDIS_CLIENT.hset(
            this.REDIS_KEYS.mnemonicRecord,
            chatId.toString(),
            value
        );
}
