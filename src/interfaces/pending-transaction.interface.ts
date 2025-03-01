export interface PendingTransaction {
    bocHash: string;
    chatId: number;
    messageId: number;
    expectedMessageCount: number;
    assetAddress: string;
}
