import {Asset} from 'rainbow-swap-sdk';

import {InputTypeEnum} from '../enums/input-type.enum';
import {OrderSide} from '../enums/order-side.enum';
import {OrderType} from '../enums/order-type.enum';

export interface UiState {
    messageIds?: {
        tokenPage?: number;
        lastPage?: number; // any other (except token page) active page
        inputPage?: number;
    };
    selectedToken?: {
        data: Asset;
        orderType: OrderType;
    };
    inputRequest?: {
        type: InputTypeEnum;
    };
    limitOrder?: {
        side?: OrderSide;
        inputAssetAmount?: string;
        currentPrice?: number;
        currentPriceSymbol?: string;
        currentOutputAssetAmount?: number;
        targetOutputAssetAmount?: number;
        targetPrice?: number;
    };
}
