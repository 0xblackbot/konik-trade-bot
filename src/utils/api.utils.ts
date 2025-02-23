import {Asset, getAssetsList} from 'rainbow-swap-sdk';

export const getAsset = async (address: string): Promise<Asset | undefined> => {
    const result = await getAssetsList({searchValue: address, limit: 1});

    return result[0];
};
