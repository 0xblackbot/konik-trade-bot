import {createMarketOrder} from './market.order';
import {OrderSide} from '../../enums/order-side.enum';

export const createMarketBuyOrder = async (
    chatId: number,
    inputAssetAmount: bigint
) => createMarketOrder(chatId, OrderSide.Buy, inputAssetAmount);
