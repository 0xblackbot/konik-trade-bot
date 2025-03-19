import {RedisSettingsService} from '../../classes/redis-settings.service';
import {BOT} from '../../globals';
import {sendErrorPage} from '../error.page';
import {updateSettingsPage} from '../settings/settings.page';

export const sellTopPercentInputHandler = async (
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

    if (inputValue <= 0 || inputValue > 100) {
        return sendErrorPage(
            chatId,
            `Number out of range (0 - 100). Press button and try again.`
        );
    }

    const settings = await RedisSettingsService.getSettings(chatId);

    await RedisSettingsService.setSettings(chatId, {
        ...settings,
        sellTop: inputValue
    });

    await updateSettingsPage(chatId);

    await BOT.sendMessage(
        chatId,
        `Top Sell Button set to <b>${inputValue}%</b>.`,
        {parse_mode: 'HTML'}
    );
};
