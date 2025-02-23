export const toNano = (value: string, decimals: number) =>
    BigInt(Number(value) * 10 ** decimals);

export const fromNano = (value: bigint, decimals: number) =>
    Number(value) / 10 ** decimals;
