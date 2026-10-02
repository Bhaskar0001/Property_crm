
export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Property OS</h1>
        <p className="mt-1 text-sm text-gray-500">Here's what's happening with your properties today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Properties', value: '124' },
          { label: 'Active Leads', value: '32' },
          { label: 'New Customers', value: '18' },
          { label: 'Total Offers', value: '7' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white shadow-sm border border-gray-100">
        <div className="border-b border-gray-200 px-6 py-5">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Activities</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500">Activity feed will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
