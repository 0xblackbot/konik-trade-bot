import {DEFAULT_SETTINGS} from '../../classes/redis-settings.service';
import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT} from '../../globals';
import {saveInputPage} from '../../utils/ui-state.utils';

export const sendMaxSlippageInputPage = async (chatId: number) => {
    const newMessage = await BOT.sendMessage(
        chatId,
        `Reply with your new slippage setting in % (0 - 100 %, Example: 25):\n` +
            '\n' +
            `<b>Recommended value: ${DEFAULT_SETTINGS.maxSlippage}</b>`,
        {parse_mode: 'HTML', reply_markup: {force_reply: true}}
    );

    await saveInputPage(chatId, InputTypeEnum.MaxSlippage, newMessage);
};
