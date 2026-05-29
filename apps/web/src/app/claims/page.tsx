import React from 'react';

export default function ClaimsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Claims</h1>
          <p className="text-gray-600 mt-2">Review and manage claims</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          + New Claim
        </button>
      </div>

      {/* Claims Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Claims</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">1,245</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Pending Review</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">124</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Approved</div>
          <div className="text-3xl font-bold text-green-600 mt-2">892</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Flagged (Fraud)</div>
          <div className="text-3xl font-bold text-red-600 mt-2">18</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Avg Fraud Score</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0.32</div>
        </div>
      </div>

      {/* Claims by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
          <div className="space-y-3">
            {['Submitted', 'Under Review', 'Approved', 'Denied', 'Paid'].map((status) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 bg-gray-200 rounded-full" />
                  <span className="text-sm font-medium text-gray-900">120</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fraud Indicators</h2>
          <div className="space-y-3">
            {[
              { indicator: 'Velocity Spike', count: 8 },
              { indicator: 'Duplicate Claim', count: 5 },
              { indicator: 'High Amount', count: 3 },
              { indicator: 'Document Fraud', count: 2 },
            ].map((item) => (
              <div key={item.indicator} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm text-red-900">{item.indicator}</span>
                <span className="text-sm font-semibold text-red-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Claims</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Claim #</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Claimant</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Fraud Score</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">CLM-{10000 + i}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Jane Doe</td>
                  <td className="px-6 py-4 text-sm text-gray-900">$8,500</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-green-600">0.15</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Approved
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
