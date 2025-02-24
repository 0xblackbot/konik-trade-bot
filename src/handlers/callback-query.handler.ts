import {TelegramEvents} from 'node-telegram-bot-api';

import {CallbackDataType} from '../enums/callback-data-type.enum';
import {BOT} from '../globals';
import {createMarketBuyOrder} from '../orders/market/market-buy.order';
import {sendHelpPage} from '../pages/help.page';
import {sendMarketBuyAmountInputPage} from '../pages/input/market-buy-amount-input.page';
import {toNano} from '../utils/balance.utils';

export const callbackQueryHandler: TelegramEvents['callback_query'] = query => {
    if (query.message) {
        if (query.data === CallbackDataType.Help) {
            return sendHelpPage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.Close) {
            return BOT.deleteMessage(
                query.message.chat.id,
                query.message.message_id
            ).catch(error => console.log('BOT.deleteMessage error', error));
        }

        if (query.data === CallbackDataType.MarketBuy_10) {
            return createMarketBuyOrder(query.message.chat.id, toNano('10', 9));
        }

        if (query.data === CallbackDataType.MarketBuy_100) {
            return createMarketBuyOrder(
                query.message.chat.id,
                toNano('100', 9)
            );
        }

        if (query.data === CallbackDataType.MarketBuy_X) {
            return sendMarketBuyAmountInputPage(query.message.chat.id);
        }
    }
};
