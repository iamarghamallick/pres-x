// Telegram Bot Service for sending PDFs
interface TelegramResponse {
    ok: boolean;
    result?: any;
    description?: string;
}

interface SendDocumentParams {
    chat_id: string;
    document: File | Blob;
    caption?: string;
    parse_mode?: 'HTML' | 'Markdown';
}

export class TelegramService {
    private botToken: string;
    private baseUrl: string;

    constructor() {
        this.botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '';
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;

        if (!this.botToken) {
            console.warn('Telegram bot token not configured');
        }
    }

    /**
     * Send PDF document to Telegram chat
     * @param chatId - Telegram chat ID (can be phone number with country code)
     * @param pdfBlob - PDF file as Blob
     * @param caption - Optional caption for the document
     */
    async sendDocument(chatId: string, pdfBlob: Blob, caption?: string): Promise<TelegramResponse> {
        try {
            const formData = new FormData();
            formData.append('chat_id', "865968884");
            formData.append('document', pdfBlob, 'prescription.pdf');

            if (caption) {
                formData.append('caption', caption);
                formData.append('parse_mode', 'HTML');
            }

            const response = await fetch(`${this.baseUrl}/sendDocument`, {
                method: 'POST',
                body: formData,
            });

            const result: TelegramResponse = await response.json();
            return result;
        } catch (error) {
            console.error('Error sending document to Telegram:', error);
            return {
                ok: false,
                description: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Get chat information by phone number
     * Note: This requires the user to have started a conversation with the bot first
     */
    async getChatByPhone(phone: string): Promise<TelegramResponse> {
        try {
            // Remove any non-digit characters and ensure it starts with country code
            const cleanPhone = phone.replace(/\D/g, '');
            const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;

            // Try to get chat info - this will only work if user has interacted with bot
            const response = await fetch(`${this.baseUrl}/getChat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: formattedPhone
                }),
            });

            const result: TelegramResponse = await response.json();
            return result;
        } catch (error) {
            console.error('Error getting chat by phone:', error);
            return {
                ok: false,
                description: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Send a message to prompt user to start conversation with bot
     */
    getBotStartLink(): string {
        const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'your_bot';
        return `https://t.me/${botUsername}?start=prescription`;
    }
}

export const telegramService = new TelegramService();
