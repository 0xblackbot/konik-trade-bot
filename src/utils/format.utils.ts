export const formatOutputNumber = (value: number, fractionDigits = 2) => {
    if (value === 0) {
        return `${value.toFixed(fractionDigits)}`;
    }

    if (0.01 > value && value > -0.01) {
        return `${value.toFixed(6)}`;
    }

    if (1 > value && value > -1) {
        return `${value.toFixed(2)}`;
    }

    return `${value.toFixed(fractionDigits)}`;
};

export const formatFDV = (fdv: number) => {
    if (fdv >= 1e9) return (fdv / 1e9).toFixed(2) + 'B';
    if (fdv >= 1e6) return (fdv / 1e6).toFixed(2) + 'M';
    if (fdv >= 1e3) return (fdv / 1e3).toFixed(2) + 'K';

    return fdv.toString();
};

export const formatPriceImpact = (priceImpact: number) => {
    const sign = priceImpact < 0 ? '' : '+';

    return sign + formatOutputNumber(priceImpact) + '%';
};
