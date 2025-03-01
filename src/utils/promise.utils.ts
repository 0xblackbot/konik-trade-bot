export const sleep = (ms: number) =>
    new Promise(resolve => setTimeout(() => resolve('wake'), ms));

export const promiseAllByChunks = async <T>(
    chunkSize: number,
    promiseCreators: (() => T | PromiseLike<T>)[]
): Promise<Awaited<T>[]> => {
    const arrayLength = Math.ceil(promiseCreators.length / chunkSize);

    const result: Awaited<T>[] = [];

    for (let i = 0; i < arrayLength; i++) {
        const startIndex = i * chunkSize;
        const endIndex = (i + 1) * chunkSize;

        const chunk = promiseCreators.slice(startIndex, endIndex);

        const chunkResult = await Promise.all(chunk.map(creator => creator()));

        result.push(...chunkResult);
    }

    return result;
};
