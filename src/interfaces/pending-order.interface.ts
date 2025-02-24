export interface PendingOrder {
    bocHash: string;
    chatId: number;
    messageId: number;
    expectedMessageCount: number;
    assetAddress: string;
}
