const express = require('express'); // Import Express
const fs = require('fs');           // Import File System module
const app = express();              // Create an Express application
const PORT = 5000;                  // Define the port number

// Helper function to calculate sales data
const processSalesData = (data) => {
    const lines = data.split('\n');
    const salesData = lines.map(line => line.split(','));

    let totalSales = 0;
    const monthWiseSales = {};
    const mostPopularItems = {};
    const mostRevenueItems = {};
    const popularItemStats = {};

    salesData.forEach(row => {
        if (row.length < 5) return; // Skip invalid rows

        const [date, sku, unitPrice, quantity, totalPrice] = row;
        const month = date.slice(0, 7); // Get the month (YYYY-MM format)

        // Update total sales
        totalSales += parseFloat(totalPrice);

        // Update month-wise sales
        if (!monthWiseSales[month]) {
            monthWiseSales[month] = 0;
        }
        monthWiseSales[month] += parseFloat(totalPrice);

        // Track most popular items and their statistics
        if (!mostPopularItems[month]) mostPopularItems[month] = {};
        if (!mostRevenueItems[month]) mostRevenueItems[month] = {};

        const qty = parseInt(quantity, 10);
        const price = parseFloat(totalPrice);

        // Most popular items (by quantity)
        if (!mostPopularItems[month][sku]) mostPopularItems[month][sku] = 0;
        mostPopularItems[month][sku] += qty;

        // Items generating most revenue
        if (!mostRevenueItems[month][sku]) mostRevenueItems[month][sku] = 0;
        mostRevenueItems[month][sku] += price;

        // For the most popular item, track min, max, and avg orders
        if (!popularItemStats[sku]) popularItemStats[sku] = { min: qty, max: qty, total: qty, count: 1 };
        else {
            popularItemStats[sku].min = Math.min(popularItemStats[sku].min, qty);
            popularItemStats[sku].max = Math.max(popularItemStats[sku].max, qty);
            popularItemStats[sku].total += qty;
            popularItemStats[sku].count += 1;
        }
    });

    // Determine the most popular item and items generating most revenue in each month
    const result = {
        totalSales,
        monthWiseSales,
        mostPopularItems: {},
        mostRevenueItems: {},
        popularItemStats: {}
    };

    for (const month in mostPopularItems) {
        const maxItem = Object.keys(mostPopularItems[month]).reduce((a, b) => mostPopularItems[month][a] > mostPopularItems[month][b] ? a : b);
        const maxRevenueItem = Object.keys(mostRevenueItems[month]).reduce((a, b) => mostRevenueItems[month][a] > mostRevenueItems[month][b] ? a : b);

        result.mostPopularItems[month] = { item: maxItem, quantity: mostPopularItems[month][maxItem] };
        result.mostRevenueItems[month] = { item: maxRevenueItem, revenue: mostRevenueItems[month][maxRevenueItem] };
        result.popularItemStats[month] = {
            item: maxItem,
            minOrders: popularItemStats[maxItem].min,
            maxOrders: popularItemStats[maxItem].max,
            avgOrders: popularItemStats[maxItem].total / popularItemStats[maxItem].count
        };
    }

    return result;
};

// Endpoint to process sales data
app.get('/api/sales-data', (req, res) => {
    fs.readFile('./sales-data.csv', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Failed to read data file' });
            return;
        }
        const result = processSalesData(data);
        res.json(result);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
