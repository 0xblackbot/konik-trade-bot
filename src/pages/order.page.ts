import {SwapStatusEnum} from 'rainbow-swap-sdk';
import {SwapHistoryData} from 'rainbow-swap-sdk/dist/interfaces/swap-history-data.interface';

import {formatOutputNumber} from '../utils/format.utils';
import {clamp} from '../utils/number.utils';

const MIN = 2;
const MAX = 98;

const getProgress = (
    expectedMessageCount: number,
    completedMessageCount: number
) => {
    const value =
        expectedMessageCount === 0
            ? 0
            : (100 * completedMessageCount) / expectedMessageCount;

    return clamp(Math.floor(value), MIN, MAX);
};

export const getOrderPageText = (
    historyData: SwapHistoryData,
    expectedMessageCount: number
) => {
    const explorerLink = `https://tonviewer.com/transaction/${historyData.bocHash}`;
    const explorerText = `<a href="${explorerLink}">View on Tonviewer</a>`;

    if (historyData.status === SwapStatusEnum.Pending) {
        const progress = getProgress(
            expectedMessageCount,
            historyData.completedMessageCount
        );

        return `Swap sent: ${explorerText}\n` + `Progress <b>${progress}%</b>`;
    }

    if (historyData.status === SwapStatusEnum.Success) {
        let details = '';

        if (historyData.receivedInfo) {
            details = `Bought <b>${formatOutputNumber(historyData.receivedInfo.amount)} ${historyData.receivedInfo.symbol} ($${formatOutputNumber(historyData.receivedInfo.usdAmount)})</b>`;

            if (historyData.sentInfo) {
                details += ` for <b>${formatOutputNumber(historyData.sentInfo.amount)} ${historyData.sentInfo.symbol} ($${formatOutputNumber(historyData.sentInfo.usdAmount)})</b>`;
            }
        }

        return `Swap Successful: ${explorerText}\n` + details;
    }

    return (
        `Swap failed:  ${explorerText}\n` +
        'Transaction failed. Please check your TON / token balance and try again.'
    );
};
