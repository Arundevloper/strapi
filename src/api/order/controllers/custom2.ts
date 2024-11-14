// ./src/api/order/controllers/order.js

import { factories } from "@strapi/strapi";
import Razorpay from "razorpay";
import crypto from "crypto";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async verifyAndUpdate(ctx) {
      try {
        console.log(ctx.request.body);
        const { payment } = ctx.request.body;

        // Destructure required fields from the payment object
        const {
          razorpay_payment_id,
          razorpay_signature,
          payment_id,
          order_id,
          amount,
        } = payment;

        const existingPayment = await strapi.db
          .query("api::payment.payment")
          .findOne({
            where: { documentId: payment_id },
          });

        console.log(existingPayment);

        if (!existingPayment) {
          return ctx.throw(404, "Payment record not found");
        }

        console.log("order_id is ", order_id);
        // Verify payment signature
        const isPaymentValid = verifyPayment({
          order_id,
          razorpay_payment_id,
          razorpay_signature,
        });

        if (!isPaymentValid) {
          return ctx.throw(400, "Payment signature verification failed");
        }

        // Initialize Razorpay instance to capture the payment
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Capture the payment with the amount and currency from the existing payment record
        const capturedPayment = await razorpay.payments.capture(
          razorpay_payment_id,
          amount,
          "INR"
        );

        console.log(capturedPayment);
        console.log(amount);

        const updatedPayment = await strapi.db
          .query("api::payment.payment")
          .update({
            where: { documentId: payment_id },
            data: {
              amount: parseFloat(String(capturedPayment.amount)) / 100,
              PaymentMethod: capturedPayment.method || "DebitCard",
              razorpay_Signature: razorpay_signature,
              transaction_id: razorpay_payment_id,
              razorpay_order_id: order_id,
              payment_status: "Paid",
              publishedAt: new Date(),
            },
          });

        console.log(updatedPayment)

        // try {
        //   await strapi.entityService.update(
        //     "api::payment.payment",
        //     updatedPayment.id,
        //     {
        //       data: {
        //         publishedAt: new Date(),
        //       },
        //     }
        //   );
        // } catch (publishError) {
        //   console.error("Error during publishing:", publishError);
        //   ctx.throw(500, "Failed to publish payment entry");
        // }
        

        // Return success response
        ctx.send({
          message: "Payment captured and details updated successfully",
          payment_id: existingPayment.id,
        });
      } catch (error) {
        console.error("Error fetching and updating payment methods:", error);
        ctx.throw(500, "Failed to fetch and update payment methods");
      }
    },
  })
);

// Function to verify payment signature
function verifyPayment({ order_id, razorpay_payment_id, razorpay_signature }) {
  const key_secret = process.env.RAZORPAY_KEY_SECRET; // Ensure this is set in your environment variables
  const data = order_id + "|" + razorpay_payment_id;
  const hmac = crypto.createHmac("sha256", key_secret);
  hmac.update(data);
  const generated_signature = hmac.digest("hex");

  return generated_signature === razorpay_signature;
}
