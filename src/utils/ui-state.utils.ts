import {isDefined} from '@rnw-community/shared';
import {Message} from 'node-telegram-bot-api';

import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {OrderSide} from '../enums/order-side.enum';
import {TON} from '../globals';
import {deleteMessageSafe} from './bot.utils';
import {InputTypeEnum} from '../enums/input-type.enum';
import {OrderType} from '../enums/order-type.enum';

export const getInputOutputAssets = async (chatId: number, side: OrderSide) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (!isDefined(uiState.selectedToken)) {
        throw new Error(`Cannot find uiState.selectedToken`);
    }

    const aAsset = {
        address: TON,
        symbol: TON,
        decimals: 9
    };

    const bAsset = {
        address: uiState.selectedToken.address,
        symbol: uiState.selectedToken.symbol,
        decimals: uiState.selectedToken.decimals
    };

    return {
        inputAsset: side === OrderSide.Buy ? aAsset : bAsset,
        outputAsset: side === OrderSide.Buy ? bAsset : aAsset
    };
};

export const saveTokenPage = async (chatId: number, newMessage: Message) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    /** clear all previous messages */
    await Promise.all([
        deleteMessageSafe(chatId, uiState.messageIds?.tokenPage),
        deleteMessageSafe(chatId, uiState.messageIds?.lastPage),
        deleteMessageSafe(chatId, uiState.messageIds?.inputPage)
    ]);

    /** update ui state */
    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        messageIds: {
            tokenPage: newMessage.message_id,
            lastPage: undefined,
            inputPage: undefined
        },
        inputRequestType: undefined,
        limitOrder: undefined
    });
};

export const saveLastPage = async (chatId: number, newMessage?: Message) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    /** clear all previous messages (except tokenPage) */
    await Promise.all([
        deleteMessageSafe(chatId, uiState.messageIds?.lastPage),
        deleteMessageSafe(chatId, uiState.messageIds?.inputPage)
    ]);

    /** update ui state */
    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        messageIds: {
            tokenPage: uiState.messageIds?.tokenPage,
            lastPage: newMessage?.message_id,
            inputPage: undefined
        },
        inputRequestType: undefined
    });
};

export const saveInputPage = async (
    chatId: number,
    newType: InputTypeEnum,
    newMessage: Message
) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    /** clear all previous inputs */
    await deleteMessageSafe(chatId, uiState.messageIds?.inputPage);

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        messageIds: {
            tokenPage: uiState.messageIds?.tokenPage,
            lastPage: uiState.messageIds?.lastPage,
            inputPage: newMessage.message_id
        },
        inputRequestType: newType
    });
};

export const saveOrderType = async (chatId: number, orderType: OrderType) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        orderType
    });
};
