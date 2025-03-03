import {isDefined} from '@rnw-community/shared';
import {Address} from '@ton/core';

import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {sendErrorPage} from '../error.page';
import {sendWithdrawTonAmountInputPage} from './withdraw-ton-amount-input.page';

const parseAddress = (rawText: string) => {
    try {
        return Address.parse(rawText).toString();
    } catch {
        return undefined;
    }
};

export const withdrawTonAddressInputHandler = async (
    chatId: number,
    messageText: string
) => {
    const recipientAddress = parseAddress(messageText);

    if (!isDefined(recipientAddress)) {
        return sendErrorPage(
            chatId,
            'Invalid recipient address. Press button and try again.'
        );
    }

    const uiState = await RedisUiStateService.getUiState(chatId);

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        withdrawRequest: {
            recipientAddress
        }
    });

    return sendWithdrawTonAmountInputPage(chatId);
};
