import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT} from '../../globals';
import {saveInputPage} from '../../utils/ui-state.utils';

export const sendBuyTopAmountInputPage = async (chatId: number) => {
    const newMessage = await BOT.sendMessage(
        chatId,
        `Reply with your new setting for the top Buy Button in TON (Example: 0.5):`,
        {parse_mode: 'HTML', reply_markup: {force_reply: true}}
    );

    await saveInputPage(chatId, InputTypeEnum.BuyTopButtonAmount, newMessage);
};
