import {isDefined} from '@rnw-community/shared';

import {send404Page} from './404.page';
import {RedisLimitOrdersService} from '../classes/redis-limit-orders.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {OrderSide} from '../enums/order-side.enum';
import {BOT} from '../globals';
import {LimitOrder} from '../orders/interfaces/limit-order.interface';
import {fromNano} from '../utils/balance.utils';
import {formatOutputNumber} from '../utils/format.utils';
import {saveLastPage} from '../utils/ui-state.utils';
import {CLOSE_BUTTON} from './buttons/close.button';

export const getLimitOrderText = (order: LimitOrder) => {
    if (order.side === OrderSide.Buy) {
        const inputAmount = fromNano(BigInt(order.inputAssetAmount), 9);

        return (
            `<b>Buy Limit Order</b>\n` +
            `<b>${order.asset.symbol}</b> - ${order.asset.name} - <code>${order.asset.address}</code>\n` +
            `\n` +
            `Details: <b>${formatOutputNumber(inputAmount)} TON to ${formatOutputNumber(order.targetOutputAssetAmount)} ${order.asset.symbol}</b>\n` +
            `Target price: <b>${formatOutputNumber(order.targetPrice)} TON</b>\n`
        );
    } else {
        const inputAmount = fromNano(
            BigInt(order.inputAssetAmount),
            order.asset.decimals
        );

        return (
            `<b>Sell Limit Order</b>\n` +
            `<b>${order.asset.symbol}</b> - ${order.asset.name} - <code>${order.asset.address}</code>\n` +
            `\n` +
            `Details: <b>${formatOutputNumber(inputAmount)} ${order.asset.symbol} to ${formatOutputNumber(order.targetOutputAssetAmount)} TON</b>\n` +
            `Target price: <b>${formatOutputNumber(order.targetPrice)} TON</b>\n`
        );
    }
};

export const sendLimitOrderPage = async (chatId: number, orderId: string) => {
    const key = `${chatId}_${orderId}`;
    const order = await RedisLimitOrdersService.getLimitOrder(key);

    if (!isDefined(order)) {
        return send404Page(chatId);
    }

    const text = getLimitOrderText(order);

    const newMessage = await BOT.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Cancel Order',
                        callback_data: `${CallbackDataType.CancelLimitOrder}${order.id}`
                    }
                ],
                CLOSE_BUTTON
            ]
        }
    });

    await saveLastPage(chatId, newMessage);
};
