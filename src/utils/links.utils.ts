import {ParamsTypeEnum} from '../enums/params-type.enum';
import {TELEGRAM_BOT_USERNAME} from '../secrets';

export const getPnlLink = (address: string) =>
    `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${ParamsTypeEnum.PNL}${address}`;

export const getTokenPageLink = (address: string) =>
    `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${ParamsTypeEnum.TokenPage}${address}`;

export const getShareTokenLink = (address: string) =>
    `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${ParamsTypeEnum.ShareToken}${address}`;
