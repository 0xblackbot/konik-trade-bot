import {Address} from '@ton/core';
import {Message} from 'node-telegram-bot-api';
import {Asset} from 'rainbow-swap-sdk';

import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {OrderType} from '../enums/order-type.enum';
import {BOT, LITE_CLIENT, TON} from '../globals';
import {sendErrorPage} from './error.page';
import {getAsset} from '../utils/api.utils';
import {getAssetBalance} from '../utils/asset.utils';
import {fromNano} from '../utils/balance.utils';
import {deleteMessageSafe} from '../utils/bot.utils';
import {formatOutputNumber} from '../utils/format.utils';
import {getWallet} from '../utils/wallet.utils';

export const sendTokenPage = async (message: Message) =>
    sendTokenPageInfo(message).catch(error => {
        console.log('error while sendTokenPageInfo', error);

        return sendErrorPage(
            message.chat.id,
            `Token not found. Make sure address <b>(${message.text})</b> is correct.\n` +
                'If you are trying to enter a buy or sell amount, ensure you click and reply to the message.'
        );
    });

const sendTokenPageInfo = async (message: Message) => {
    const messageText = message.text?.trim() ?? '';
    const tokenAddress = Address.parse(messageText).toRawString();

    const asset = await getAsset(tokenAddress);

    if (!asset) {
        throw new Error(`Asset not found ${tokenAddress}`);
    }

    const wallet = await getWallet(message.chat.id);

    await LITE_CLIENT.updateLastBlock();

    const [tonBalance, assetBalance] = await Promise.all([
        getAssetBalance(TON, wallet.address),
        getAssetBalance(asset.address, wallet.address)
    ]);

    const displayData = {
        explorerLink: `https://tonviewer.com/${asset.address}`,
        chartLink: `https://dexscreener.com/ton/${asset.address}`,
        prices: getPricesDisplayData(asset),
        tonBalance: formatOutputNumber(fromNano(tonBalance, 9)),
        assetBalance: formatOutputNumber(fromNano(assetBalance, asset.decimals))
    };

    const newMessage = await BOT.sendMessage(
        message.chat.id,
        `<b>${asset.symbol}</b> - ${asset.name} - <code>${asset.address}</code>\n` +
            '\n' +
            `<a href="${displayData.explorerLink}">Explorer</a> | <a href="${displayData.chartLink}">Chart</a>\n` +
            '\n' +
            `<b>Prices:</b>\n` +
            `${displayData.prices}\n` +
            '\n' +
            '<b>Wallet balances:</b>\n' +
            `  ${displayData.tonBalance} TON\n` +
            `  ${displayData.assetBalance} ${asset.symbol}\n` +
            '\n' +
            'To buy press one of the buttons below.',
        {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Buy 10 TON',
                            callback_data: CallbackDataType.Buy_10
                        },
                        {
                            text: 'Sell 50%',
                            callback_data: CallbackDataType.Sell_50
                        }
                    ],
                    [
                        {
                            text: 'Buy 100 TON',
                            callback_data: CallbackDataType.Buy_100
                        },
                        {
                            text: 'Sell 100%',
                            callback_data: CallbackDataType.Sell_100
                        }
                    ],
                    [
                        {
                            text: 'Buy X TON',
                            callback_data: CallbackDataType.Buy_X
                        },
                        {
                            text: 'Sell X %',
                            callback_data: CallbackDataType.Sell_X
                        }
                    ],
                    [
                        {
                            text: 'Create Limit Order 📈',
                            callback_data: CallbackDataType.CreateLimitOrder
                        }
                    ],
                    [{text: 'Close', callback_data: CallbackDataType.Close}]
                ]
            }
        }
    );

    /** save the last selected token to be able to create order */
    const uiState = await RedisUiStateService.getUiState(message.chat.id);

    /** clear previous input/token messages */
    await Promise.all([
        deleteMessageSafe(
            message.chat.id,
            uiState?.selectedToken?.tokenPageMessageId
        ),
        deleteMessageSafe(
            message.chat.id,
            uiState?.selectedToken?.limitOrderPageMessageId
        ),
        deleteMessageSafe(message.chat.id, uiState?.inputRequest?.messageId)
    ]);

    /** update ui state */
    await RedisUiStateService.setUiState(message.chat.id, {
        ...uiState,
        selectedToken: {
            data: asset,
            orderType: OrderType.Market,
            tokenPageMessageId: newMessage.message_id,
            limitOrderPageMessageId: undefined
        },
        inputRequest: undefined
    });
};

const getPricesDisplayData = (asset: Asset) => {
    const assetToUsdExchangeRate = asset.usdExchangeRate;
    const usdToAssetExchangeRate = 1 / assetToUsdExchangeRate;

    const tonToAssetExchangeRate = fromNano(
        BigInt(asset.exchangeRate),
        asset.decimals
    );
    const assetToTonExchangeRate = 1 / tonToAssetExchangeRate;

    return (
        `  1 ${asset.symbol} = $${formatOutputNumber(assetToUsdExchangeRate)} / $1 = ${formatOutputNumber(
            usdToAssetExchangeRate
        )} ${asset.symbol}\n` +
        `  1 ${asset.symbol} = ${formatOutputNumber(assetToTonExchangeRate)} TON / 1 TON = ${formatOutputNumber(
            tonToAssetExchangeRate
        )} ${asset.symbol}`
    );
};
