// In a real app, this would interact with a database (MongoDB/Postgres)
// For this demo, we'll just log to console or update a local JSON file

module.exports = {
    handleProductCreated: async ({ id, name, manufacturer, event }) => {
        // Logic: Create new product record in DB
        console.log(`[HANDLER] Processing new product: ${name} (ID: ${id})`);
        // await db.products.create({ ... })
    },

    handleProductTransferred: async ({ id, from, to, status, event }) => {
        // Logic: Update owner and status in DB
        console.log(`[HANDLER] Processing transfer: Product #${id} -> ${to}`);
        // await db.products.update({ id }, { owner: to, status })
    },

    handleEnvironmentalData: async ({ productId, temp, humidity, event }) => {
        // Logic: Add reading to time-series DB
        console.log(`[HANDLER] Processing env data: Product #${productId} Temp: ${temp}`);
        // await db.readings.add({ productId, temp, humidity, timestamp: new Date() })
    }
};
