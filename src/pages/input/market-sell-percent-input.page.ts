import {isDefined} from '@rnw-community/shared';

import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT, LITE_CLIENT} from '../../globals';
import {getAssetBalance} from '../../utils/asset.utils';
import {deleteMessageSafe} from '../../utils/bot.utils';
import {getWallet} from '../../utils/wallet.utils';
import {send404Page} from '../404.page';
import {sendEmptyAssetBalancePage} from '../empty-asset-balance.page';

export const sendMarketSellPercentInputPage = async (chatId: number) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (!isDefined(uiState?.selectedToken)) {
        return send404Page(chatId);
    }

    const inputAsset = {
        address: uiState.selectedToken.data.address,
        symbol: uiState.selectedToken.data.symbol
    };

    const inputAssetBalance = await getAssetBalance(
        inputAsset.address,
        wallet.address
    );

    /** check balance */
    if (inputAssetBalance === 0n) {
        return sendEmptyAssetBalancePage(
            chatId,
            inputAsset.symbol,
            wallet.address.toString()
        );
    }

    const newMessage = await BOT.sendMessage(
        chatId,
        `Reply with the amount you wish to sell (0 - 100 %, Example: 25.5):`,
        {reply_markup: {force_reply: true}}
    );

    if (isDefined(uiState?.inputRequest)) {
        await deleteMessageSafe(chatId, uiState.inputRequest.messageId);
    }

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        inputRequest: {
            type: InputTypeEnum.MarketSellPercent,
            messageId: newMessage.message_id
        }
    });
};
