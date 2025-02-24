import TelegramBot from 'node-telegram-bot-api';

import {callbackQueryHandler} from './handlers/callback-query.handler';
import {messageReplyHandler} from './handlers/message-reply.handler';
import {messageHandler} from './handlers/message.handler';
import {TELEGRAM_BOT_API_TOKEN} from './secrets';

const bot = new TelegramBot(TELEGRAM_BOT_API_TOKEN, {polling: true});

bot.on('message', async (message, metadata) => {
    try {
        if (message.chat.type === 'private') {
            if (message.reply_to_message) {
                await messageReplyHandler(message, metadata);
            } else {
                await messageHandler(message, metadata);
            }
        }
    } catch (error) {
        console.log('Error while handling message', message, error);
    }
});

bot.on('callback_query', async query => {
    try {
        await callbackQueryHandler(query);
    } catch (error) {
        console.log('Error while handling callback_query', query, error);
    }
});
