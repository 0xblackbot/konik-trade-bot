import {RedisSettingsService} from '../../classes/redis-settings.service';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {CallbackDataType} from '../../enums/callback-data-type.enum';
import {OrderSide} from '../../enums/order-side.enum';
import {BOT, LITE_CLIENT, TON} from '../../globals';
import {getAssetBalance} from '../../utils/asset.utils';
import {fromNano} from '../../utils/balance.utils';
import {getBestRoute} from '../../utils/best-route.utils';
import {formatOutputNumber} from '../../utils/format.utils';
import {getNanoTonSendAmount} from '../../utils/message.utils';
import {getInputOutputAssets, saveLastPage} from '../../utils/ui-state.utils';
import {getWallet} from '../../utils/wallet.utils';
import {send404Page} from '../404.page';
import {sendErrorPage} from '../error.page';

export const sendMarketOrderConfirmationPage = async (
    chatId: number,
    side: OrderSide,
    inputAssetAmount: bigint
) => {
    await LITE_CLIENT.updateLastBlock();
    const uiState = await RedisUiStateService.getUiState(chatId);

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        marketOrder: {
            side,
            inputAssetAmount: inputAssetAmount.toString()
        }
    });

    const wallet = await getWallet(chatId);
    const settings = await RedisSettingsService.getSettings(chatId);
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

    const newMessage = await BOT.sendMessage(
        chatId,
        `<b>Market Order</b>\n` +
            `\n` +
            `Details: <b>${formatOutputNumber(bestRoute.displayData.inputAssetAmount)} ${inputAsset.symbol} to ${formatOutputNumber(bestRoute.displayData.outputAssetAmount)} ${outputAsset.symbol}</b>\n` +
            `\n` +
            `Max slippage: <b>${formatOutputNumber(settings.maxSlippage)}%</b>\n` +
            `Gas fee: <b>~${formatOutputNumber(bestRoute.displayData.roughGasFee)} TON ($${formatOutputNumber(bestRoute.displayData.roughGasUsdFee)})</b>\n`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '❌ Cancel',
                            callback_data:
                                CallbackDataType.CreateMarketOrderCancel
                        },
                        {
                            text: '✅ Confirm',
                            callback_data:
                                CallbackDataType.CreateMarketOrderConfirm
                        }
                    ]
                ]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
