import {createCanvas, loadImage} from 'canvas';
import * as path from 'node:path';
import {SwapHistoryData} from 'rainbow-swap-sdk';

import {TON} from '../globals';
import {getBestRoute} from './best-route.utils';
import {formatOutputNumber} from './format.utils';
import {RedisUserAssetsService} from '../classes/redis-user-assets.service';
import {PnlInfo} from '../interfaces/pnl-info.interface';

export const getTonSpentAmount = (historyData: SwapHistoryData) => {
    if (historyData.sentInfo && historyData.receivedInfo) {
        if (historyData.sentInfo.symbol === TON) {
            return historyData.sentInfo.amount;
        } else {
            return -historyData.receivedInfo.amount;
        }
    }

    return 0;
};

export const getPnlInfo = async (
    chatId: number,
    assetAddress: string,
    assetBalance: bigint
) => {
    const spentRecord =
        await RedisUserAssetsService.getUserTonSpentAmountRecord(chatId);
    const tonSpentAmount = spentRecord[assetAddress] ?? 0;

    if (tonSpentAmount === 0) {
        return undefined;
    }

    const bestRoute = await getBestRoute(
        chatId,
        assetBalance,
        assetAddress,
        TON
    );

    const ticker =
        bestRoute.displayData.inputAsset.symbol +
        '/' +
        bestRoute.displayData.outputAsset.symbol;
    const currentTonValue = bestRoute.displayData.outputAssetAmount;
    const pnl = ((currentTonValue - tonSpentAmount) / tonSpentAmount) * 100;

    const info: PnlInfo = {
        tonSpentAmount,
        currentTonValue,
        ticker,
        pnl
    };

    return info;
};

const BG_IMAGES = {
    profit: [
        '../pnl-card-bg-images/profit/2.png',
        '../pnl-card-bg-images/profit/3.png',
        '../pnl-card-bg-images/profit/4.png'
    ],
    loss: [
        '../pnl-card-bg-images/loss/5.png',
        '../pnl-card-bg-images/loss/6.png',
        '../pnl-card-bg-images/loss/7.png'
    ]
};

const WIDTH = 990;
const HEIGHT = 580;

export const getPnlCard = async (pnlInfo: PnlInfo) => {
    const isPositive = pnlInfo.pnl >= 0;

    const pnlWithoutSign = isPositive ? pnlInfo.pnl : -1 * pnlInfo.pnl;
    const pnlSign = isPositive ? '+' : '-';
    const pnlColor = isPositive ? '#2ec183' : '#ff3a59';
    const bgImages = isPositive ? BG_IMAGES.profit : BG_IMAGES.loss;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Select a random background image
    const randomBg = bgImages[Math.floor(Math.random() * bgImages.length)];
    const bgPath = path.join(__dirname, randomBg);
    const background = await loadImage(bgPath);

    ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
    ctx.textBaseline = 'top';

    // Add text (balance & PNL)
    ctx.font = 'bold 34px Helvetica';
    ctx.fillStyle = '#48a4fa';
    ctx.fillText(pnlInfo.ticker, 106, 122);
    ctx.fillText(formatOutputNumber(pnlInfo.tonSpentAmount) + ' TON', 215, 302);
    ctx.fillText(
        formatOutputNumber(pnlInfo.currentTonValue) + ' TON',
        215,
        352
    );

    ctx.font = 'bold 96px Helvetica';
    ctx.fillStyle = pnlColor;
    ctx.fillText(`${pnlSign} ${formatOutputNumber(pnlWithoutSign)}%`, 106, 177);

    return canvas.toBuffer('image/png');
};
