import {isDefined} from '@rnw-community/shared';

import {DEFAULT_SETTINGS} from '../../classes/redis-settings.service';
import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT} from '../../globals';
import {deleteMessageSafe} from '../../utils/bot.utils';

export const sendMaxSlippageInputPage = async (chatId: number) => {
    const newMessage = await BOT.sendMessage(
        chatId,
        `Reply with your new slippage setting in % (0 - 100 %, Example: 25):\n` +
            '\n' +
            `<b>Recommended value: ${DEFAULT_SETTINGS.maxSlippage}</b>`,
        {parse_mode: 'HTML', reply_markup: {force_reply: true}}
    );

    const uiState = await RedisUiStateService.getUiState(chatId);

    if (isDefined(uiState?.inputRequest)) {
        await deleteMessageSafe(chatId, uiState.inputRequest.messageId);
    }

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        inputRequest: {
            type: InputTypeEnum.MaxSlippage,
            messageId: newMessage.message_id
        }
    });
};
