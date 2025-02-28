import {SwapStatusEnum} from 'rainbow-swap-sdk';

import {RedisOrderHistoryService} from '../../classes/redis-orders-history.service';
import {OrderSide} from '../../enums/order-side.enum';
import {BOT, LITE_CLIENT, TON} from '../../globals';
import {send404Page} from '../../pages/404.page';
import {sendErrorPage} from '../../pages/error.page';
import {getOrderPageText} from '../../pages/order.page';
import {getAssetBalance} from '../../utils/asset.utils';
import {fromNano} from '../../utils/balance.utils';
import {getBestRoute} from '../../utils/best-route.utils';
import {formatOutputNumber} from '../../utils/format.utils';
import {getNanoTonSendAmount} from '../../utils/message.utils';
import {getInputOutputAssets} from '../../utils/ui-state.utils';
import {getWallet} from '../../utils/wallet.utils';

export const createMarketOrder = async (
    chatId: number,
    side: OrderSide,
    inputAssetAmount: bigint
) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);
    const {inputAsset, outputAsset} = await getInputOutputAssets(chatId, side);
    const bestRoute = await getBestRoute(
        chatId,
        inputAssetAmount,
        inputAsset.address,
        outputAsset.address
    );

    if (bestRoute.displayData.routes.length === 0) {
        return send404Page(chatId);
    }

    /** check TON balance */
    const tonBalance = await getAssetBalance(TON, wallet.address);
    const nanoTonSendAmount = getNanoTonSendAmount(bestRoute.swapMessages);

    if (tonBalance < nanoTonSendAmount) {
        const nanoDiff = nanoTonSendAmount - tonBalance;
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
        assetAddress:
            side === OrderSide.Buy ? outputAsset.address : inputAsset.address
    });
};
