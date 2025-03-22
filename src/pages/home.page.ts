import {RedisUserAssetsService} from '../classes/redis-user-assets.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {BOT, LITE_CLIENT, TON} from '../globals';
import {getAssetsList} from '../utils/api.utils';
import {getAssetBalance} from '../utils/asset.utils';
import {fromNano} from '../utils/balance.utils';
import {
    formatFDV,
    formatOutputNumber,
    formatPriceImpact
} from '../utils/format.utils';
import {getPnlLink, getTokenPageLink} from '../utils/links.utils';
import {getPnlInfo} from '../utils/pnl.utils';
import {getAssetsStatisticsRecord, ShortStat} from '../utils/statistic.utils';
import {saveHomePage} from '../utils/ui-state.utils';
import {getWallet} from '../utils/wallet.utils';

export const updateHomePage = async (
    chatId: number,
    messageId?: number,
    queryId?: string
) =>
    BOT.editMessageText(await getHomePageMessageText(chatId), {
        chat_id: chatId,
        message_id: messageId,
        ...homePageOptions
    }).catch(() => {
        if (queryId) {
            return BOT.answerCallbackQuery(queryId);
        }
    });

export const sendHomePage = async (chatId: number) => {
    const newMessage = await BOT.sendMessage(
        chatId,
        await getHomePageMessageText(chatId),
        homePageOptions
    );

    await saveHomePage(chatId, newMessage);
};

const getHomePageMessageText = async (chatId: number) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);
    const walletAddress = wallet.address.toString();

    const assetAddresses = await RedisUserAssetsService.getUserAssets(chatId);
    const userAssets = [TON, ...assetAddresses];

    const [assetsInfos, assetsBalances, statisticsRecord] = await Promise.all([
        getAssetsList({
            userAssets,
            limit: 0
        }),
        Promise.all(
            userAssets.map(assetAddress =>
                getAssetBalance(assetAddress, wallet.address)
            )
        ),
        getAssetsStatisticsRecord(assetAddresses)
    ]);

    let tonBalance = 0;
    let usdTonBalance = 0;
    let tonNetWorth = 0;
    let usdNetWorth = 0;
    const tokensInfo: string[] = [];

    for (let i = 0; i < assetsBalances.length; i++) {
        const nanoBalance = assetsBalances[i];
        const assetAddress = userAssets[i];
        const info = assetsInfos.find(item => item.address === assetAddress);

        if (!info) {
            continue;
        }

        const balance = fromNano(nanoBalance, info.decimals);
        const usdValue = balance * info.usdExchangeRate;

        const tonToAssetExchangeRate = fromNano(
            BigInt(info.exchangeRate),
            info.decimals
        );

        const tonValue = balance / tonToAssetExchangeRate;

        tonNetWorth += tonValue;
        usdNetWorth += usdValue;

        if (info.address === TON) {
            tonBalance = balance;
            usdTonBalance = usdValue;
        } else {
            const pnlText = await getPnlText(chatId, info.address, nanoBalance);
            const statsText = getStatsText(statisticsRecord[assetAddress]);

            tokensInfo.push(
                `- <a href="${getTokenPageLink(info.address)}"><b>${info.symbol}</b></a>\n` +
                    pnlText +
                    `  Value: <b>$${formatOutputNumber(usdValue)}</b> / <b>${formatOutputNumber(tonValue)} TON</b>\n` +
                    `  FDV: <b>$${formatFDV(info.fdv)}</b> @ <b>$${formatOutputNumber(info.usdExchangeRate)}</b>\n` +
                    statsText
            );
        }
    }

    const firstPart =
        tonBalance === 0
            ? '<b>Welcome to Konik Trade Bot</b> – the fastest and most secure way to trade any token on TON!\n' +
              '\n' +
              'You currently have no TON in your wallet. To start trading, deposit TON to your wallet address:\n' +
              `<code>${walletAddress}</code> (tap to copy)\n` +
              '\n' +
              'Once done, tap refresh and your balance will appear here.\n'
            : `Your wallet: <code>${walletAddress}</code> (tap to copy)\n` +
              '\n' +
              `Balance: <b>${formatOutputNumber(tonBalance)} TON</b> / <b>$${formatOutputNumber(usdTonBalance)}</b>\n` +
              `Net Worth: <b>${formatOutputNumber(tonNetWorth)} TON</b> / <b>$${formatOutputNumber(usdNetWorth)}</b> \n`;

    const secondPart =
        tokensInfo.length === 0
            ? ''
            : 'Your positions:\n' + tokensInfo.join('\n') + '\n';

    return (
        firstPart +
        '\n' +
        secondPart +
        'To buy a token, simply enter its address.\n' +
        'To manage your wallet or export your seed phrase, tap Settings below.'
    );
};

export const getPnlText = async (
    chatId: number,
    assetAddress: string,
    assetBalance: bigint
) => {
    const pnlInfo = await getPnlInfo(chatId, assetAddress, assetBalance);

    if (!pnlInfo) {
        return '';
    }

    const diff = pnlInfo.currentTonValue - pnlInfo.tonSpentAmount;

    return `  Profit: <b>${formatOutputNumber(pnlInfo.pnl)}%</b> / <b>${formatOutputNumber(diff)} TON</b> / <a href="${getPnlLink(assetAddress)}">PNL Card</a>\n`;
};

export const getStatsText = (stats: ShortStat | undefined) => {
    if (!stats) {
        return '';
    }

    return `  15m: <b>${formatPriceImpact(stats['15m'])}</b>, 1h: <b>${formatPriceImpact(stats['1h'])}</b>, 6h: <b>${formatPriceImpact(stats['6h'])}</b>, 24h: <b>${formatPriceImpact(stats['24h'])}</b>\n`;
};

const homePageOptions = {
    parse_mode: 'HTML' as const,
    disable_web_page_preview: true,
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'Buy & Sell',
                    callback_data: CallbackDataType.BuyAndSell
                }
            ],
            [
                {
                    text: 'DCA Orders',
                    callback_data: CallbackDataType.DCAOrders
                },
                {
                    text: 'Limit Orders',
                    callback_data: CallbackDataType.LimitOrders
                }
            ],
            [
                {
                    text: 'Settings',
                    callback_data: CallbackDataType.Settings
                },
                {text: 'Help', callback_data: CallbackDataType.Help}
            ],
            [{text: '🔄 Refresh', callback_data: CallbackDataType.RefreshHome}]
        ]
    }
};
