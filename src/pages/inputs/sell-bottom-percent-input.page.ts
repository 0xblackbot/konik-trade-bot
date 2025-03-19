import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT} from '../../globals';
import {saveInputPage} from '../../utils/ui-state.utils';

export const sendSellBottomAmountInputPage = async (chatId: number) => {
    const newMessage = await BOT.sendMessage(
        chatId,
        `Reply with your new setting for the bottom Sell Button in % (0 - 100 %, Example: 50):`,
        {parse_mode: 'HTML', reply_markup: {force_reply: true}}
    );

    await saveInputPage(
        chatId,
        InputTypeEnum.SellBottomButtonAmount,
        newMessage
    );
};
