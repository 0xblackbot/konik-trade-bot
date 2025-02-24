import {InputTypeEnum} from '../enums/input-type.enum';

export interface UiState {
    selectedToken?: {
        address: string;
        messageId: number; // Token page id
    };
    inputRequest?: {
        type: InputTypeEnum;
        messageId: number; // Reply request message id
    };
}
