
export default {
    routes: [
      {
        method: 'POST',
        path: '/orders/pretransaction',
        handler: 'api::order.custom.createRazorpayOrder',
      
      },
    ],
  };