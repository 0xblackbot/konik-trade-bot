import {Address} from '@ton/core';
import axios from 'axios';
import qs from 'qs';

const API = axios.create({
    baseURL: 'https://api.dyor.io'
});

interface Stat {
    changePercent: number;
}

interface JettonsStatsResponse {
    items: {
        address: string;
        priceChange: {
            ton: {
                min15: Stat;
                hour: Stat;
                hour6: Stat;
                hour12: Stat;
                day: Stat;
                week: Stat;
                month: Stat;
            };
        };
    }[];
}

export interface ShortStat {
    '15m': number;
    '1h': number;
    '6h': number;
    '24h': number;
}

const cache = new Map<
    string,
    {timestamp: number; data: Record<string, ShortStat>}
>();
const CACHE_TTL = 5 * 60 * 1000;

export const getAssetsStatisticsRecord = async (assetAddresses: string[]) => {
    const key = assetAddresses.sort().join(','); // Sort to avoid order mismatches
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const result: Record<string, ShortStat> = {};

    const response = await API.get<JettonsStatsResponse>('/v1/jettons/stats', {
        params: {
            limit: 500,
            address: assetAddresses
        },
        paramsSerializer: {
            serialize: params => qs.stringify(params, {arrayFormat: 'repeat'})
        }
    })
        .then(response => response.data.items)
        .catch(() => []);

    for (const address of assetAddresses) {
        const rawAddress = Address.parse(address).toRawString();

        const data = response.find(item => item.address === rawAddress);

        if (data) {
            result[address] = {
                '15m': data.priceChange.ton.min15.changePercent,
                '1h': data.priceChange.ton.hour.changePercent,
                '6h': data.priceChange.ton.hour6.changePercent,
                '24h': data.priceChange.ton.day.changePercent
            };
        }
    }

    cache.set(key, {timestamp: now, data: result});

    return result;
};
