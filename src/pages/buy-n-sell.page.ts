import {RedisUserAssetsService} from '../classes/redis-user-assets.service';
import {ParamsTypeEnum} from '../enums/params-type.enum';
import {BOT} from '../globals';
import {TELEGRAM_BOT_USERNAME} from '../secrets';
import {getAssetsList} from '../utils/api.utils';
import {CLOSE_BUTTON} from './buttons/close.button';
import {saveLastPage} from '../utils/ui-state.utils';

export const sendBuySellPage = async (chatId: number) => {
    const userAssets = await RedisUserAssetsService.getUserAssets(chatId);
    const assetsInfos = await getAssetsList({
        userAssets,
        limit: 0
    });

    const newMessage = await BOT.sendMessage(
        chatId,
        'To buy or sell a token, simply enter its address.\n' +
            (assetsInfos.length === 0
                ? ''
                : '\n' +
                  'Your tokens (tap to open):\n' +
                  assetsInfos
                      .map(
                          asset =>
                              ` - <a href="https://t.me/${TELEGRAM_BOT_USERNAME}?start=${ParamsTypeEnum.TokenPage}${asset.address}">${asset.symbol}</a>`
                      )
                      .join('\n')),
        {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [[CLOSE_BUTTON]]
            }
        }
    );

    await saveLastPage(chatId, newMessage);
};
