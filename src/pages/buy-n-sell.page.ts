import {RedisUserAssetsService} from '../classes/redis-user-assets.service';
import {ParamsTypeEnum} from '../enums/params-type.enum';
import {BOT} from '../globals';
import {TELEGRAM_BOT_USERNAME} from '../secrets';
import {getAssetsList} from '../utils/api.utils';
import {CLOSE_BUTTON} from './buttons/close.button';

export const sendBuySellPage = async (chatId: number) => {
    const userAssets = await RedisUserAssetsService.getUserAssets(chatId);
    const assetsInfos = await getAssetsList({
        userAssets,
        limit: 0
    });

    return BOT.sendMessage(
        chatId,
        'To buy or sell a token, simply enter its address.\n' +
            (assetsInfos.length === 0
                ? ''
                : '\n' +
                  'Your tokens:\n' +
                  assetsInfos
                      .map(
                          asset =>
                              ` - ${asset.symbol} <a href="https://t.me/${TELEGRAM_BOT_USERNAME}?start=${ParamsTypeEnum.TokenPage}${asset.address}">Open</a>`
                      )
                      .join('\n')),
        {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [CLOSE_BUTTON]
            }
        }
    );
};
