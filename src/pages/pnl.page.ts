import {isDefined} from '@rnw-community/shared';

import {BOT, LITE_CLIENT} from '../globals';
import {send404Page} from './404.page';
import {TELEGRAM_BOT_USERNAME} from '../secrets';
import {getAssetBalance} from '../utils/asset.utils';
import {getPnlCard, getPnlInfo} from '../utils/pnl.utils';
import {CLOSE_BUTTON} from './buttons/close.button';
import {getWallet} from '../utils/wallet.utils';

export const sendPnlPage = async (chatId: number, assetAddress: string) => {
    await LITE_CLIENT.updateLastBlock();

    const wallet = await getWallet(chatId);
    const assetBalance = await getAssetBalance(assetAddress, wallet.address);
    const pnlInfo = await getPnlInfo(chatId, assetAddress, assetBalance);

    if (!isDefined(pnlInfo)) {
        return send404Page(chatId);
    }

    const pnlCard = await getPnlCard(pnlInfo);

    return BOT.sendPhoto(
        chatId,
        pnlCard,
        {
            caption: `@${TELEGRAM_BOT_USERNAME} - trading on TON`,
            reply_markup: {
                inline_keyboard: [[CLOSE_BUTTON]]
            }
        },
        {filename: 'konik_pnl_card.png', contentType: 'image/png'}
    );
};
