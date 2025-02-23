import {Redis} from 'ioredis';

export const createRedisClient = (name: string) => {
    const client = new Redis();

    client.on('error', error => {
        console.log(`Redis ${name} error`, error);

        throw error;
    });

    return client;
};
