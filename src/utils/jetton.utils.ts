import {isDefined} from '@rnw-community/shared';
import {Address, beginCell} from '@ton/core';

import {RedisCacheService} from '../classes/redis-cache.service';
import {LITE_CLIENT} from '../globals';

export const getJettonWalletAddress = async (
    jettonMasterAddress: string,
    ownerAddress: Address
) => {
    const cacheKey = `getJettonWalletAddress_${jettonMasterAddress}_${ownerAddress.toString()}`;
    const cachedValue = await RedisCacheService.getCache(cacheKey);

    if (isDefined(cachedValue)) {
        return Address.parse(cachedValue);
    }

    const walletAddressResponse = await LITE_CLIENT.runMethod(
        Address.parse(jettonMasterAddress),
        'get_wallet_address',
        [
            {
                type: 'slice',
                cell: beginCell().storeAddress(ownerAddress).endCell()
            }
        ]
    );

    const value = walletAddressResponse.readAddress();

    await RedisCacheService.setCache(cacheKey, value.toString());

    return value;
};

export const getJettonBalance = async (
    jettonMasterAddress: string,
    ownerAddress: Address
) => {
    const jettonWalletAddress = await getJettonWalletAddress(
        jettonMasterAddress,
        ownerAddress
    );

    const walletDataResponse = await LITE_CLIENT.runMethod(
        jettonWalletAddress,
        'get_wallet_data'
    );

    return walletDataResponse.readBigNumber();
};
