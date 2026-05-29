import React from 'react';

export default function LoansPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600 mt-2">Manage and monitor loan portfolio</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          + New Loan
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Active Loans</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">2,245</div>
          <div className="text-xs text-gray-500 mt-2">Outstanding: $125.3M</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Principal</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">$342.8M</div>
          <div className="text-xs text-green-600 mt-2">↑ 5.2% YoY</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Delinquent (30+)</div>
          <div className="text-3xl font-bold text-red-600 mt-2">87</div>
          <div className="text-xs text-gray-500 mt-2">3.9% of portfolio</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Avg Interest Rate</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">6.45%</div>
          <div className="text-xs text-gray-500 mt-2">↓ 0.12% from last month</div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Loans</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Loan Number</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Borrower</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Principal</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Balance</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Rate</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">LN-{10000 + i}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">John Smith</td>
                  <td className="px-6 py-4 text-sm text-gray-900">$45,000</td>
                  <td className="px-6 py-4 text-sm text-gray-900">$32,500</td>
                  <td className="px-6 py-4 text-sm text-gray-900">5.99%</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
