import {TON} from '../globals';
import {sendErrorPage} from './error.page';

export const sendEmptyAssetBalancePage = (
    chatId: number,
    assetSymbol: string,
    walletAddress: string
) => {
    const text =
        assetSymbol == TON
            ? `You have got 0 TON.\n` +
              `You need to deposit TON on your wallet and try again.\n` +
              `\n` +
              `<code>${walletAddress}</code> (tap to copy)`
            : `You have got 0 ${assetSymbol}.\n` +
              `Please check your ${assetSymbol} balance and try again.`;

    return sendErrorPage(chatId, text);
};
