import {TelegramEvents} from 'node-telegram-bot-api';

import {CallbackDataType} from '../enums/callback-data-type.enum';
import {OrderSide} from '../enums/order-side.enum';
import {cancelLimitOrder} from '../orders/utils/limit-order.utils';
import {processOrderInputAmount} from '../orders/utils/order-input-amount.utils';
import {processTargetPercentPriceChange} from '../orders/utils/percent-price-change.utils';
import {processOrderSellPercentAmount} from '../orders/utils/sell-percent-input.utils';
import {sendBuySellPage} from '../pages/buy-n-sell.page';
import {sendHelpPage} from '../pages/help.page';
import {updateHomePage} from '../pages/home.page';
import {sendBuyAmountInputPage} from '../pages/input/buy-amount-input.page';
import {sendLimitOrderTargetPricePage} from '../pages/input/limit-order-target-price.page';
import {sendMaxSlippageInputPage} from '../pages/input/max-slippage-input.page';
import {sendSellPercentInputPage} from '../pages/input/sell-percent-input.page';
import {sendLimitOrderCanceledPage} from '../pages/limit-order-canceled.page';
import {sendLimitOrderConfirmationConfirmPage} from '../pages/limit-order-confirmation-confirm.page';
import {sendLimitOrderInputAmountPage} from '../pages/limit-order-input-amount.page';
import {sendLimitOrderPage} from '../pages/limit-order.page';
import {sendLimitOrdersPage} from '../pages/limit-orders.page';
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

        if (query.data === CallbackDataType.DCAOrders) {
            return sendUnavailablePage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.LimitOrders) {
            return sendLimitOrdersPage(query.message.chat.id);
        }

        if (query.data?.startsWith(CallbackDataType.LimitOrder)) {
            const orderId = query.data.slice(
                CallbackDataType.LimitOrder.length
            );

            return sendLimitOrderPage(query.message.chat.id, orderId);
        }

        if (query.data?.startsWith(CallbackDataType.CancelLimitOrder)) {
            const orderId = query.data.slice(
                CallbackDataType.CancelLimitOrder.length
            );

            return cancelLimitOrder(query.message.chat.id, Number(orderId));
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
            return sendLimitOrderInputAmountPage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.CreateLimitOrderCancel) {
            return sendLimitOrderCanceledPage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.CreateLimitOrderConfirm) {
            return sendLimitOrderConfirmationConfirmPage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.LimitOrderTargetPrice) {
            return sendLimitOrderTargetPricePage(query.message.chat.id);
        }

        if (query.data === CallbackDataType.Price_minus5) {
            return processTargetPercentPriceChange(query.message.chat.id, -5);
        }
        if (query.data === CallbackDataType.Price_minus10) {
            return processTargetPercentPriceChange(query.message.chat.id, -10);
        }
        if (query.data === CallbackDataType.Price_minus20) {
            return processTargetPercentPriceChange(query.message.chat.id, -20);
        }
        if (query.data === CallbackDataType.Price_minus30) {
            return processTargetPercentPriceChange(query.message.chat.id, -30);
        }
        if (query.data === CallbackDataType.Price_minus40) {
            return processTargetPercentPriceChange(query.message.chat.id, -40);
        }
        if (query.data === CallbackDataType.Price_minus50) {
            return processTargetPercentPriceChange(query.message.chat.id, -50);
        }

        if (query.data === CallbackDataType.Price_plus20) {
            return processTargetPercentPriceChange(query.message.chat.id, 20);
        }
        if (query.data === CallbackDataType.Price_plus50) {
            return processTargetPercentPriceChange(query.message.chat.id, 50);
        }
        if (query.data === CallbackDataType.Price_plus70) {
            return processTargetPercentPriceChange(query.message.chat.id, 70);
        }
        if (query.data === CallbackDataType.Price_plus100) {
            return processTargetPercentPriceChange(query.message.chat.id, 100);
        }
        if (query.data === CallbackDataType.Price_plus200) {
            return processTargetPercentPriceChange(query.message.chat.id, 200);
        }
        if (query.data === CallbackDataType.Price_plus300) {
            return processTargetPercentPriceChange(query.message.chat.id, 300);
        }
    }
};
