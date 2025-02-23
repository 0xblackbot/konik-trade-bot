import TelegramBot from 'node-telegram-bot-api';

import {TELEGRAM_BOT_API_TOKEN} from './secrets';

export const BOT = new TelegramBot(TELEGRAM_BOT_API_TOKEN, {polling: false});
