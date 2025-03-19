import {TelegramEvents} from 'node-telegram-bot-api';

import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {InputTypeEnum} from '../enums/input-type.enum';
import {buyAmountInputHandler} from '../pages/inputs/buy-amount-input.handler';
import {buyBottomAmountInputHandler} from '../pages/inputs/buy-bottom-amount-input.handler';
import {buyTopAmountInputHandler} from '../pages/inputs/buy-top-amount-input.handler';
import {limitOrderTargetPriceHandler} from '../pages/inputs/limit-order-target-price.handler';
import {maxSlippageInputHandler} from '../pages/inputs/max-slippage-input.handler';
import {sellBottomPercentInputHandler} from '../pages/inputs/sell-bottom-percent-input.handler';
import {sellPercentInputHandler} from '../pages/inputs/sell-percent-input.handler';
import {sellTopPercentInputHandler} from '../pages/inputs/sell-top-percent-input.handler';
import {withdrawTonAddressInputHandler} from '../pages/inputs/withdraw-ton-address-input.handler';
import {withdrawTonAmountInputHandler} from '../pages/inputs/withdraw-ton-amount-input.handler';

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

        if (uiState.inputRequestType === InputTypeEnum.BuyTopButtonAmount) {
            return buyTopAmountInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequestType === InputTypeEnum.BuyBottomButtonAmount) {
            return buyBottomAmountInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequestType === InputTypeEnum.SellTopButtonAmount) {
            return sellTopPercentInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequestType === InputTypeEnum.SellBottomButtonAmount) {
            return sellBottomPercentInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequestType === InputTypeEnum.LimitOrderTargetPrice) {
            return limitOrderTargetPriceHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequestType === InputTypeEnum.WithdrawTonAddress) {
            return withdrawTonAddressInputHandler(message.chat.id, messageText);
        }

        if (uiState.inputRequestType === InputTypeEnum.WithdrawTonAmount) {
            return withdrawTonAmountInputHandler(message.chat.id, messageText);
        }
    }
};
