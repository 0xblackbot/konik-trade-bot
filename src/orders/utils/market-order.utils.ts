import {isDefined} from '@rnw-community/shared';
import {SwapStatusEnum} from 'rainbow-swap-sdk';

import {RedisOrderHistoryService} from '../../classes/redis-orders-history.service';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {OrderSide} from '../../enums/order-side.enum';
import {BOT, LITE_CLIENT} from '../../globals';
import {send404Page} from '../../pages/404.page';
import {getMarketOrderPageText} from '../../pages/market-order/market-order.page';
import {getBestRoute} from '../../utils/best-route.utils';
import {getInputOutputAssets, saveLastPage} from '../../utils/ui-state.utils';
import {getWallet} from '../../utils/wallet.utils';

export const createMarketOrder = async (chatId: number) => {
    await LITE_CLIENT.updateLastBlock();

    const uiState = await RedisUiStateService.getUiState(chatId);

    if (
        !isDefined(uiState.marketOrder?.side) ||
        !isDefined(uiState.marketOrder.inputAssetAmount)
    ) {
        return send404Page(chatId);
    }

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        marketOrder: undefined
    });

    const wallet = await getWallet(chatId);
    const {inputAsset, outputAsset} = await getInputOutputAssets(
        chatId,
        uiState.marketOrder.side
    );
    const bestRoute = await getBestRoute(
        chatId,
        BigInt(uiState.marketOrder.inputAssetAmount),
        inputAsset.address,
        outputAsset.address
    );

    if (bestRoute.displayData.routes.length === 0) {
        return send404Page(chatId);
    }

    const transferBoc = await wallet.createTransferBoc(bestRoute.swapMessages);
    const bocHash = await wallet.sendBoc(transferBoc);

    const newMessage = await BOT.sendMessage(
        chatId,
        getMarketOrderPageText(
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

    await saveLastPage(chatId);

    await RedisOrderHistoryService.addPendingTransaction({
        bocHash,
        chatId,
        messageId: newMessage.message_id,
        expectedMessageCount: bestRoute.messageCount,
        assetAddress:
            uiState.marketOrder.side === OrderSide.Buy
                ? outputAsset.address
                : inputAsset.address
    });
};
