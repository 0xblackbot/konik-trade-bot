import {OrderType} from '../enums/order-type.enum';

export type PendingTransaction =
    | MarketPendingTransaction
    | LimitPendingTransaction;

export interface MarketPendingTransaction {
    type: OrderType.Market;
    bocHash: string;
    chatId: number;
    assetAddress: string;
    messageId: number;
    expectedMessageCount: number;
}

export interface LimitPendingTransaction {
    type: OrderType.Limit;
    bocHash: string;
    chatId: number;
    assetAddress: string;
    limitOrderId: number;
    expectedMessageCount: number;
}
