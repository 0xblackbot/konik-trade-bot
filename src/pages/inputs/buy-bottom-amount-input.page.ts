import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT} from '../../globals';
import {saveInputPage} from '../../utils/ui-state.utils';

export const sendBuyBottomAmountInputPage = async (chatId: number) => {
    const newMessage = await BOT.sendMessage(
        chatId,
        `Reply with your new setting for the bottom Buy Button in TON (Example: 1.5):`,
        {parse_mode: 'HTML', reply_markup: {force_reply: true}}
    );

    await saveInputPage(
        chatId,
        InputTypeEnum.BuyBottomButtonAmount,
        newMessage
    );
};
