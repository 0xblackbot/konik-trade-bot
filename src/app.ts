import TelegramBot from 'node-telegram-bot-api';

import {callbackQueryHandler} from './handlers/callback-query.handler';
import {messageHandler} from './handlers/message.handler';
import {TELEGRAM_BOT_API_TOKEN} from './secrets';

const bot = new TelegramBot(TELEGRAM_BOT_API_TOKEN, {polling: true});

bot.on('message', messageHandler);
bot.on('callback_query', callbackQueryHandler);
