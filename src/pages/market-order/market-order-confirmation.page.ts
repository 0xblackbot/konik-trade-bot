import {isDefined} from '@rnw-community/shared';

import {RedisSettingsService} from '../../classes/redis-settings.service';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {CallbackDataType} from '../../enums/callback-data-type.enum';
import {OrderSide} from '../../enums/order-side.enum';
import {BOT, LITE_CLIENT} from '../../globals';
import {getInputOutputAssets} from '../../utils/asset.utils';
import {getBestRoute} from '../../utils/best-route.utils';
import {formatOutputNumber} from '../../utils/format.utils';
import {saveLastPage} from '../../utils/ui-state.utils';
import {getGasValidationError} from '../../utils/validation.utils';
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

    const settings = await RedisSettingsService.getSettings(chatId);
    const {inputAsset, outputAsset} = getInputOutputAssets(
        side,
        uiState.selectedToken
    );
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
    const error = await getGasValidationError(chatId, bestRoute);

    if (isDefined(error)) {
        return sendErrorPage(chatId, error);
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
