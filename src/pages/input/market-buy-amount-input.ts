import {isDefined} from '@rnw-community/shared';

import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT} from '../../globals';

export const sendMarketBuyAmountInput = async (chatId: number) => {
    const newMessage = await BOT.sendMessage(
        chatId,
        'Reply with the amount you wish to buy (0 - 0.070896 TON, Example: 2.5):',
        {reply_markup: {force_reply: true}}
    );

    const uiState = await RedisUiStateService.getUiState(chatId);

    if (isDefined(uiState?.inputRequest)) {
        await BOT.deleteMessage(chatId, uiState.inputRequest.messageId).catch(
            error => console.log('BOT.deleteMessage error', error)
        );
    }

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        inputRequest: {
            type: InputTypeEnum.MarketBuyAmount,
            messageId: newMessage.message_id
        }
    });
};
