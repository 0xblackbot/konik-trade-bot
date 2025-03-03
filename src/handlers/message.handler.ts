import {TelegramEvents} from 'node-telegram-bot-api';

import {CommandEnum} from '../enums/command.enum';
import {ParamsTypeEnum} from '../enums/params-type.enum';
import {BOT} from '../globals';
import {sendChatPage} from '../pages/chat.page';
import {sendHomePage} from '../pages/home.page';
import {sendPnlPage} from '../pages/pnl.page';
import {sendHelpPage} from '../pages/settings/help.page';
import {sendSeepPhraseReveal} from '../pages/settings/seed-phrase-reveal.page';
import {sendSettingsPage} from '../pages/settings/settings.page';
import {sendTokenPage} from '../pages/token.page';
import {deleteMessageSafe} from '../utils/bot.utils';

export const messageHandler: TelegramEvents['message'] = async message => {
    const [command, params] = (message.text ?? '').split(' ') as [
        string,
        string | undefined
    ];

    if (params?.startsWith(ParamsTypeEnum.PNL)) {
        await deleteMessageSafe(message.chat.id, message.message_id);
        const assetAddress = params.slice(ParamsTypeEnum.PNL.length);

        return sendPnlPage(message.chat.id, assetAddress);
    }

    if (params?.startsWith(ParamsTypeEnum.TokenPage)) {
        await deleteMessageSafe(message.chat.id, message.message_id);
        const messageText = params.slice(ParamsTypeEnum.TokenPage.length);

        return sendTokenPage(message.chat.id, messageText);
    }

    if (command === CommandEnum.Start || command === CommandEnum.Home) {
        return sendHomePage(message.chat.id);
    }

    if (command === CommandEnum.Settings) {
        return sendSettingsPage(message.chat.id);
    }

    if (command === CommandEnum.RevealSeedPhrase) {
        return sendSeepPhraseReveal(message.chat.id);
    }

    if (command === CommandEnum.Help) {
        return sendHelpPage(message.chat.id);
    }

    if (command === CommandEnum.Chat) {
        return sendChatPage(message.chat.id);
    }

    if (command?.startsWith('/')) {
        return BOT.sendMessage(
            message.chat.id,
            'I do not understand this, yet...\n' + 'Try /start command.'
        );
    }

    return sendTokenPage(message.chat.id, message.text);
};
