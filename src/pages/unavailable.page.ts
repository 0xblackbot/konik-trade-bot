import {sendErrorPage} from './error.page';

export const sendUnavailablePage = (chatId: number) =>
    sendErrorPage(
        chatId,
        'The functionality you’re looking for is currently unavailable as we’re in the process of updating our system.\n' +
            'We’ll notify you as soon as the update is complete!'
    );
