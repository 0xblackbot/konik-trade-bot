import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT, LITE_CLIENT, TON} from '../../globals';
import {getAssetBalance} from '../../utils/asset.utils';
import {fromNano, toNano} from '../../utils/balance.utils';
import {formatOutputNumber} from '../../utils/format.utils';
import {saveInputPage} from '../../utils/ui-state.utils';
import {getWallet} from '../../utils/wallet.utils';
import {sendEmptyAssetBalancePage} from '../empty-asset-balance.page';

export const TON_WITHDRAW_GAS_FEE = toNano('0.01', 9);

export const sendWithdrawTonAmountInputPage = async (chatId: number) => {
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
    if (inputAssetBalance === 0n || inputAssetBalance < TON_WITHDRAW_GAS_FEE) {
        return sendEmptyAssetBalancePage(
            chatId,
            inputAsset.symbol,
            wallet.address.toString()
        );
    }

    const maxInputAmount = fromNano(
        inputAssetBalance - TON_WITHDRAW_GAS_FEE,
        inputAsset.decimals
    );

    const newMessage = await BOT.sendMessage(
        chatId,
        `Enter the desired <b>amount of ${inputAsset.symbol}</b> you want to withdraw (0 - ${formatOutputNumber(maxInputAmount)} ${inputAsset.symbol}, Example: 2.5):`,
        {parse_mode: 'HTML', reply_markup: {force_reply: true}}
    );

    await saveInputPage(chatId, InputTypeEnum.WithdrawTonAmount, newMessage);
};
