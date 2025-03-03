import {isDefined} from '@rnw-community/shared';
import {Message} from 'node-telegram-bot-api';

import {BOT} from '../globals';
import {send404Page} from './404.page';
import {deleteMessageSafe} from '../utils/bot.utils';
import {getPnlCard, getPnlInfo} from '../utils/pnl.utils';

export const sendPnlPage = async (message: Message, assetAddress: string) => {
    await deleteMessageSafe(message.chat.id, message.message_id);

    const pnlInfo = await getPnlInfo(message.chat.id, assetAddress);

    if (!isDefined(pnlInfo)) {
        return send404Page(message.chat.id);
    }

    const pnlCard = await getPnlCard(pnlInfo);

    return BOT.sendPhoto(
        message.chat.id,
        pnlCard,
        {},
        {filename: 'konik_pnl_card.png', contentType: 'image/png'}
    );
};
