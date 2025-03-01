import {Asset, BestRouteResponse} from 'rainbow-swap-sdk';

import {getAssetBalance} from './asset.utils';
import {fromNano} from './balance.utils';
import {formatOutputNumber} from './format.utils';
import {getWallet} from './wallet.utils';
import {TON} from '../globals';
import {getNanoTonSendAmount} from './message.utils';

export const getInputAssetAmountValidationError = async (
    chatId: number,
    inputAsset: Asset,
    inputAssetAmount: bigint
) => {
    const wallet = await getWallet(chatId);

    const inputAssetBalance = await getAssetBalance(
        inputAsset.address,
        wallet.address
    );

    if (inputAssetBalance === 0n) {
        if (inputAsset.symbol == TON) {
            return (
                `You have got 0 TON.\n` +
                `You need to deposit TON on your wallet and try again.\n` +
                `\n` +
                `<code>${wallet.address.toString()}</code> (tap to copy)`
            );
        } else {
            return (
                `You have got 0 ${inputAsset.symbol}.\n` +
                `Please check your ${inputAsset.symbol} balance and try again.`
            );
        }
    }

    if (inputAssetBalance < inputAssetAmount) {
        const balance = fromNano(inputAssetBalance, inputAsset.decimals);

        return (
            `You don't have enough ${inputAsset.symbol}.\n` +
            `Wallet balance: <b>${formatOutputNumber(balance)} ${inputAsset.symbol}</b>`
        );
    }

    return undefined;
};

export const getGasValidationError = async (
    chatId: number,
    bestRoute: BestRouteResponse
) => {
    const wallet = await getWallet(chatId);

    const tonBalance = await getAssetBalance(TON, wallet.address);
    const nanoTonSendAmount = getNanoTonSendAmount(bestRoute.swapMessages);

    if (tonBalance < nanoTonSendAmount) {
        const nanoDiff = nanoTonSendAmount - tonBalance;
        const diff = fromNano(nanoDiff, 9);

        return (
            `Not enough TON to pay gas fees.\n` +
            `You need at least <b>${formatOutputNumber(diff)} TON</b> more.`
        );
    }

    return undefined;
};
