import {InputTypeEnum} from '../../enums/input-type.enum';
import {BOT} from '../../globals';
import {saveInputPage} from '../../utils/ui-state.utils';

export const sendWithdrawTonAddressInputPage = async (chatId: number) => {
    const newMessage = await BOT.sendMessage(
        chatId,
        `Enter <b>recipient address</b>:`,
        {parse_mode: 'HTML', reply_markup: {force_reply: true}}
    );

    await saveInputPage(chatId, InputTypeEnum.WithdrawTonAddress, newMessage);
};
