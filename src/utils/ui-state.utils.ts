import {Message} from 'node-telegram-bot-api';

import {deleteMessageSafe} from './bot.utils';
import {RedisUiStateService} from '../classes/redis-ui-state.service';
import {InputTypeEnum} from '../enums/input-type.enum';
import {OrderType} from '../enums/order-type.enum';

export const saveHomePage = async (chatId: number, newMessage: Message) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    /** clear all previous messages */
    await Promise.all([
        deleteMessageSafe(chatId, uiState.messageIds?.homePage),
        deleteMessageSafe(chatId, uiState.messageIds?.tokenPage),
        deleteMessageSafe(chatId, uiState.messageIds?.lastPage),
        deleteMessageSafe(chatId, uiState.messageIds?.inputPage),
        deleteMessageSafe(chatId, uiState.messageIds?.settingsPage)
    ]);

    /** update ui state */
    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        messageIds: {
            homePage: newMessage.message_id,
            tokenPage: undefined,
            lastPage: undefined,
            inputPage: undefined,
            settingsPage: undefined
        },
        inputRequestType: undefined,
        limitOrder: undefined
    });
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
            ...uiState.messageIds,
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
            ...uiState.messageIds,
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
            ...uiState.messageIds,
            inputPage: newMessage.message_id
        },
        inputRequestType: newType
    });
};

export const saveSettingsPage = async (chatId: number, newMessage: Message) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    /** clear all previous messages */
    await Promise.all([
        deleteMessageSafe(chatId, uiState.messageIds?.tokenPage),
        deleteMessageSafe(chatId, uiState.messageIds?.lastPage),
        deleteMessageSafe(chatId, uiState.messageIds?.inputPage),
        deleteMessageSafe(chatId, uiState.messageIds?.settingsPage)
    ]);

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        messageIds: {
            ...uiState.messageIds,
            tokenPage: undefined,
            lastPage: undefined,
            inputPage: undefined,
            settingsPage: newMessage.message_id
        }
    });
};

export const saveOrderType = async (chatId: number, orderType: OrderType) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        orderType
    });
};
