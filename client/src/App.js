import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [salesData, setSalesData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/sales-data') // Fetch from the updated API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Received sales data:', data); // Log the received data
        setSalesData(data); // Set the parsed data
      })
      .catch((err) => console.error('Error fetching the sales data:', err));
  }, []);

  if (!salesData) return <div>Loading...</div>;

  return (
    <div className="App">
      <h1>Ice Cream Sales Data</h1>
      
      <h2>Total Sales: ${salesData.totalSales.toFixed(2)}</h2>

      <h3>Month-wise Sales Totals:</h3>
      <ul>
        {Object.entries(salesData.monthWiseSales).map(([month, total]) => (
          <li key={month}>{month}: ${total.toFixed(2)}</li>
        ))}
      </ul>

      <h3>Most Popular Items Each Month:</h3>
      <ul>
        {Object.entries(salesData.popularItemStats).map(([month, stats]) => (
          <li key={month}>
            <strong>{month}</strong>: {stats.mostPopularItem} - Min: {stats.minOrders}, Max: {stats.maxOrders}, Avg: {stats.avgOrders.toFixed(2)}
          </li>
        ))}
      </ul>

      <h3>Items Generating Most Revenue Each Month:</h3>
      <ul>
        {Object.entries(salesData.revenueItems).map(([month, items]) => (
          <li key={month}>
            <strong>{month}</strong>: 
            <ul>
              {Object.entries(items).map(([item, revenue]) => (
                <li key={item}>{item}: ${revenue.toFixed(2)}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
