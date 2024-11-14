// ./src/api/order/routes/order.js

export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/verifyAndUpdate',
      handler: 'api::order.custom2.verifyAndUpdate',

    },
  ],
};
