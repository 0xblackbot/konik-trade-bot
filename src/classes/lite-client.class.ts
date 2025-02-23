import {isDefined} from '@rnw-community/shared';
import {
    Address,
    TupleItem,
    serializeTuple,
    TupleReader,
    parseTuple,
    Cell
} from '@ton/core';
import {
    BlockID,
    LiteClient as RawLiteClient,
    LiteRoundRobinEngine,
    LiteSingleEngine
} from 'ton-lite-client';

import {LiteserverConfig} from '../interfaces/liteserver-config.interface';
import {intToIP} from '../utils/lite-client.utils';

export class LiteClient {
    private rawClient: RawLiteClient;
    private lastBlock: BlockID | undefined;

    constructor(server: LiteserverConfig) {
        const engines = [
            new LiteSingleEngine({
                host: `tcp://${intToIP(server.ip)}:${server.port}`,
                publicKey: Buffer.from(server.id.key, 'base64')
            })
        ];
        const engine = new LiteRoundRobinEngine(engines);

        this.rawClient = new RawLiteClient({engine});
    }

    public updateLastBlock = async () => {
        const masterchainInfo = await this.rawClient.getMasterchainInfo();

        this.lastBlock = masterchainInfo.last;
    };

    public runMethod = async (
        address: Address,
        name: string,
        stack: TupleItem[] = []
    ) => {
        if (!isDefined(this.lastBlock)) {
            throw new Error(
                'LiteClient lastBlock not defined, please call .updateLastBlock()'
            );
        }

        const response = await this.rawClient.runMethod(
            address,
            name,
            serializeTuple(stack).toBoc(),
            this.lastBlock
        );

        if (!isDefined(response.result)) {
            throw new Error('response.result not defined');
        }

        const resultTuple = parseTuple(
            Cell.fromBoc(Buffer.from(response.result, 'base64'))[0]
        );

        return new TupleReader(resultTuple);
    };

    public getBalance = async (address: Address) => {
        if (!isDefined(this.lastBlock)) {
            throw new Error(
                'LiteClient lastBlock not defined, please call .updateLastBlock()'
            );
        }

        const accountState = await this.rawClient.getAccountState(
            address,
            this.lastBlock
        );

        return accountState.balance.coins;
    };

    public sendMessage = (boc: Buffer) => this.rawClient.sendMessage(boc);

    public getAccountState = async (address: Address) => {
        if (!isDefined(this.lastBlock)) {
            throw new Error(
                'LiteClient lastBlock not defined, please call .updateLastBlock()'
            );
        }

        return this.rawClient.getAccountState(address, this.lastBlock);
    };
}
