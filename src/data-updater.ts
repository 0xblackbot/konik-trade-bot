import {updatePendingTransactions} from './data-updaters/pending-transactions.updater';

const app = async () => {
    updatePendingTransactions();
};

app();
