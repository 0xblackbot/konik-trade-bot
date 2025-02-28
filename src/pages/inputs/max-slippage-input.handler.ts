import {RedisSettingsService} from '../../classes/redis-settings.service';
import {BOT, LITE_CLIENT} from '../../globals';
import {sendErrorPage} from '../error.page';

export const maxSlippageInputHandler = async (
    chatId: number,
    messageText: string
) => {
    await LITE_CLIENT.updateLastBlock();

    const inputValue = parseFloat(messageText);

    if (isNaN(inputValue)) {
        return sendErrorPage(
            chatId,
            'Invalid amount. Press button and try again.'
        );
    }

    if (inputValue < 0 || inputValue > 100) {
        return sendErrorPage(
            chatId,
            `Number out of range (0 - 100). Press button and try again.`
        );
    }

    const settings = await RedisSettingsService.getSettings(chatId);

    await RedisSettingsService.setSettings(chatId, {
        ...settings,
        maxSlippage: inputValue
    });

    await BOT.sendMessage(
        chatId,
        `Max slippage set to <b>${inputValue}%</b>.`,
        {parse_mode: 'HTML'}
    );
};
