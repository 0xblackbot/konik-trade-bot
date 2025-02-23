import {
    Address,
    beginCell,
    external,
    internal,
    OutActionSendMsg,
    SendMode,
    storeMessage
} from '@ton/core';
import {KeyPair, mnemonicToPrivateKey} from '@ton/crypto';
import {WalletContractV5R1} from '@ton/ton';
import {createWalletTransferV5R1} from '@ton/ton/dist/wallets/signing/createWalletTransfer';
import {
    WalletIdV5R1,
    WalletIdV5R1ClientContext
} from '@ton/ton/dist/wallets/v5r1/WalletV5R1WalletId';
import {storeWalletIdV5R1} from '@ton/ton/dist/wallets/WalletContractV5R1';

import {LITE_CLIENT} from '../globals';
import {TransferParams} from '../interfaces/transfer-params.interface';
import {bocToHash} from '../utils/boc.utils';
import {getSeqno} from '../utils/wallet.utils';

const WORKCHAIN = 0;

const WALLET_V5_ID: WalletIdV5R1<WalletIdV5R1ClientContext> = {
    networkGlobalId: -239,
    context: {
        workchain: WORKCHAIN,
        walletVersion: 'v5r1',
        subwalletNumber: 0
    }
};

export class Wallet {
    public address: Address;
    private keyPair: KeyPair;

    constructor(address: Address, keyPair: KeyPair) {
        this.address = address;
        this.keyPair = keyPair;
    }

    public static initialize = async (mnemonic: string) => {
        const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));

        const walletContract = WalletContractV5R1.create({
            walletId: WALLET_V5_ID,
            publicKey: keyPair.publicKey
        });

        return new Wallet(walletContract.address, keyPair);
    };

    public createTransferBoc = async (
        transferParams: TransferParams[],
        sendMode: SendMode = SendMode.PAY_GAS_SEPARATELY
    ) => {
        const seqno = await getSeqno(this.address);

        const messagesRelaxed = transferParams.map(transferParam =>
            internal({
                to: transferParam.to,
                value: transferParam.value,
                bounce: true,
                init: transferParam.init,
                body: transferParam.body
            })
        );

        const transferCell = createWalletTransferV5R1({
            seqno: seqno,
            sendMode: sendMode,
            secretKey: this.keyPair.secretKey,
            messages: messagesRelaxed,
            actions: messagesRelaxed.map<OutActionSendMsg>(message => ({
                type: 'sendMsg',
                mode: sendMode,
                outMsg: message
            })),
            walletId: storeWalletIdV5R1(WALLET_V5_ID)
        });

        const externalMessage = external({
            to: this.address,
            body: transferCell
        });

        return beginCell()
            .store(storeMessage(externalMessage))
            .endCell()
            .toBoc();
    };

    public sendBoc = async (boc: Buffer) => {
        await LITE_CLIENT.sendMessage(boc).catch(() => null);

        return bocToHash(boc);
    };
}
