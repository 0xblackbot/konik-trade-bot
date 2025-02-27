import {isDefined} from '@rnw-community/shared';

import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT, LITE_CLIENT, TON} from '../../globals';
import {getAssetBalance} from '../../utils/asset.utils';
import {fromNano} from '../../utils/balance.utils';
import {deleteMessageSafe} from '../../utils/bot.utils';
import {formatOutputNumber} from '../../utils/format.utils';
import {getWallet} from '../../utils/wallet.utils';
import {sendEmptyAssetBalancePage} from '../empty-asset-balance.page';

export const sendMarketBuyAmountInputPage = async (chatId: number) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);

    const inputAsset = {
        address: TON,
        symbol: TON,
        decimals: 9
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

    const maxInputAmount = fromNano(inputAssetBalance, inputAsset.decimals);

    const newMessage = await BOT.sendMessage(
        chatId,
        `Reply with the amount you wish to buy (0 - ${formatOutputNumber(maxInputAmount)} ${inputAsset.symbol}, Example: 2.5):`,
        {reply_markup: {force_reply: true}}
    );

    const uiState = await RedisUiStateService.getUiState(chatId);

    if (isDefined(uiState?.inputRequest)) {
        await deleteMessageSafe(chatId, uiState.inputRequest.messageId);
    }

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        inputRequest: {
            type: InputTypeEnum.MarketBuyAmount,
            messageId: newMessage.message_id
        }
    });
};
