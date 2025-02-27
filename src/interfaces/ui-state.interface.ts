import {Asset} from 'rainbow-swap-sdk';

import {InputTypeEnum} from '../enums/input-type.enum';

export interface UiState {
    selectedToken?: {
        data: Asset;
        tokenPageMessageId: number;
        limitOrderPageMessageId?: number;
    };
    inputRequest?: {
        type: InputTypeEnum;
        messageId: number; // Reply request message id
    };
}
