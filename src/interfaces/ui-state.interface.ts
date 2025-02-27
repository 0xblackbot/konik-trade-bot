import {Asset} from 'rainbow-swap-sdk';

import {InputTypeEnum} from '../enums/input-type.enum';
import {OrderType} from '../enums/order-type.enum';

export interface UiState {
    selectedToken?: {
        data: Asset;
        orderType: OrderType;
        tokenPageMessageId: number;
        limitOrderPageMessageId?: number;
    };
    inputRequest?: {
        type: InputTypeEnum;
        messageId: number; // Reply request message id
    };
}
