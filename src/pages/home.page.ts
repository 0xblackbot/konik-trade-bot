import {CallbackQuery} from 'node-telegram-bot-api';

import {RedisUserAssetsService} from '../classes/redis-user-assets.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {ParamsTypeEnum} from '../enums/params-type.enum';
import {BOT, LITE_CLIENT, TON} from '../globals';
import {TELEGRAM_BOT_USERNAME} from '../secrets';
import {getAssetsList} from '../utils/api.utils';
import {getAssetBalance} from '../utils/asset.utils';
import {fromNano} from '../utils/balance.utils';
import {formatOutputNumber} from '../utils/format.utils';
import {getWallet} from '../utils/wallet.utils';

export const updateHomePage = async (chatId: number, query: CallbackQuery) => {
    BOT.editMessageText(await getHomePageMessageText(chatId), {
        chat_id: chatId,
        message_id: query.message?.message_id,
        ...homePageOptions
    }).catch(() => BOT.answerCallbackQuery(query.id));
};

export const sendHomePage = async (chatId: number) =>
    BOT.sendMessage(
        chatId,
        await getHomePageMessageText(chatId),
        homePageOptions
    );

const getHomePageMessageText = async (chatId: number) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);
    const walletAddress = wallet.address.toString();

    const assetAddresses = await RedisUserAssetsService.getUserAssets(chatId);
    const userAssets = [TON, ...assetAddresses];

    const assetsInfos = await getAssetsList({
        userAssets,
        limit: 0
    });
    const assetsBalances = await Promise.all(
        userAssets.map(assetAddress =>
            getAssetBalance(assetAddress, wallet.address)
        )
    );

    let tonBalance = 0;
    let usdTonBalance = 0;
    let tonNetWorth = 0;
    let usdNetWorth = 0;
    const tokensInfo: string[] = [];

    for (let i = 0; i < assetsBalances.length; i++) {
        const nanoBalance = assetsBalances[i];
        const info = assetsInfos[i];

        const balance = fromNano(nanoBalance, info.decimals);
        const usdValue = balance * info.usdExchangeRate;

        const tonToAssetExchangeRate = fromNano(
            BigInt(info.exchangeRate),
            info.decimals
        );

        const tonValue = balance / tonToAssetExchangeRate;

        tonNetWorth += tonValue;
        usdNetWorth += usdValue;

        const pnlLink =
            balance !== 0
                ? `<a href="https://t.me/${TELEGRAM_BOT_USERNAME}?start=${ParamsTypeEnum.PNL}${info.address}">PNL</a>`
                : '';

        if (info.address === 'ton') {
            tonBalance = balance;
            usdTonBalance = usdValue;
        } else {
            tokensInfo.push(
                ` - <b>${info.symbol}</b> ${pnlLink}\n` +
                    `  Value: <b>$${formatOutputNumber(usdValue)}</b> / <b>${formatOutputNumber(tonValue)}</b> TON\n`
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
            : 'Your tokens:\n' + tokensInfo.join('\n') + '\n';

    return (
        firstPart +
        '\n' +
        secondPart +
        'To buy a token, simply enter its address.\n' +
        'To manage your wallet or export your seed phrase, tap Settings below.'
    );
};

const homePageOptions = {
    parse_mode: 'HTML' as const,
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
            [{text: 'Refresh', callback_data: CallbackDataType.RefreshHome}]
        ]
    }
};
