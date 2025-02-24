import {Asset} from 'rainbow-swap-sdk';

import {RedisUserAssetsService} from '../classes/redis-user-assets.service';
import {CallbackDataType} from '../enums/callback-data-type.enum';
import {BOT, LITE_CLIENT, TON} from '../globals';
import {getAssetsList} from '../utils/api.utils';
import {getAssetBalance} from '../utils/asset.utils';
import {fromNano} from '../utils/balance.utils';
import {formatOutputNumber} from '../utils/format.utils';
import {getWallet} from '../utils/wallet.utils';

export const sendHomePage = async (chatId: number) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);

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

    const displayData = getDisplayData(assetsBalances, assetsInfos);

    return BOT.sendMessage(
        chatId,
        `Your wallet: <code>${wallet.address.toString()}</code> (tap to copy)\n` +
            '\n' +
            `Balance: <b>${displayData.tonBalance} TON</b> / <b>$${displayData.usdTonBalance}</b>\n` +
            `Net Worth: <b>${displayData.tonNetWorth} TON</b> / <b>$${displayData.usdNetWorth}</b> \n` +
            '\n' +
            displayData.tokensInfo,
        {
            parse_mode: 'HTML',
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
                        }
                    ],
                    [{text: 'Help', callback_data: CallbackDataType.Help}]
                ]
            }
        }
    );
};

const getDisplayData = (assetsBalances: bigint[], assetsInfos: Asset[]) => {
    let tonBalance = formatOutputNumber(0);
    let usdTonBalance = formatOutputNumber(0);
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

        if (info.address === 'ton') {
            tonBalance = formatOutputNumber(balance);
            usdTonBalance = formatOutputNumber(usdValue);
        } else {
            tokensInfo.push(
                ` - <b>${info.symbol}</b>\n` +
                    `  Value: <b>$${formatOutputNumber(usdValue)}</b> / <b>${formatOutputNumber(tonValue)}</b> TON\n`
            );
        }
    }

    return {
        tonBalance,
        usdTonBalance,
        tonNetWorth: formatOutputNumber(tonNetWorth),
        usdNetWorth: formatOutputNumber(usdNetWorth),
        tokensInfo:
            tokensInfo.length === 0
                ? 'Your tokens will be available here.'
                : 'Your tokens:\n' + tokensInfo.join('\n')
    };
};
