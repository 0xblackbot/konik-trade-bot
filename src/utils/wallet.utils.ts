import {isDefined} from '@rnw-community/shared';
import {Address} from '@ton/core';
import {mnemonicNew} from '@ton/crypto';

import {RedisWalletService} from '../classes/redis-wallet.service';
import {Wallet} from '../classes/wallet.class';
import {LITE_CLIENT} from '../globals';

export const getSeqno = async (address: Address) =>
    LITE_CLIENT.runMethod(address, 'seqno')
        .then(response => response.readNumber())
        .catch(() => 0);

export const getWallet = async (chatId: number) => {
    const mnemonic = await RedisWalletService.getMnemonic(chatId);

    /** new user */
    if (!isDefined(mnemonic)) {
        const newMnemonic = await mnemonicNew().then(array => array.join(' '));
        await RedisWalletService.setMnemonic(chatId, newMnemonic);

        return Wallet.initialize(newMnemonic);
    } else {
        return Wallet.initialize(mnemonic);
    }
};
