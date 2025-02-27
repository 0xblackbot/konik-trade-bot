import {TelegramEvents} from 'node-telegram-bot-api';

import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {InputTypeEnum} from '../enums/input-type.enum';
import {buyAmountInputHandler} from '../pages/input/buy-amount-input.handler';
import {maxSlippageInputHandler} from '../pages/input/max-slippage-input.handler';
import {sellPercentInputHandler} from '../pages/input/sell-percent-input.handler';

export const messageReplyHandler: TelegramEvents['message'] = async message => {
    const uiState = await RedisUiStateService.getUiState(message.chat.id);

    if (
        uiState?.inputRequest &&
        message.reply_to_message?.message_id === uiState.inputRequest.messageId
    ) {
        const messageText = message.text?.trim() ?? '';

        /** reset input request */
        await RedisUiStateService.setUiState(message.chat.id, {
            ...uiState,
            inputRequest: undefined
        });

        if (uiState.inputRequest.type === InputTypeEnum.BuyAmount) {
            return buyAmountInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequest.type === InputTypeEnum.SellPercent) {
            return sellPercentInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequest.type === InputTypeEnum.MaxSlippage) {
            return maxSlippageInputHandler(message.chat.id, messageText);
        }
    }
};
