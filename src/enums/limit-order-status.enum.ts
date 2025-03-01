export enum LimitOrderStatus {
    Active = 'Active',
    Cancelled = 'Cancelled',
    Pending = 'Pending', // transaction sent, waiting for result
    Filled = 'Filled'
}
