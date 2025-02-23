import {Address} from '@ton/core';
import {Message} from 'node-telegram-bot-api';
import {Asset} from 'rainbow-swap-sdk';

import {ButtonType} from '../enums/button-type.enum';
import {BOT, LITE_CLIENT} from '../globals';
import {getAsset} from '../utils/api.utils';
import {fromNano} from '../utils/balance.utils';
import {formatOutputNumber} from '../utils/format.utils';
import {getJettonBalance} from '../utils/jetton.utils';

export const sendTokenPage = async (message: Message) =>
    sendTokenPageInfo(message).catch(() =>
        BOT.sendMessage(
            message.chat.id,
            `Token not found. Make sure address *(${message.text})* is correct.\n` +
                'If you are trying to enter a buy or sell amount, ensure you click and reply to the message.',
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Close', callback_data: ButtonType.Close}]
                    ]
                }
            }
        )
    );

const sendTokenPageInfo = async (message: Message) => {
    const messageText = message.text?.trim() ?? '';
    const tokenAddress = Address.parse(messageText).toRawString();

    const asset = await getAsset(tokenAddress);

    if (!asset) {
        throw new Error(`Asset not found ${tokenAddress}`);
    }

    await LITE_CLIENT.updateLastBlock();
    const walletAddress = Address.parse(
        'UQCIOI01FJKvUHqUNF-c1BGytouH5HdeOPHCgyk2ddK1Y8oZ'
    );

    const [tonBalance, assetBalance] = await Promise.all([
        LITE_CLIENT.getBalance(walletAddress),
        getJettonBalance(asset.address, walletAddress)
    ]);

    const displayData = {
        explorerLink: `https://tonviewer.com/${asset.address}`,
        chartLink: `https://dexscreener.com/ton/${asset.address}`,
        prices: getPricesDisplayData(asset),
        tonBalance: formatOutputNumber(fromNano(tonBalance, 9)),
        assetBalance: formatOutputNumber(fromNano(assetBalance, asset.decimals))
    };

    return BOT.sendMessage(
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
                    [{text: 'Close', callback_data: ButtonType.Close}]
                ]
            }
        }
    );
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
        `  1 ${asset.symbol} = $${formatOutputNumber(assetToUsdExchangeRate)} / $1 = ${formatOutputNumber(usdToAssetExchangeRate)} ${asset.symbol}\n` +
        `  1 ${asset.symbol} = ${formatOutputNumber(assetToTonExchangeRate)} TON / 1 TON = ${formatOutputNumber(tonToAssetExchangeRate)} ${asset.symbol}`
    );
};
