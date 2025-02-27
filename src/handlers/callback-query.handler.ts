import {TelegramEvents} from 'node-telegram-bot-api';

import {CallbackDataType} from '../enums/callback-data-type.enum';
import {OrderSide} from '../enums/order-side.enum';
import {processOrderInputAmount} from '../orders/utils/order-input-amount.utils';
import {processOrderSellPercentAmount} from '../orders/utils/sell-percent-input.utils';
import {sendBuySellPage} from '../pages/buy-n-sell.page';
import {sendHelpPage} from '../pages/help.page';
import {updateHomePage} from '../pages/home.page';
import {sendBuyAmountInputPage} from '../pages/input/buy-amount-input.page';
import {sendMaxSlippageInputPage} from '../pages/input/max-slippage-input.page';
import {sendSellPercentInputPage} from '../pages/input/sell-percent-input.page';
import {sendLimitOrderPage} from '../pages/limit-order.page';
import {sendSeepPhraseWarning} from '../pages/seed-phrase-warning.page';
import {sendSettingsPage} from '../pages/settings.page';
import {sendUnavailablePage} from '../pages/unavailable.page';
import {toNano} from '../utils/balance.utils';
import {deleteMessageSafe} from '../utils/bot.utils';

export const callbackQueryHandler: TelegramEvents['callback_query'] = query => {
    if (query.message) {
        if (query.data === CallbackDataType.Help) {
            return sendHelpPage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.Close) {
            return deleteMessageSafe(
                query.message.chat.id,
                query.message.message_id
            );
        }

        if (query.data === CallbackDataType.Buy_10) {
            return processOrderInputAmount(
                query.message.chat.id,
                OrderSide.Buy,
                toNano('10', 9)
            );
        }

        if (query.data === CallbackDataType.Buy_100) {
            return processOrderInputAmount(
                query.message.chat.id,
                OrderSide.Buy,
                toNano('100', 9)
            );
        }

        if (query.data === CallbackDataType.Sell_50) {
            return processOrderSellPercentAmount(query.message.chat.id, 50);
        }

        if (query.data === CallbackDataType.Sell_100) {
            return processOrderSellPercentAmount(query.message.chat.id, 100);
        }

        if (
            query.data === CallbackDataType.DCAOrders ||
            query.data === CallbackDataType.LimitOrders
        ) {
            return sendUnavailablePage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.BuyAndSell) {
            return sendBuySellPage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.Settings) {
            return sendSettingsPage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.ExportSeedPhrase) {
            return sendSeepPhraseWarning(query.message.chat.id);
        }

        if (query.data === CallbackDataType.Buy_X) {
            return sendBuyAmountInputPage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.Sell_X) {
            return sendSellPercentInputPage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.RefreshHome) {
            return updateHomePage(
                query.message.chat.id,
                query.message.message_id
            );
        }

        if (query.data === CallbackDataType.ChangeMaxSlippage) {
            return sendMaxSlippageInputPage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.CreateLimitOrder) {
            return sendLimitOrderPage(query.message.chat.id);
        }
    }
};
