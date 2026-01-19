"use client";

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111827] mb-2">Analytics</h1>
        <p className="text-[#6b7280]">Track your channel performance and translation metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#6b7280]">Total Views</p>
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#111827] mb-1">124.5M</p>
          <p className="text-sm text-green-600">+12.5% from last month</p>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#6b7280]">Total Subscribers</p>
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#111827] mb-1">68.2M</p>
          <p className="text-sm text-green-600">+8.3% from last month</p>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#6b7280]">Videos Translated</p>
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#111827] mb-1">3,842</p>
          <p className="text-sm text-green-600">+156 this month</p>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-[#6b7280]">Active Channels</p>
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#111827] mb-1">16</p>
          <p className="text-sm text-[#6b7280]">Across 11 languages</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Channel Performance</h2>
          <div className="h-64 flex items-center justify-center bg-[#f9fafb] rounded-lg">
            <p className="text-[#6b7280]">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Top Languages by Views</h2>
          <div className="space-y-4">
            {[
              { lang: "Spanish", views: "45.2M", percent: 85, color: "bg-blue-600" },
              { lang: "French", views: "32.1M", percent: 65, color: "bg-purple-600" },
              { lang: "Portuguese", views: "28.5M", percent: 55, color: "bg-green-600" },
              { lang: "German", views: "18.7M", percent: 40, color: "bg-orange-600" },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#111827]">{item.lang}</span>
                  <span className="text-sm text-[#6b7280]">{item.views}</span>
                </div>
                <div className="w-full bg-[#e5e7eb] rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
