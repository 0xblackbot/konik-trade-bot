import axios from 'axios';
import {Asset, AssetsListParams} from 'rainbow-swap-sdk';

const API = axios.create({
    baseURL: 'https://api.rainbow.ag/api'
});

export const getAssetsList = (params: AssetsListParams) =>
    API.post<Asset[]>('/assets-list', params).then(response => response.data);

export const getAsset = async (address: string): Promise<Asset | undefined> => {
    const result = await getAssetsList({searchValue: address, limit: 1});

    return result[0];
};
