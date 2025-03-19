import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT} from '../../globals';
import {saveInputPage} from '../../utils/ui-state.utils';

export const sendSellTopAmountInputPage = async (chatId: number) => {
    const newMessage = await BOT.sendMessage(
        chatId,
        `Reply with your new setting for the top Sell Button in % (0 - 100 %, Example: 25):`,
        {parse_mode: 'HTML', reply_markup: {force_reply: true}}
    );

    await saveInputPage(chatId, InputTypeEnum.SellTopButtonAmount, newMessage);
};
