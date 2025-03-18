import {isDefined} from '@rnw-community/shared';
import {Address} from '@ton/core';
import {Asset} from 'rainbow-swap-sdk';

import {LITE_CLIENT, TON} from '../globals';
import {getJettonBalance} from './jetton.utils';
import {OrderSide} from '../enums/order-side.enum';

export const getAssetBalance = (
    assetAddress: string,
    ownerAddress: Address
) => {
    if (assetAddress === TON) {
        return LITE_CLIENT.getBalance(ownerAddress);
    }

    return getJettonBalance(assetAddress, ownerAddress);
};

const tonAsset: Asset = {
    address: TON,
    slug: 'TON',
    symbol: 'TON',
    name: 'Toncoin',
    image: 'https://raw.githubusercontent.com/0xblackbot/rainbow-swap/refs/heads/main/public/external-assets/ton.png',
    decimals: 9,
    verification: 'whitelist',
    exchangeRate: '0',
    usdExchangeRate: 0,
    totalSupply: '0',
    fdv: 0
};

export const getInputOutputAssets = (
    side: OrderSide,
    asset: Asset | undefined
) => {
    if (!isDefined(asset)) {
        throw new Error(`asset not defined`);
    }

    return {
        inputAsset: side === OrderSide.Buy ? tonAsset : asset,
        outputAsset: side === OrderSide.Buy ? asset : tonAsset
    };
};
