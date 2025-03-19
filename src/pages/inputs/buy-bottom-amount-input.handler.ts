import {RedisSettingsService} from '../../classes/redis-settings.service';
import {BOT} from '../../globals';
import {sendErrorPage} from '../error.page';
import {updateSettingsPage} from '../settings/settings.page';

export const buyBottomAmountInputHandler = async (
    chatId: number,
    messageText: string
) => {
    const inputValue = parseFloat(messageText);

    if (isNaN(inputValue)) {
        return sendErrorPage(
            chatId,
            'Invalid amount. Press button and try again.'
        );
    }

    if (inputValue <= 0) {
        return sendErrorPage(
            chatId,
            `Number should be <b>greater than 0</b>. Press button and try again.`
        );
    }

    const settings = await RedisSettingsService.getSettings(chatId);

    await RedisSettingsService.setSettings(chatId, {
        ...settings,
        buyBottom: inputValue
    });

    await updateSettingsPage(chatId);

    await BOT.sendMessage(
        chatId,
        `Bottom Buy Button set to <b>${inputValue} TON</b>.`,
        {parse_mode: 'HTML'}
    );
};
