import {RedisUserAssetsService} from '../classes/redis-user-assets.service';
import {BOT} from '../globals';
import {getAssetsList} from '../utils/api.utils';

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
                              ` - ${asset.symbol} <code>${asset.address}</code>`
                      )
                      .join('\n')),
        {
            parse_mode: 'HTML'
        }
    );
};
