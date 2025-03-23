import {Address} from '@ton/core';
import {CallbackQuery} from 'node-telegram-bot-api';
import {Asset} from 'rainbow-swap-sdk';

import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {BOT, LITE_CLIENT, TON} from '../globals';
import {sendErrorPage} from './error.page';
import {RedisSettingsService} from '../classes/redis-settings.service';
import {getAsset} from '../utils/api.utils';
import {getAssetBalance} from '../utils/asset.utils';
import {fromNano} from '../utils/balance.utils';
import {formatFDV, formatOutputNumber} from '../utils/format.utils';
import {saveTokenPage} from '../utils/ui-state.utils';
import {getWallet} from '../utils/wallet.utils';
import {CLOSE_BUTTON} from './buttons/close.button';
import {getPnlText, getStatsText} from './home.page';
import {Settings} from '../interfaces/settings.interface';
import {getShareTokenLink} from '../utils/links.utils';
import {HOME_BUTTON} from './buttons/home.button';
import {getAssetsStatisticsRecord} from '../utils/statistic.utils';

export const updateTokenPage = async (
    chatId: number,
    query: CallbackQuery,
    rawTokenAddress: string
) => {
    const settings = await RedisSettingsService.getSettings(chatId);

    return BOT.editMessageText(
        await getTokenPageMessageText(chatId, rawTokenAddress),
        {
            chat_id: chatId,
            message_id: query.message?.message_id,
            ...getTokenPageOptions(rawTokenAddress, settings)
        }
    ).finally(() => BOT.answerCallbackQuery(query.id, {text: 'Updated'}));
};

export const sendTokenPage = async (chatId: number, messageText: string = '') =>
    sendTokenPageInfo(chatId, messageText).catch(error => {
        console.log('error while sendTokenPageInfo', error);

        return sendErrorPage(
            chatId,
            `Token not found. Make sure address <b>(${messageText})</b> is correct.\n` +
                'If you are trying to enter a buy or sell amount, ensure you click and reply to the message.'
        );
    });

const sendTokenPageInfo = async (chatId: number, rawTokenAddress: string) => {
    const settings = await RedisSettingsService.getSettings(chatId);

    const newMessage = await BOT.sendMessage(
        chatId,
        await getTokenPageMessageText(chatId, rawTokenAddress),
        getTokenPageOptions(rawTokenAddress, settings)
    );

    await saveTokenPage(chatId, newMessage);
};

const getTokenPageMessageText = async (
    chatId: number,
    rawTokenAddress: string
) => {
    const tokenAddress = Address.parse(rawTokenAddress).toRawString();

    const asset = await getAsset(tokenAddress);

    if (!asset) {
        throw new Error(`Asset not found ${tokenAddress}`);
    }

    const wallet = await getWallet(chatId);

    await LITE_CLIENT.updateLastBlock();

    const [tonBalance, assetNanoBalance, statisticsRecord] = await Promise.all([
        getAssetBalance(TON, wallet.address),
        getAssetBalance(asset.address, wallet.address),
        getAssetsStatisticsRecord([asset.address])
    ]);

    const assetBalance = fromNano(assetNanoBalance, asset.decimals);

    const displayData = {
        explorerLink: `https://tonviewer.com/${asset.address}`,
        chartLink: `https://dexscreener.com/ton/${asset.address}`,
        prices: getPricesDisplayData(asset),
        tonBalance: formatOutputNumber(fromNano(tonBalance, 9)),
        assetBalance: formatOutputNumber(assetBalance)
    };

    const pnlText = await getPnlText(chatId, asset.address, assetNanoBalance);
    const valueText = getValueText(assetBalance, asset);
    const statsText = getStatsText(statisticsRecord[asset.address]);

    /** save the last selected token to be able to create order */
    const uiState = await RedisUiStateService.getUiState(chatId);

    /** update ui state */
    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        selectedToken: asset
    });

    return (
        `<b>${asset.symbol}</b> - ${asset.name} - <code>${asset.address}</code>\n` +
        '\n' +
        `<a href="${displayData.explorerLink}">Explorer</a> | <a href="${displayData.chartLink}">Chart</a> | <a href="${getShareTokenLink(asset.address)}">Share</a>\n` +
        '\n' +
        '<b>Wallet balances:</b>\n' +
        `  ${displayData.tonBalance} TON\n` +
        `  ${displayData.assetBalance} ${asset.symbol}\n` +
        '\n' +
        '<b>Info:</b>\n' +
        pnlText +
        valueText +
        `  FDV: <b>$${formatFDV(asset.fdv)}</b> @ <b>$${formatOutputNumber(asset.usdExchangeRate)}</b>\n` +
        statsText +
        '\n' +
        `<b>Prices:</b>\n` +
        `${displayData.prices}\n` +
        '\n' +
        'To <b>instantly</b> buy or sell, press one of the buttons below, or create a limit order.\n'
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
        `  1 ${asset.symbol} = $${formatOutputNumber(assetToUsdExchangeRate)} / $1 = ${formatOutputNumber(
            usdToAssetExchangeRate
        )} ${asset.symbol}\n` +
        `  1 ${asset.symbol} = ${formatOutputNumber(assetToTonExchangeRate)} TON / 1 TON = ${formatOutputNumber(
            tonToAssetExchangeRate
        )} ${asset.symbol}`
    );
};

const getValueText = (assetBalance: number, asset: Asset) => {
    if (assetBalance === 0) {
        return '';
    }

    const usdValue = assetBalance * asset.usdExchangeRate;

    const tonToAssetExchangeRate = fromNano(
        BigInt(asset.exchangeRate),
        asset.decimals
    );
    const assetTonValue = assetBalance / tonToAssetExchangeRate;

    return `  Value: <b>$${formatOutputNumber(usdValue)}</b> / <b>${formatOutputNumber(assetTonValue)} TON</b>\n`;
};

const getTokenPageOptions = (rawTokenAddress: string, settings: Settings) => ({
    parse_mode: 'HTML' as const,
    disable_web_page_preview: true,
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: `Buy  ${formatOutputNumber(settings.buyTop, 0)} TON`,
                    callback_data: CallbackDataType.MarketBuy + settings.buyTop
                },
                {
                    text: `Sell ${formatOutputNumber(settings.sellTop, 0)}%`,
                    callback_data:
                        CallbackDataType.MarketSell + settings.sellTop
                }
            ],
            [
                {
                    text: `Buy ${formatOutputNumber(settings.buyBottom, 0)} TON`,
                    callback_data:
                        CallbackDataType.MarketBuy + settings.buyBottom
                },
                {
                    text: `Sell ${formatOutputNumber(settings.sellBottom, 0)}%`,
                    callback_data:
                        CallbackDataType.MarketSell + settings.sellBottom
                }
            ],
            [
                {
                    text: 'Buy X TON',
                    callback_data: CallbackDataType.MarketBuy + 'X'
                },
                {
                    text: 'Sell X %',
                    callback_data: CallbackDataType.MarketSell + 'X'
                }
            ],
            [
                {
                    text: 'Create Limit Order',
                    callback_data: CallbackDataType.CreateLimitOrder
                }
            ],
            [
                HOME_BUTTON,
                {
                    text: '🔄 Refresh',
                    callback_data: `${CallbackDataType.RefreshToken}${rawTokenAddress}`
                },
                CLOSE_BUTTON
            ]
        ]
    }
});
