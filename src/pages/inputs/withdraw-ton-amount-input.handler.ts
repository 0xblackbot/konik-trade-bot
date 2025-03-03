import {isDefined} from '@rnw-community/shared';

import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {BOT, LITE_CLIENT, TON} from '../../globals';
import {getAssetBalance} from '../../utils/asset.utils';
import {fromNano, toNano} from '../../utils/balance.utils';
import {formatOutputNumber} from '../../utils/format.utils';
import {getWallet} from '../../utils/wallet.utils';
import {send404Page} from '../404.page';
import {sendErrorPage} from '../error.page';
import {TON_WITHDRAW_GAS_FEE} from './withdraw-ton-amount-input.page';

export const withdrawTonAmountInputHandler = async (
    chatId: number,
    messageText: string
) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (!isDefined(uiState.withdrawRequest?.recipientAddress)) {
        return send404Page(chatId);
    }

    const inputAmount = parseFloat(messageText);

    if (isNaN(inputAmount)) {
        return sendErrorPage(
            chatId,
            'Invalid amount. Press button and try again.'
        );
    }

    const inputAssetBalance = await getAssetBalance(TON, wallet.address);
    const maxInputAmount = fromNano(
        inputAssetBalance - TON_WITHDRAW_GAS_FEE,
        9
    );

    if (inputAmount <= 0 || inputAmount > maxInputAmount) {
        return sendErrorPage(
            chatId,
            `Number out of range (0 - ${formatOutputNumber(maxInputAmount)}). Press button and try again.`
        );
    }

    const transferBoc = await wallet.createTransferBoc([
        {
            address: uiState.withdrawRequest.recipientAddress,
            amount: toNano(inputAmount.toString(), 9).toString()
        }
    ]);
    const bocHash = await wallet.sendBoc(transferBoc);

    const explorerLink = `https://tonviewer.com/transaction/${bocHash}`;
    const explorerText = `<a href="${explorerLink}">View on Tonviewer</a>`;

    return BOT.sendMessage(
        chatId,
        `<b>${formatOutputNumber(inputAmount)} TON</b> withdrawal transaction sent: ${explorerText}\n`,
        {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        }
    );
};
