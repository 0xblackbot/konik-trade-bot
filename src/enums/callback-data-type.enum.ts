export enum CallbackDataType {
    BuyAndSell = 'BuyAndSell',
    DCAOrders = 'DCAOrders',
    LimitOrders = 'LimitOrders',
    Settings = 'Settings',
    ExportSeedPhrase = 'ExportSeedPhrase',
    ChangeMaxSlippage = 'ChangeMaxSlippage',
    Help = 'Help',
    RefreshHome = 'RefreshHome',
    Close = 'Close',

    MarketBuy = 'MarketBuy_',
    MarketSell = 'MarketSell_',

    LimitBuy = 'LimitBuy_',
    LimitSell = 'LimitSell_',

    LimitOrder = 'LimitOrder_',
    CancelLimitOrder = 'CancelLimitOrder_',
    CreateLimitOrder = 'CreateLimitOrder',
    CreateLimitOrderCancel = 'CreateLimitOrderCancel',
    CreateLimitOrderConfirm = 'CreateLimitOrderConfirm',
    LimitOrderTargetPrice = 'LimitOrderTargetPrice',

    PriceChange = 'PriceChange_'
}
