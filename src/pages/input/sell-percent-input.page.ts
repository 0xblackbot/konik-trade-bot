import {isDefined} from '@rnw-community/shared';

import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT, LITE_CLIENT} from '../../globals';
import {getAssetBalance} from '../../utils/asset.utils';
import {saveInputPage} from '../../utils/ui-state.utils';
import {getWallet} from '../../utils/wallet.utils';
import {send404Page} from '../404.page';
import {sendEmptyAssetBalancePage} from '../empty-asset-balance.page';

export const sendSellPercentInputPage = async (chatId: number) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (!isDefined(uiState.selectedToken)) {
        return send404Page(chatId);
    }

    const inputAsset = {
        address: uiState.selectedToken.address,
        symbol: uiState.selectedToken.symbol
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
        `Enter the desired <b>% of ${inputAsset.symbol}</b> you want to sell (0 - 100 %, Example: 25.5):`,
        {parse_mode: 'HTML', reply_markup: {force_reply: true}}
    );

    await saveInputPage(chatId, InputTypeEnum.SellPercent, newMessage);
};
