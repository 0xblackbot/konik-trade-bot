import {RedisUiStateService} from '../../classes/redis-ui-state.service';
import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT} from '../../globals';
import {formatOutputNumber} from '../../utils/format.utils';
import {saveInputPage} from '../../utils/ui-state.utils';
import {send404Page} from '../404.page';

export const sendLimitOrderTargetPricePage = async (chatId: number) => {
    const uiState = await RedisUiStateService.getUiState(chatId);

    if (
        !uiState.limitOrder?.currentPrice ||
        !uiState.limitOrder.currentPriceSymbol
    ) {
        return send404Page(chatId);
    }

    const newMessage = await BOT.sendMessage(
        chatId,
        `Enter your desired price <b>in TON</b>:\n` +
            '\n' +
            `Current price: <b>${formatOutputNumber(uiState.limitOrder.currentPrice)} ${uiState.limitOrder.currentPriceSymbol}</b>`,
        {parse_mode: 'HTML', reply_markup: {force_reply: true}}
    );

    await saveInputPage(
        chatId,
        InputTypeEnum.LimitOrderTargetPrice,
        newMessage
    );
};
