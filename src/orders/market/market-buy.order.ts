import {isDefined} from '@rnw-community/shared';
import {getBestRoute, SwapStatusEnum} from 'rainbow-swap-sdk';

import {RedisOrderHistoryService} from '../../classes/redis-orders-history.service';
import {RedisSettingsService} from '../../classes/redis-settings.service';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {BOT, LITE_CLIENT, TON} from '../../globals';
import {send404Page} from '../../pages/404.page';
import {sendErrorPage} from '../../pages/error.page';
import {getOrderPageText} from '../../pages/order.page';
import {RAINBOW_AG_AUTH_HEADER} from '../../secrets';
import {getAssetBalance} from '../../utils/asset.utils';
import {fromNano} from '../../utils/balance.utils';
import {formatOutputNumber} from '../../utils/format.utils';
import {getNanoTonSendAmount} from '../../utils/message.utils';
import {getWallet} from '../../utils/wallet.utils';

export const createMarketBuyOrder = async (
    chatId: number,
    inputAssetAmount: bigint
) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);

    const uiState = await RedisUiStateService.getUiState(chatId);
    const settings = await RedisSettingsService.getSettings(chatId);

    if (!isDefined(uiState?.selectedToken)) {
        return send404Page(chatId);
    }

    const bestRoute = await getBestRoute(
        {
            inputAssetAmount: inputAssetAmount.toString(),
            inputAssetAddress: TON,
            outputAssetAddress: uiState.selectedToken.data.address,
            maxDepth: 1,
            maxSplits: 1,
            senderAddress: wallet.address.toString(),
            maxSlippage: settings.maxSlippage
        },
        RAINBOW_AG_AUTH_HEADER
    );

    if (bestRoute.displayData.routes.length === 0) {
        return send404Page(chatId);
    }

    const nanoTonBalance = await getAssetBalance(TON, wallet.address);

    if (nanoTonBalance < inputAssetAmount) {
        const tonBalance = fromNano(nanoTonBalance, 9);

        return sendErrorPage(
            chatId,
            `You don't have enough TON.\n` +
                `Wallet balance: <b>${formatOutputNumber(tonBalance)} TON</b>`
        );
    }

    const nanoTonSendAmount = getNanoTonSendAmount(bestRoute.swapMessages);

    if (nanoTonBalance < nanoTonSendAmount) {
        const nanoDiff = nanoTonSendAmount - nanoTonBalance;
        const diff = fromNano(nanoDiff, 9);

        return sendErrorPage(
            chatId,
            `Not enough TON to pay gas fees.\n` +
                `You need at least <b>${formatOutputNumber(diff)} TON</b> more.`
        );
    }

    const transferBoc = await wallet.createTransferBoc(bestRoute.swapMessages);
    const bocHash = await wallet.sendBoc(transferBoc);

    const newMessage = await BOT.sendMessage(
        chatId,
        getOrderPageText(
            {
                timestamp: Date.now(),
                bocHash,
                status: SwapStatusEnum.Pending,
                completedMessageCount: 0
            },
            bestRoute.messageCount
        ),
        {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        }
    );

    await RedisOrderHistoryService.addPendingOrder({
        bocHash,
        chatId,
        messageId: newMessage.message_id,
        expectedMessageCount: bestRoute.messageCount,
        assetAddress: uiState.selectedToken.data.address
    });
};
