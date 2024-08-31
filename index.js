const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Full path to the CSV file
const csvFilePath = path.resolve('server','sales-data.csv');
console.log(csvFilePath);
// Enable CORS
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Helper function to process sales data
const processSalesData = (data) => {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');
    const salesData = lines.slice(1).map(line => {
        const [date, sku, unitPrice, quantity, totalPrice] = line.split(',');
        return { date, sku, unitPrice: parseFloat(unitPrice), quantity: parseInt(quantity, 10), totalPrice: parseFloat(totalPrice) };
    });

    const result = {
        totalSales: 0,
        monthWiseSales: {},
        popularItems: {},
        revenueItems: {},
        popularItemStats: {}
    };

    salesData.forEach(row => {
        const { date, sku, unitPrice, quantity, totalPrice } = row;
        const month = new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' });
        const quantitySold = quantity;
        const totalRevenue = totalPrice;

        // Calculate total sales
        result.totalSales += totalRevenue;

        // Calculate month-wise sales totals
        if (!result.monthWiseSales[month]) {
            result.monthWiseSales[month] = 0;
        }
        result.monthWiseSales[month] += totalRevenue;

        // Track the most popular item by quantity
        if (!result.popularItems[month]) {
            result.popularItems[month] = {};
        }
        if (!result.popularItems[month][sku]) {
            result.popularItems[month][sku] = 0;
        }
        result.popularItems[month][sku] += quantitySold;

        // Track items generating most revenue
        if (!result.revenueItems[month]) {
            result.revenueItems[month] = {};
        }
        if (!result.revenueItems[month][sku]) {
            result.revenueItems[month][sku] = 0;
        }
        result.revenueItems[month][sku] += totalRevenue;
    });

    // Determine most popular item, min, max, and average number of orders for each month
    for (const month in result.popularItems) {
        const items = result.popularItems[month];
        const maxItem = Object.keys(items).reduce((a, b) => items[a] > items[b] ? a : b);
        const orders = Object.values(items);
        const minOrders = Math.min(...orders);
        const maxOrders = Math.max(...orders);
        const avgOrders = orders.reduce((a, b) => a + b, 0) / orders.length;

        result.popularItemStats[month] = {
            mostPopularItem: maxItem,
            minOrders: minOrders,
            maxOrders: maxOrders,
            avgOrders: avgOrders
        };
    }

    return result;
};

// Endpoint to process sales data
app.get('/api/sales-data', (req, res) => {
    console.log('err');
    fs.readFile(csvFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the CSV file:', err);
            res.status(500).json({ error: 'Failed to read data file' });
            return;
        }
        const result = processSalesData(data);
        res.json(result);
    });
});

// The "catchall" handler: for any request that doesn't match above routes, send back React's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
