import axios from 'axios';

export const sendWhatsAppReceipt = async (
  phone: string,
  orderDetails: {
    orderId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    orderDate: Date;
  }
): Promise<boolean> => {
  try {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;

    if (!apiUrl || !apiToken) {
      console.warn('WhatsApp API not configured. Mock receipt:');
      console.log(`Order ID: ${orderDetails.orderId}`);
      console.log(`Items:`, orderDetails.items);
      console.log(`Total: ₹${orderDetails.totalAmount}`);
      return true; // Return true for development
    }

    const receiptMessage = `
🍽️ *Order Confirmed - Chai Lelo*

Order ID: ${orderDetails.orderId}
Date: ${new Date(orderDetails.orderDate).toLocaleString()}

*Items:*
${orderDetails.items
  .map((item) => `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`)
  .join('\n')}

*Total Amount: ₹${orderDetails.totalAmount}*

Thank you for your order! 🎉
    `.trim();

    await axios.post(
      apiUrl,
      {
        to: phone,
        message: receiptMessage,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return true;
  } catch (error) {
    console.error('Error sending WhatsApp receipt:', error);
    return false;
  }
};

