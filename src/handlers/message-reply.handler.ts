import {TelegramEvents} from 'node-telegram-bot-api';

import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {InputTypeEnum} from '../enums/input-type.enum';
import {buyAmountInputHandler} from '../pages/input/buy-amount-input.handler';
import {limitOrderTargetPriceHandler} from '../pages/input/limit-order-target-price.handler';
import {maxSlippageInputHandler} from '../pages/input/max-slippage-input.handler';
import {sellPercentInputHandler} from '../pages/input/sell-percent-input.handler';

export const messageReplyHandler: TelegramEvents['message'] = async message => {
    const uiState = await RedisUiStateService.getUiState(message.chat.id);

    if (
        uiState.messageIds &&
        uiState.inputRequestType &&
        message.reply_to_message?.message_id === uiState.messageIds.inputPage
    ) {
        const messageText = message.text?.trim() ?? '';

        /** reset input request */
        await RedisUiStateService.setUiState(message.chat.id, {
            ...uiState,
            inputRequestType: undefined
        });

        if (uiState.inputRequestType === InputTypeEnum.BuyAmount) {
            return buyAmountInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequestType === InputTypeEnum.SellPercent) {
            return sellPercentInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequestType === InputTypeEnum.MaxSlippage) {
            return maxSlippageInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequestType === InputTypeEnum.LimitOrderTargetPrice) {
            return limitOrderTargetPriceHandler(message.chat.id, messageText);
        }
    }
};
