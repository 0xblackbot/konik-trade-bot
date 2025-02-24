import {BOT} from '../globals';

export const send404Page = (chatId: number) =>
    BOT.sendMessage(
        chatId,
        'Something went wrong.\n' + 'Please, press button and try again.'
    );
