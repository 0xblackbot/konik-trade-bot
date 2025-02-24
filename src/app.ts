import TelegramBot from 'node-telegram-bot-api';

import {callbackQueryHandler} from './handlers/callback-query.handler';
import {messageReplyHandler} from './handlers/message-reply.handler';
import {messageHandler} from './handlers/message.handler';
import {TELEGRAM_BOT_API_TOKEN} from './secrets';

const bot = new TelegramBot(TELEGRAM_BOT_API_TOKEN, {polling: true});

bot.on('message', (message, metadata) => {
    try {
        if (message.chat.type === 'private') {
            if (message.reply_to_message) {
                return messageReplyHandler(message, metadata);
            }

            return messageHandler(message, metadata);
        }
    } catch (error) {
        console.log('Error while handling message', message, error);
    }
});
bot.on('callback_query', callbackQueryHandler);
