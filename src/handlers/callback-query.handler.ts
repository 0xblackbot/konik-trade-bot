import {TelegramEvents} from 'node-telegram-bot-api';

import {CallbackDataType} from '../enums/callback-data-type.enum';
import {OrderSide} from '../enums/order-side.enum';
import {OrderType} from '../enums/order-type.enum';
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
import {saveOrderType} from '../utils/ui-state.utils';

export const callbackQueryHandler: TelegramEvents['callback_query'] =
    async query => {
        if (query.message) {
            const chatId = query.message.chat.id;

            if (query.data === CallbackDataType.Help) {
                return sendHelpPage(chatId);
            }

            if (query.data === CallbackDataType.Close) {
                return deleteMessageSafe(chatId, query.message.message_id);
            }

            if (
                query.data?.startsWith(CallbackDataType.MarketBuy) ||
                query.data?.startsWith(CallbackDataType.MarketSell)
            ) {
                await saveOrderType(chatId, OrderType.Market);
            }

            if (
                query.data?.startsWith(CallbackDataType.LimitBuy) ||
                query.data?.startsWith(CallbackDataType.LimitSell)
            ) {
                await saveOrderType(chatId, OrderType.Limit);
            }

            if (
                query.data?.startsWith(CallbackDataType.MarketBuy) ||
                query.data?.startsWith(CallbackDataType.LimitBuy)
            ) {
                const orderType = query.data?.startsWith(
                    CallbackDataType.MarketBuy
                )
                    ? OrderType.Market
                    : OrderType.Limit;
                const rawAmount = query.data.slice(
                    orderType === OrderType.Market
                        ? CallbackDataType.MarketBuy.length
                        : CallbackDataType.LimitBuy.length
                );

                if (rawAmount === 'X') {
                    return sendBuyAmountInputPage(chatId);
                } else {
                    return processOrderInputAmount(
                        chatId,
                        orderType,
                        OrderSide.Buy,
                        toNano(rawAmount, 9)
                    );
                }
            }

            if (
                query.data?.startsWith(CallbackDataType.MarketSell) ||
                query.data?.startsWith(CallbackDataType.LimitSell)
            ) {
                const orderType = query.data?.startsWith(
                    CallbackDataType.MarketSell
                )
                    ? OrderType.Market
                    : OrderType.Limit;
                const rawAmount = query.data.slice(
                    orderType === OrderType.Market
                        ? CallbackDataType.MarketSell.length
                        : CallbackDataType.LimitSell.length
                );

                if (rawAmount === 'X') {
                    return sendSellPercentInputPage(chatId);
                } else {
                    return processOrderSellPercentAmount(
                        chatId,
                        orderType,
                        Number(rawAmount)
                    );
                }
            }

            if (query.data === CallbackDataType.DCAOrders) {
                return sendUnavailablePage(chatId);
            }

            if (query.data === CallbackDataType.LimitOrders) {
                return sendLimitOrdersPage(chatId);
            }

            if (query.data?.startsWith(CallbackDataType.LimitOrder)) {
                const orderId = query.data.slice(
                    CallbackDataType.LimitOrder.length
                );

                return sendLimitOrderPage(chatId, orderId);
            }

            if (query.data?.startsWith(CallbackDataType.CancelLimitOrder)) {
                const orderId = query.data.slice(
                    CallbackDataType.CancelLimitOrder.length
                );

                return cancelLimitOrder(chatId, Number(orderId));
            }

            if (query.data === CallbackDataType.BuyAndSell) {
                return sendBuySellPage(chatId);
            }

            if (query.data === CallbackDataType.Settings) {
                return sendSettingsPage(chatId);
            }

            if (query.data === CallbackDataType.ExportSeedPhrase) {
                return sendSeepPhraseWarning(chatId);
            }

            if (query.data === CallbackDataType.RefreshHome) {
                return updateHomePage(chatId, query.message.message_id);
            }

            if (query.data === CallbackDataType.ChangeMaxSlippage) {
                return sendMaxSlippageInputPage(chatId);
            }

            if (query.data === CallbackDataType.CreateLimitOrder) {
                return sendLimitOrderInputAmountPage(chatId);
            }

            if (query.data === CallbackDataType.CreateLimitOrderCancel) {
                return sendLimitOrderCanceledPage(chatId);
            }

            if (query.data === CallbackDataType.CreateLimitOrderConfirm) {
                return sendLimitOrderConfirmationConfirmPage(chatId);
            }

            if (query.data === CallbackDataType.LimitOrderTargetPrice) {
                return sendLimitOrderTargetPricePage(chatId);
            }

            if (query.data?.startsWith(CallbackDataType.PriceChange)) {
                const rawAmount = query.data.slice(
                    CallbackDataType.PriceChange.length
                );

                return processTargetPercentPriceChange(
                    chatId,
                    Number(rawAmount)
                );
            }
        }
    };
