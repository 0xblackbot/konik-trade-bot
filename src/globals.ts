import TelegramBot from 'node-telegram-bot-api';

import {LiteClient} from './classes/lite-client.class';
import {HETZNER_LITESERVER_CONFIG, TELEGRAM_BOT_API_TOKEN} from './secrets';
import {createRedisClient} from './utils/redis.utils';

export const TON = 'TON';

export const BOT = new TelegramBot(TELEGRAM_BOT_API_TOKEN, {polling: false});

// Our private mainnet liteserver
export const LITE_CLIENT = new LiteClient(HETZNER_LITESERVER_CONFIG);

export const REDIS_CLIENT = createRedisClient('MAIN_REDIS_CLIENT');
