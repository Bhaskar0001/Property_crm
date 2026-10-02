import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Plus,
  ArrowUpRight,
  Clock,
  PhoneCall,
} from 'lucide-react';
import { useDashboardMetrics } from '../../hooks/useAnalytics';

export function DashboardPage() {
  const [range, setRange] = useState('30d');
  const { data, isLoading } = useDashboardMetrics(range);

  const overview = data?.overview || {
    totalProperties: 0,
    publishedProperties: 0,
    totalLeads: 0,
    newLeadsInPeriod: 0,
    totalCustomers: 0,
    totalOffers: 0,
    pendingOffers: 0,
    acceptedDeals: 0,
    totalDealVolume: 0,
  };

  const operations = data?.operations || {
    todayViewings: 0,
    overdueTasks: 0,
    unreadWhatsApp: 0,
  };

  const monthlyTrend: { month: string; leads: number; deals: number }[] =
    data?.monthlyTrend || [];
  const leadStages: { _id: string; name: string; color: string; count: number }[] =
    data?.leadStages || [];
  const recentActivities: any[] = data?.recentActivities || [];

  // Compute maximum monthly count for relative bar scaling
  const maxBarValue = Math.max(
    ...monthlyTrend.map((m) => Math.max(m.leads, m.deals)),
    10
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time business performance, operational alerts, and deal pipeline intelligence.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-3 py-1.5 bg-white font-medium text-gray-700 shadow-xs focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">This Quarter</option>
            <option value="365d">This Year</option>
          </select>
          <Link
            to="/properties/new"
            className="inline-flex items-center px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-md text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Listing
          </Link>
        </div>
      </div>

      {/* Operational Attention Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/viewings"
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs hover:border-primary/50 transition flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Today's Viewings</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{operations.todayViewings}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          to="/telecaller"
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs hover:border-amber-400 transition flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Overdue Follow-ups</p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">{operations.overdueTasks}</p>
            </div>
          </div>
          <PhoneCall className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          to="/whatsapp"
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs hover:border-emerald-500 transition flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Unread Messages</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">
                {operations.unreadWhatsApp}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Properties */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Properties
            </span>
            <Building className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{overview.totalProperties}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <span className="font-semibold text-emerald-600 mr-1">
              {overview.publishedProperties}
            </span>{' '}
            active & published
          </p>
        </div>

        {/* Active CRM Leads */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              CRM Leads
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{overview.totalLeads}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <span className="font-semibold text-indigo-600 mr-1">
              +{overview.newLeadsInPeriod}
            </span>{' '}
            new in selected period
          </p>
        </div>

        {/* Agreed Sales / Deals */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Agreed Deals
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{overview.acceptedDeals}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <span className="font-semibold text-amber-600 mr-1">{overview.pendingOffers}</span>{' '}
            offers pending review
          </p>
        </div>

        {/* Gross Deal Volume */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Agreed Deal Volume
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            €{overview.totalDealVolume.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Conveyancing pipeline total</p>
        </div>
      </div>

      {/* Center Grid: Monthly Trend Chart & Lead Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Bar Chart (6 Months) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Lead Influx & Deal Conversion</h3>
              <p className="text-xs text-gray-500">6-Month historical momentum</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-primary mr-1" /> Leads Influx
              </span>
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1" /> Closed Deals
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="h-52 flex items-center justify-center text-xs text-gray-400">
              Loading trends...
            </div>
          ) : (
            <div className="h-52 flex items-end justify-between pt-6 px-4">
              {monthlyTrend.map((m, idx) => {
                const leadHeight = Math.round((m.leads / maxBarValue) * 100);
                const dealHeight = Math.round((m.deals / maxBarValue) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center space-y-2 flex-1 max-w-[60px]">
                    <div className="flex items-end space-x-1.5 h-36 w-full justify-center">
                      {/* Leads Bar */}
                      <div
                        style={{ height: `${Math.max(8, leadHeight)}%` }}
                        className="w-4 bg-primary/80 hover:bg-primary rounded-t transition-all group relative flex items-center justify-center"
                      >
                        <span className="absolute -top-6 text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition">
                          {m.leads}
                        </span>
                      </div>
                      {/* Deals Bar */}
                      <div
                        style={{ height: `${Math.max(8, dealHeight)}%` }}
                        className="w-4 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all group relative flex items-center justify-center"
                      >
                        <span className="absolute -top-6 text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition">
                          {m.deals}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-gray-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lead Stages Pipeline Distribution */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Lead Pipeline Breakdown</h3>
            <Link to="/leads" className="text-xs font-semibold text-primary hover:underline">
              View Kanban
            </Link>
          </div>
          <div className="space-y-3 pt-2">
            {leadStages.map((stage) => {
              const percent =
                overview.totalLeads > 0
                  ? Math.round((stage.count / overview.totalLeads) * 100)
                  : 0;

              return (
                <div key={stage._id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-800">{stage.name}</span>
                    <span className="font-bold text-gray-600">
                      {stage.count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(stage.count > 0 ? 5 : 0, percent))}%`,
                        backgroundColor: stage.color || '#004274',
                      }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activities & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Recent CRM Activities</h3>
            <span className="text-xs text-gray-400">Live audit stream</span>
          </div>

          <div className="divide-y divide-gray-100">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No recent lead activities.</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act._id} className="py-2.5 flex items-start justify-between text-xs">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 leading-snug">
                        {act.description}
                      </p>
                      <p className="text-gray-500 text-[11px] mt-0.5">
                        Client:{' '}
                        <span className="font-medium text-gray-700">
                          {act.lead?.customer?.name || 'Inquirer'}
                        </span>{' '}
                        • By: {act.performedBy?.name || 'System / Automated'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2 flex items-center">
                    <Clock className="w-3 h-3 mr-0.5" />
                    {new Date(act.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations & Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-900">System Shortcuts</h3>
          <div className="space-y-2">
            <Link
              to="/telecaller"
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
            >
              <span className="flex items-center">
                <PhoneCall className="w-4 h-4 mr-2 text-primary" />
                Telecaller Calling Desk
              </span>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              to="/viewings/calendar"
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
            >
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                Viewings Calendar
              </span>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              to="/offers/deals"
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
            >
              <span className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-emerald-600" />
                Deal Conveyancing Pipeline
              </span>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              to="/analytics"
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
            >
              <span className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-amber-600" />
                Advanced Analytics & Reports
              </span>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
