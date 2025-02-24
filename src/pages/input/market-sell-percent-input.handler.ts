import {LITE_CLIENT} from '../../globals';
import {createMarketSellOrder} from '../../orders/market/market-sell.order';
import {sendErrorPage} from '../error.page';

export const marketSellPercentInputHandler = async (
    chatId: number,
    messageText: string
) => {
    await LITE_CLIENT.updateLastBlock();

    const inputAmount = parseFloat(messageText);

    if (isNaN(inputAmount)) {
        return sendErrorPage(
            chatId,
            'Invalid amount. Press button and try again.'
        );
    }

    if (inputAmount <= 0 || inputAmount > 100) {
        return sendErrorPage(
            chatId,
            `Number out of range (0 - 100). Press button and try again.`
        );
    }

    return createMarketSellOrder(chatId, inputAmount);
};
