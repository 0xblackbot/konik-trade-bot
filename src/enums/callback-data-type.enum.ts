export enum CallbackDataType {
    Home = 'Home',
    BuyAndSell = 'BuyAndSell',
    DCAOrders = 'DCAOrders',
    LimitOrders = 'LimitOrders',
    Settings = 'Settings',
    ExportSeedPhrase = 'ExportSeedPhrase',
    WithdrawTON = 'WithdrawTON',
    Nothing = 'Nothing',
    ChangeMaxSlippage = 'ChangeMaxSlippage',
    ChangeBuyTop = 'ChangeBuyTop',
    ChangeBuyBottom = 'ChangeBuyBottom',
    ChangeSellTop = 'ChangeSellTop',
    ChangeSellBottom = 'ChangeSellBottom',
    Help = 'Help',
    RefreshHome = 'RefreshHome',
    RefreshToken = 'RefreshToken_',
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
