const cron = require('node-cron');
const Cart = require('../src/models/cart');
const Product = require('../src/models/product');

const startCartExpirationJob = () => {
  cron.schedule('* * * * *', async () => {
    const EXPIRATION_MINUTES = 10;
    const expirationTime = new Date(Date.now() - EXPIRATION_MINUTES * 60 * 1000);

    try {
      const cartsToUpdate = await Cart.find({
        'items.addedAt': { $lt: expirationTime }
      }).populate('items.product');

      if (cartsToUpdate.length === 0) {
        return;
      }

      const stockUpdates = [];

      for (const cart of cartsToUpdate) {
        const nonExpiredItems = [];

        for (const item of cart.items) {
          if (item.addedAt < expirationTime) {
            stockUpdates.push({
              updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { stockQuantity: item.quantity } }
              }
            });
          } else {
            nonExpiredItems.push(item);
          }
        }
        cart.items = nonExpiredItems;
        await cart.save();
      }

      if (stockUpdates.length > 0) {
        await Product.bulkWrite(stockUpdates);
      }
    } catch (error) {
      console.error('Error during cart expiration job:', error);
    }
  });
};

module.exports = startCartExpirationJob;