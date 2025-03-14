export enum CallbackDataType {
    BuyAndSell = 'BuyAndSell',
    DCAOrders = 'DCAOrders',
    LimitOrders = 'LimitOrders',
    Settings = 'Settings',
    ExportSeedPhrase = 'ExportSeedPhrase',
    WithdrawTON = 'WithdrawTON',
    ChangeMaxSlippage = 'ChangeMaxSlippage',
    Help = 'Help',
    RefreshHome = 'RefreshHome',
    Close = 'Close',

    MarketBuy = 'MarketBuy_',
    MarketSell = 'MarketSell_',
    LimitBuy = 'LimitBuy_',
    LimitSell = 'LimitSell_',
    PriceChange = 'PriceChange_',

    LimitOrder = 'LimitOrder_',
    CancelLimitOrder = 'CancelLimitOrder_',

    CreateLimitOrder = 'CreateLimitOrder',
    CreateLimitOrderCancel = 'CreateLimitOrderCancel',
    CreateLimitOrderConfirm = 'CreateLimitOrderConfirm',
    LimitOrderTargetPrice = 'LimitOrderTargetPrice',

    CreateMarketOrderCancel = 'CreateMarketOrderCancel',
    CreateMarketOrderConfirm = 'CreateMarketOrderConfirm'
}
