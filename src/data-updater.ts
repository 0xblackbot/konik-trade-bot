import {checkLimitOrders} from './data-updaters/limit-orders.updater';
import {checkPendingTransactions} from './data-updaters/pending-transactions.updater';

const app = async () => {
    checkPendingTransactions();
    checkLimitOrders();
};

app();
