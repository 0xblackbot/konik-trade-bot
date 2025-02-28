import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {OrderSide} from '../enums/order-side.enum';
import {BOT} from '../globals';
import {send404Page} from './404.page';
import {getBestRoute} from '../utils/best-route.utils';
import {formatOutputNumber} from '../utils/format.utils';
import {getAssetPrice} from '../utils/price.utils';
import {getInputOutputAssets, saveLastPage} from '../utils/ui-state.utils';
import {CLOSE_BUTTON} from './buttons/close.button';

export const sendLimitOrderTargetPricePage = async (
    chatId: number,
    side: OrderSide,
    inputAssetAmount: bigint
) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

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

    const sideText = side === OrderSide.Buy ? 'Buy' : 'Sell';

    const currentPriceSymbol =
        side === OrderSide.Buy ? inputAsset.symbol : outputAsset.symbol;

    const currentPrice = getAssetPrice(
        side,
        bestRoute.displayData.inputAssetAmount,
        bestRoute.displayData.outputAssetAmount
    );

    /** update ui state */
    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        limitOrder: {
            side,
            inputAssetAmount: inputAssetAmount.toString(),
            currentPrice,
            currentPriceSymbol,
            currentOutputAssetAmount: bestRoute.displayData.outputAssetAmount,
            targetOutputAssetAmount: undefined,
            targetPrice: undefined
        }
    });

    const newMessage = await BOT.sendMessage(
        chatId,
        `Creating <b>${sideText} Limit Order: ${formatOutputNumber(bestRoute.displayData.inputAssetAmount)} ${inputAsset.symbol}</b>\n` +
            '\n' +
            'Enter your desired price, or select one of the buttons below\n' +
            '\n' +
            `Market: <b>${formatOutputNumber(bestRoute.displayData.inputAssetAmount)} ${inputAsset.symbol} = ${formatOutputNumber(bestRoute.displayData.outputAssetAmount)} ${outputAsset.symbol}</b>\n` +
            `Current price: <b>${formatOutputNumber(currentPrice)} ${currentPriceSymbol}</b>`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:
                    side === OrderSide.Buy
                        ? [
                              [
                                  {
                                      text: '-5% Price',
                                      callback_data:
                                          CallbackDataType.Price_minus5
                                  },
                                  {
                                      text: '-10% Price',
                                      callback_data:
                                          CallbackDataType.Price_minus10
                                  },
                                  {
                                      text: '-20% Price',
                                      callback_data:
                                          CallbackDataType.Price_minus20
                                  }
                              ],
                              [
                                  {
                                      text: '-30% Price',
                                      callback_data:
                                          CallbackDataType.Price_minus30
                                  },
                                  {
                                      text: '-40% Price',
                                      callback_data:
                                          CallbackDataType.Price_minus40
                                  },
                                  {
                                      text: '-50% Price',
                                      callback_data:
                                          CallbackDataType.Price_minus50
                                  }
                              ],
                              [
                                  {
                                      text: 'Custom Price Target',
                                      callback_data:
                                          CallbackDataType.LimitOrderTargetPrice
                                  }
                              ],
                              CLOSE_BUTTON
                          ]
                        : [
                              [
                                  {
                                      text: '+20% Price',
                                      callback_data:
                                          CallbackDataType.Price_plus20
                                  },
                                  {
                                      text: '+50% Price',
                                      callback_data:
                                          CallbackDataType.Price_plus50
                                  },
                                  {
                                      text: '+70% Price',
                                      callback_data:
                                          CallbackDataType.Price_plus70
                                  }
                              ],
                              [
                                  {
                                      text: '+100% Price',
                                      callback_data:
                                          CallbackDataType.Price_plus100
                                  },
                                  {
                                      text: '+200% Price',
                                      callback_data:
                                          CallbackDataType.Price_plus200
                                  },
                                  {
                                      text: '+300% Price',
                                      callback_data:
                                          CallbackDataType.Price_plus300
                                  }
                              ],
                              [
                                  {
                                      text: 'Custom Price Target',
                                      callback_data:
                                          CallbackDataType.LimitOrderTargetPrice
                                  }
                              ],
                              CLOSE_BUTTON
                          ]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
