import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {BOT} from '../../globals';
import {saveLastPage} from '../../utils/ui-state.utils';
import {CLOSE_BUTTON} from '../buttons/close.button';

export const sendLimitOrderCanceledPage = async (chatId: number) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        limitOrder: undefined
    });

    const newMessage = await BOT.sendMessage(
        chatId,
        'Limit Order <b>Canceled</b>',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [CLOSE_BUTTON]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
