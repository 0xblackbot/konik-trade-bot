import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {BOT} from '../../globals';
import {saveLastPage} from '../../utils/ui-state.utils';
import {CLOSE_BUTTON} from '../buttons/close.button';

export const sendMarketOrderCanceledPage = async (chatId: number) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    await RedisUiStateService.setUiState(chatId, {
        ...uiState,
        marketOrder: undefined
    });

    const newMessage = await BOT.sendMessage(
        chatId,
        'Market Order <b>canceled</b>',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [CLOSE_BUTTON]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
