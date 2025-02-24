import {createMarketOrder} from './market.order';

export const createMarketBuyOrder = async (
    chatId: number,
    inputAssetAmount: bigint
) => createMarketOrder(chatId, 'buy', inputAssetAmount);
