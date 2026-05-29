import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Allied Solutions OS</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Loans</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">2,541</div>
          <div className="text-xs text-green-600 mt-2">↑ 12.5% from last month</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Active Claims</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">384</div>
          <div className="text-xs text-green-600 mt-2">↑ 8.2% from last month</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Fraud Score (Avg)</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0.24</div>
          <div className="text-xs text-red-600 mt-2">↑ 5.1% from last month</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Outstanding Balance</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">$12.4M</div>
          <div className="text-xs text-green-600 mt-2">↓ 3.2% from last month</div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Portfolio Trend</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Chart placeholder</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Claims Status Distribution</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Chart placeholder</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center p-3 border-b border-gray-200">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Loan #LN-{10000 + i} Created</div>
                <div className="text-xs text-gray-600">A new loan application was submitted</div>
              </div>
              <div className="text-xs text-gray-500">2 hours ago</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
