import {Asset} from 'rainbow-swap-sdk';

import {LimitOrderStatus} from '../enums/limit-order-status.enum';
import {OrderSide} from '../enums/order-side.enum';

export interface LimitOrder {
    id: number;
    chatId: number;
    status: LimitOrderStatus;
    side: OrderSide;
    asset: Asset;
    inputAssetAmount: string;
    targetOutputAssetAmount: number;
    targetPrice: number; // Only used for UI, for actual check use targetOutputAssetAmount
}
