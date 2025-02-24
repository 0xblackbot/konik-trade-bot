import {TelegramEvents} from 'node-telegram-bot-api';

import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {InputTypeEnum} from '../enums/input-type.enum';
import {marketBuyAmountInputHandler} from '../pages/input/market-buy-amount-input.handler';
import {marketSellPercentInputHandler} from '../pages/input/market-sell-percent-input.handler';

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

        if (uiState.inputRequest.type === InputTypeEnum.MarketBuyAmount) {
            return marketBuyAmountInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequest.type === InputTypeEnum.MarketSellPercent) {
            return marketSellPercentInputHandler(message.chat.id, messageText);
        }
    }
};
