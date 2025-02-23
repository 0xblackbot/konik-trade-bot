import {ButtonType} from '../enums/button-type.enum';
import {BOT} from '../globals';

export const sendWelcomePage = (chatId: number, walletAddress: string) =>
    BOT.sendMessage(
        chatId,
        '<b>Welcome to Konik Trade Bot</b> – the fastest and most secure way to trade any token on TON!\n' +
            '\n' +
            'You currently have no TON in your wallet. To start trading, deposit TON to your wallet address:\n' +
            `<code>${walletAddress}</code> (tap to copy)\n` +
            '\n' +
            'Once done, tap refresh and your balance will appear here.\n' +
            '\n' +
            'To buy a token, simply enter its token address.\n' +
            'To manage your wallet or export your seed phrase, tap Settings below.',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Buy & Sell',
                            callback_data: ButtonType.BuyAndSell
                        }
                    ],
                    [
                        {
                            text: 'DCA Orders',
                            callback_data: ButtonType.DCAOrders
                        },
                        {
                            text: 'Limit Orders',
                            callback_data: ButtonType.LimitOrders
                        }
                    ],
                    [{text: 'Settings', callback_data: ButtonType.Settings}],
                    [{text: 'Help', callback_data: ButtonType.Help}]
                ]
            }
        }
    );
