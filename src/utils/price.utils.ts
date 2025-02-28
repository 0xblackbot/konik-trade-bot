import {OrderSide} from '../enums/order-side.enum';

export const getAssetPrice = (
    side: OrderSide,
    inputAssetAmount: number,
    outputAssetAmount: number
) => {
    if (side === OrderSide.Buy) {
        return inputAssetAmount / outputAssetAmount;
    } else {
        return outputAssetAmount / inputAssetAmount;
    }
};
