import {CallbackDataType} from '../../enums/callback-data-type.enum';
import {OrderSide} from '../../enums/order-side.enum';
import {BOT} from '../../globals';
import {fromNano} from '../../utils/balance.utils';
import {formatOutputNumber} from '../../utils/format.utils';
import {getUserActiveLimitOrders} from '../../utils/order-utils/limit-order.utils';
import {saveLastPage} from '../../utils/ui-state.utils';
import {CLOSE_BUTTON} from '../buttons/close.button';

export const sendLimitOrdersPage = async (chatId: number) => {
    const orders = await getUserActiveLimitOrders(chatId);

    const newMessage = await BOT.sendMessage(
        chatId,
        orders.length === 0
            ? `<b>You don’t have any limit orders!</b>\n` +
                  '\n' +
                  'To create one, <b>enter a token address</b> and press the <b>Create Limit Order</b> button.'
            : 'Your limit orders:\n',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    ...orders.map(order => {
                        const callback_data = `${CallbackDataType.LimitOrder}${order.id}`;

                        if (order.side === OrderSide.Buy) {
                            const inputAmount = fromNano(
                                BigInt(order.inputAssetAmount),
                                9
                            );

                            const text = `Buy ${formatOutputNumber(order.targetOutputAssetAmount)} ${order.asset.symbol} for ${formatOutputNumber(inputAmount)} TON`;

                            return [{text, callback_data}];
                        } else {
                            const inputAmount = fromNano(
                                BigInt(order.inputAssetAmount),
                                order.asset.decimals
                            );

                            const text = `Sell ${formatOutputNumber(inputAmount)} ${order.asset.symbol} for ${formatOutputNumber(order.targetOutputAssetAmount)} TON`;

                            return [{text, callback_data}];
                        }
                    }),
                    [CLOSE_BUTTON]
                ]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
