import {isDefined} from '@rnw-community/shared';

import {BOT} from '../globals';
import {send404Page} from './404.page';
import {getPnlCard, getPnlInfo} from '../utils/pnl.utils';

export const sendPnlPage = async (chatId: number, assetAddress: string) => {
    const pnlInfo = await getPnlInfo(chatId, assetAddress);

    if (!isDefined(pnlInfo)) {
        return send404Page(chatId);
    }

    const pnlCard = await getPnlCard(pnlInfo);

    return BOT.sendPhoto(
        chatId,
        pnlCard,
        {},
        {filename: 'konik_pnl_card.png', contentType: 'image/png'}
    );
};
