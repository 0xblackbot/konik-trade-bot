import {LITE_CLIENT, TON} from '../../globals';
import {createMarketBuyOrder} from '../../orders/market/market-buy.order';
import {getAssetBalance} from '../../utils/asset.utils';
import {fromNano, toNano} from '../../utils/balance.utils';
import {formatOutputNumber} from '../../utils/format.utils';
import {getWallet} from '../../utils/wallet.utils';
import {sendErrorPage} from '../error.page';

export const marketBuyAmountInputHandler = async (
    chatId: number,
    messageText: string
) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);

    const inputAmount = parseFloat(messageText);

    if (isNaN(inputAmount)) {
        return sendErrorPage(
            chatId,
            'Invalid amount. Press button and try again.'
        );
    }

    const inputAssetBalance = await getAssetBalance(TON, wallet.address);
    const maxInputAmount = fromNano(inputAssetBalance, 9);

    if (inputAmount < 0 || inputAmount > maxInputAmount) {
        return sendErrorPage(
            chatId,
            `Number out of range (0 - ${formatOutputNumber(maxInputAmount)}). Press button and try again.`
        );
    }

    return createMarketBuyOrder(chatId, toNano(inputAmount.toString(), 9));
};
