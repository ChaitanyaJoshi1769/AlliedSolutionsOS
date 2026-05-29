import React from 'react';

export default function FraudPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Fraud Detection Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time fraud analysis and risk assessment</p>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-600">
          <div className="text-sm font-medium text-gray-600">Critical Risk</div>
          <div className="text-3xl font-bold text-red-600 mt-2">12</div>
          <div className="text-xs text-gray-500 mt-2">Immediate action required</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-600">
          <div className="text-sm font-medium text-gray-600">High Risk</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">48</div>
          <div className="text-xs text-gray-500 mt-2">Under review</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
          <div className="text-sm font-medium text-gray-600">Medium Risk</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">156</div>
          <div className="text-xs text-gray-500 mt-2">Monitoring</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
          <div className="text-sm font-medium text-gray-600">Low Risk</div>
          <div className="text-3xl font-bold text-green-600 mt-2">2,847</div>
          <div className="text-xs text-gray-500 mt-2">Approved</div>
        </div>
      </div>

      {/* Fraud Models Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detection Model Accuracy</h2>
          <div className="space-y-4">
            {[
              { model: 'Synthetic Identity', accuracy: 94.2 },
              { model: 'Behavioral Anomaly', accuracy: 91.8 },
              { model: 'Document Fraud', accuracy: 88.5 },
              { model: 'Network Analysis', accuracy: 92.1 },
              { model: 'Velocity Check', accuracy: 89.7 },
            ].map((item) => (
              <div key={item.model}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">{item.model}</span>
                  <span className="text-sm font-medium text-gray-900">{item.accuracy}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Fraud Indicators</h2>
          <div className="space-y-3">
            {[
              { indicator: 'Velocity Spike', cases: 34 },
              { indicator: 'Duplicate Claim', cases: 28 },
              { indicator: 'High Amount', cases: 22 },
              { indicator: 'Document Mismatch', cases: 18 },
              { indicator: 'Location Anomaly', cases: 15 },
              { indicator: 'Payment Pattern', cases: 12 },
            ].map((item) => (
              <div key={item.indicator} className="flex items-center justify-between p-3 bg-red-50 rounded">
                <span className="text-sm text-gray-700">{item.indicator}</span>
                <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-semibold">
                  {item.cases}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Fraud Cases */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Fraud Detections</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Entity</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Fraud Score</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Primary Indicator</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { id: 'CLM-10001', type: 'Claim', score: 0.89, indicator: 'Velocity Spike', risk: 'CRITICAL' },
                { id: 'LN-10002', type: 'Loan', score: 0.76, indicator: 'Synthetic ID', risk: 'HIGH' },
                { id: 'CLM-10003', type: 'Claim', score: 0.65, indicator: 'Duplicate', risk: 'MEDIUM' },
              ].map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.type}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-medium text-red-600">{item.score.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.indicator}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.risk === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      item.risk === 'HIGH' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.risk}
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
