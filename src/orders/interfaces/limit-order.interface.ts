import {Asset} from 'rainbow-swap-sdk/dist/types/asset.type';

import {OrderSide} from '../../enums/order-side.enum';

export interface LimitOrder {
    id: number;
    chatId: number;
    side: OrderSide;
    asset: Asset;
    inputAssetAmount: string;
    targetOutputAssetAmount: number;
    targetPrice: number; // Only used for UI, for actual check use targetOutputAssetAmount
}
