import { factories } from '@strapi/strapi';
import Razorpay from 'razorpay';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async createRazorpayOrder(ctx) {
    try {
      const { amount, currency, receipt, notes } = ctx.request.body;

      // Initialize Razorpay instance
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
        key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay Key Secret
      });

      // Create order on Razorpay
      const options = {
        amount: amount * 100, // Amount in smallest currency unit (e.g., paise for INR)
        currency: currency,
        receipt: receipt,
        notes: notes,
      };

      const order = await razorpay.orders.create(options);

      // Check if order ID is created
      if (!order.id) {
        console.error("Failed to create Razorpay order. Order ID is missing.");
        ctx.throw(500, "Failed to create Razorpay order.");
        return;
      }

      console.log({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      });

      // Send the order ID to the client
      ctx.send({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      });
    } catch (err) {
      console.error("Error in creating Razorpay order:", err);
      ctx.throw(500, "An error occurred while creating the Razorpay order");
    }
  },
}));
