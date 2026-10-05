import { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Home, Users, MessageSquare, Calendar, Tag, UserCheck, BarChart, Settings, FileText, Menu, LogOut, PhoneCall, Globe, Search } from 'lucide-react';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { useCountryFilter } from '../context/CountryFilterContext';
import { CountryFlag } from '../components/common/CountryFlag';
import { LuxuryEmblem } from '../components/common/LuxuryEmblem';

interface NavItem {
  to: string;
  icon: any;
  label: string;
  requiredPermission?: string;
  requireAdmin?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/properties', icon: Home, label: 'Properties', requiredPermission: 'properties.view' },
  { to: '/leads', icon: Users, label: 'Leads', requiredPermission: 'leads.view' },
  { to: '/telecaller', icon: PhoneCall, label: 'Calling Desk', requiredPermission: 'leads.view' },
  { to: '/customers', icon: UserCheck, label: 'Customers', requiredPermission: 'customers.manage' },
  { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp', requiredPermission: 'whatsapp.view' },
  { to: '/viewings', icon: Calendar, label: 'Viewings', requiredPermission: 'viewings.view' },
  { to: '/offers', icon: Tag, label: 'Offers', requiredPermission: 'offers.view' },
  { to: '/staff', icon: UserCheck, label: 'Staff', requireAdmin: true },
  { to: '/analytics', icon: BarChart, label: 'Analytics', requiredPermission: 'analytics.view' },
  { to: '/settings', icon: Settings, label: 'Settings', requireAdmin: true },
  { to: '/audit-logs', icon: FileText, label: 'Audit Logs', requireAdmin: true },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [headerSearch, setHeaderSearch] = useState('');
  const { selectedCountryId, setSelectedCountryId, countries } = useCountryFilter();


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isRoleAdmin = (user.role || '').toLowerCase() === 'admin';
  const userPerms = user.permissions || [];

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (isRoleAdmin) return true;
    if (item.requireAdmin) return false;
    if (item.requiredPermission) return userPerms.includes(item.requiredPermission);
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={`bg-dark text-gray-300 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="flex h-16 items-center border-b border-gray-800 px-4 gap-2.5">
          <img
            src="/logo.png"
            alt="AbroadAccommodation"
            className="w-9 h-9 object-contain rounded-xl bg-white p-1 shrink-0 shadow-md"
          />
          {sidebarOpen && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm text-white tracking-wide">
                Abroad<span className="text-amber-400">Accommodation</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold -mt-0.5">
                Admin Control Panel
              </span>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {visibleNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary text-white' : 'hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (headerSearch.trim()) {
                  navigate(`/properties?search=${encodeURIComponent(headerSearch.trim())}`);
                }
              }}
              className="relative"
            >
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search listings, ref, or city..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-64 rounded-md border border-gray-300 pl-9 pr-4 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </form>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-300 rounded-md px-2 py-1 text-sm">
              {selectedCountryId !== 'all' ? (
                <CountryFlag
                  code={countries.find((c) => c._id === selectedCountryId)?.isoCode}
                  name={countries.find((c) => c._id === selectedCountryId)?.name}
                  size="xs"
                />
              ) : (
                <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              )}
              <select
                value={selectedCountryId}
                onChange={(e) => setSelectedCountryId(e.target.value)}
                className="bg-transparent text-gray-700 text-xs font-semibold focus:outline-none cursor-pointer"
                title="Filter records across CRM by Country"
              >
                <option value="all">Global (All)</option>
                {countries.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.isoCode ? `(${c.isoCode})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <NotificationBell />
            <div className="flex items-center space-x-2 border-l pl-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                <span className="text-xs text-gray-500">{user?.role}</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
