import {Cell} from '@ton/core';

export const bocToCell = (boc: string, encoding: BufferEncoding = 'base64') =>
    Cell.fromBoc(Buffer.from(boc, encoding))[0];

export const bocToHash = (boc: Buffer) =>
    Cell.fromBoc(boc)[0].hash(0).toString('hex');
