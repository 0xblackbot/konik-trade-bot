export const formatOutputNumber = (value: number) => {
    if (value === 0) {
        return `0.00`;
    }

    if (0.01 > value && value > -0.01) {
        return `${value.toFixed(6)}`;
    }

    return `${value.toFixed(2)}`;
};
