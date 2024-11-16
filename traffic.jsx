import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Search, Mail, User } from 'lucide-react';

const data = {
  '1D': [
    { name: '8AM', views: 150 },
    { name: '12PM', views: 300 },
    { name: '4PM', views: 200 },
    { name: '8PM', views: 400 },
  ],
  '1W': [
    { name: 'Mon', views: 300 },
    { name: 'Tue', views: 400 },
    { name: 'Wed', views: 200 },
    { name: 'Thu', views: 500 },
    { name: 'Fri', views: 300 },
  ],
  '1M': [
    { name: 'Week 1', views: 1200 },
    { name: 'Week 2', views: 1500 },
    { name: 'Week 3', views: 1000 },
    { name: 'Week 4', views: 1800 },
  ],
  '3M': [
    { name: 'Jan', views: 3500 },
    { name: 'Feb', views: 4000 },
    { name: 'Mar', views: 3000 },
  ],
  '1Y': [
    { name: 'Q1', views: 10000 },
    { name: 'Q2', views: 12000 },
    { name: 'Q3', views: 9000 },
    { name: 'Q4', views: 11000 },
  ],
};

const ProductInsights = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Product Insights</h1>
      
      {/* Views Summary */}
      <div className="mb-8">
        <h2 className="text-lg text-gray-600">Total Page Views</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">2,000</span>
          <span className="text-green-500 text-sm">+12%</span>
        </div>
        <div className="text-sm text-gray-500">Last 30 Days</div>
      </div>
      
      {/* Period Selector */}
      <div className="flex gap-4 mb-4">
        {Object.keys(data).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-3 py-1 rounded ${
              selectedPeriod === period
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {period}
          </button>
        ))}
      </div>
      
      {/* Chart */}
      <div className="h-64 mb-12">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data[selectedPeriod]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="views" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Device Breakdown */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-2">Page Views by Device</h2>
        <div className="text-3xl font-bold">Desktop 34%</div>
        <div className="text-sm text-gray-500 mb-4">Last 30 Days</div>
        
        <div className="space-y-4">
          {[
            { name: 'Desktop', value: 34 },
            { name: 'Mobile', value: 48 },
            { name: 'Tablet', value: 18 },
          ].map((device) => (
            <div key={device.name} className="space-y-1">
              <div className="text-gray-600">{device.name}</div>
              <div className="w-full bg-gray-100 h-2 rounded-full">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${device.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Products */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Top Products</h2>
        <div className="space-y-4">
          {[
            { name: 'Fleece Jacket', price: 33.33 },
            { name: 'Classic T-Shirt', price: 24.99 },
            { name: 'Hoodie', price: 45.00 },
            { name: 'Sweatshirt', price: 42.50 },
          ].map((product) => (
            <div
              key={product.name}
              className="flex justify-between items-center"
            >
              <span className="text-gray-600">{product.name}</span>
              <span className="font-medium">
                ${product.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between">
          <Home className="text-blue-500" />
          <Search />
          <Mail />
          <User />
        </div>
      </div>
    </div>
  );
};

export default ProductInsights;