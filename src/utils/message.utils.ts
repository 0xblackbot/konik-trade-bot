import {Message} from 'rainbow-swap-sdk';

export const getNanoTonSendAmount = (messages: Message[]) => {
    let nanoTonSendAmount = 0n;

    for (const message of messages) {
        nanoTonSendAmount += BigInt(message.amount);
    }

    return nanoTonSendAmount;
};
