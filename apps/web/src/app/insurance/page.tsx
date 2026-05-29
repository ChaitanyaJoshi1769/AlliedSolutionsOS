import React from 'react';

export default function InsurancePage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Insurance Policies</h1>
          <p className="text-gray-600 mt-2">Manage insurance portfolio</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          + New Policy
        </button>
      </div>

      {/* Insurance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Active Policies</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">3,521</div>
          <div className="text-xs text-gray-500 mt-2">Premium: $12.4M</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Coverage</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">$856.2M</div>
          <div className="text-xs text-green-600 mt-2">↑ 8.5% YoY</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Expiring Soon</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">245</div>
          <div className="text-xs text-gray-500 mt-2">Within 30 days</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Avg Premium</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">$3,524</div>
          <div className="text-xs text-gray-500 mt-2">Annual</div>
        </div>
      </div>

      {/* Policy Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { type: 'Auto Insurance', count: 1840, premium: '$5.2M' },
          { type: 'Home Insurance', count: 1050, premium: '$4.8M' },
          { type: 'Life Insurance', count: 631, premium: '$2.4M' },
        ].map((policy) => (
          <div key={policy.type} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">{policy.type}</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Policies:</span>
                <span className="text-sm font-medium text-gray-900">{policy.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Premium:</span>
                <span className="text-sm font-medium text-gray-900">{policy.premium}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Policies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Policies</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Policy #</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Holder</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Coverage</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">POL-{10000 + i}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Policy Holder {i}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Auto</td>
                  <td className="px-6 py-4 text-sm text-gray-900">$250,000</td>
                  <td className="px-6 py-4 text-sm text-gray-900">2025-12-31</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
