// path: ./src/api/order/content-types/order/lifecycles.js

export default {
    async beforeCreate(event) {
      const { data } = event.params;
  
      // Get the latest order by creation date to determine the next order number
      const latestOrder = await strapi.entityService.findMany('api::order.order', {
        sort: { createdAt: 'desc' },
        limit: 1,
      });
  
      // Calculate the next ID
      const nextId = latestOrder.length > 0 && latestOrder[0].order_id
        ? parseInt(latestOrder[0].order_id.split('-')[1], 10) + 1
        : 1;
  
      // Format the order number as "ORD-0001"
      data.order_id = `ORD-${String(nextId).padStart(4, '0')}`;
    },
  };
  