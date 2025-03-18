import {BOT} from '../../globals';
import {CLOSE_BUTTON} from '../buttons/close.button';

export const sendHelpPage = (chatId: number) =>
    BOT.sendMessage(
        chatId,
        '*Help:*\n' +
            '\n' +
            '*Which tokens can I trade?*\n' +
            'You can trade any token paired with TON on DeDust, StonFi, or TONCO. We instantly pick up new pairs and will integrate more platforms over time.\n' +
            '\n' +
            '*Is Konik Trade Bot free? What are the fees?*\n' +
            'Yes! Konik Trade Bot is free to use. We only charge a 0.1% fee per transaction, keeping the bot accessible to everyone.\n' +
            '\n' +
            '*Why is my Net Profit lower than expected?*\n' +
            'Net Profit is calculated after deducting all costs, including Price Impact, Transfer Tax, DEX Fees, and the Konik Trade Bot fee. This ensures you see the actual amount received after all deductions.\n' +
            '\n' +
            '*Need more help?*\n' +
            'Join our Telegram chat: @konik\\_trade\\_chat',
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[CLOSE_BUTTON]]
            }
        }
    );
