import {Address} from '@ton/core';

import {LITE_CLIENT, TON} from '../globals';
import {getJettonBalance} from './jetton.utils';

export const getAssetBalance = (
    assetAddress: string,
    ownerAddress: Address
) => {
    if (assetAddress === TON) {
        return LITE_CLIENT.getBalance(ownerAddress);
    }

    return getJettonBalance(assetAddress, ownerAddress);
};
