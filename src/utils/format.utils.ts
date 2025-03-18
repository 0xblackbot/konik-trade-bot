export const formatOutputNumber = (value: number) => {
    if (value === 0) {
        return `0.00`;
    }

    if (0.01 > value && value > -0.01) {
        return `${value.toFixed(6)}`;
    }

    return `${value.toFixed(2)}`;
};

export const formatFDV = (fdv: number) => {
    if (fdv >= 1e9) return (fdv / 1e9).toFixed(2) + 'B';
    if (fdv >= 1e6) return (fdv / 1e6).toFixed(2) + 'M';
    if (fdv >= 1e3) return (fdv / 1e3).toFixed(2) + 'K';

    return fdv.toString();
};
