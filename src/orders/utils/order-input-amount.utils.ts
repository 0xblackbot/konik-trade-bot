import {createMarketOrder} from './market-order.utils';
import {OrderSide} from '../../enums/order-side.enum';
import {OrderType} from '../../enums/order-type.enum';
import {LITE_CLIENT} from '../../globals';
import {sendEmptyAssetBalancePage} from '../../pages/empty-asset-balance.page';
import {sendErrorPage} from '../../pages/error.page';
import {sendLimitOrderTargetPricePage} from '../../pages/limit-order-target-price.page';
import {getAssetBalance} from '../../utils/asset.utils';
import {fromNano} from '../../utils/balance.utils';
import {formatOutputNumber} from '../../utils/format.utils';
import {getInputOutputAssets} from '../../utils/ui-state.utils';
import {getWallet} from '../../utils/wallet.utils';

export const processOrderInputAmount = async (
    chatId: number,
    orderType: OrderType,
    side: OrderSide,
    inputAssetAmount: bigint
) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);
    const {inputAsset} = await getInputOutputAssets(chatId, side);
    const inputAssetBalance = await getAssetBalance(
        inputAsset.address,
        wallet.address
    );

    if (inputAssetBalance === 0n) {
        return sendEmptyAssetBalancePage(
            chatId,
            inputAsset.symbol,
            wallet.address.toString()
        );
    }

    if (inputAssetBalance < inputAssetAmount) {
        const balance = fromNano(inputAssetBalance, inputAsset.decimals);

        return sendErrorPage(
            chatId,
            `You don't have enough ${inputAsset.symbol}.\n` +
                `Wallet balance: <b>${formatOutputNumber(balance)} ${inputAsset.symbol}</b>`
        );
    }

    if (orderType === OrderType.Market) {
        return createMarketOrder(chatId, side, inputAssetAmount);
    }

    if (orderType === OrderType.Limit) {
        return sendLimitOrderTargetPricePage(chatId, side, inputAssetAmount);
    }
};
