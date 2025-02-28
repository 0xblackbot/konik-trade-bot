import {isDefined} from '@rnw-community/shared';

import {BOT} from '../globals';

export const deleteMessageSafe = (chatId: number, messageId?: number) => {
    if (isDefined(messageId)) {
        return BOT.deleteMessage(chatId, messageId).catch(() => 0);
    }
};
