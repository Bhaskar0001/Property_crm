import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Home, Users, MessageSquare, Calendar, Tag, UserCheck, BarChart, Settings, FileText, Menu, Bell, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/properties', icon: Home, label: 'Properties' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/customers', icon: UserCheck, label: 'Customers' },
  { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { to: '/viewings', icon: Calendar, label: 'Viewings' },
  { to: '/offers', icon: Tag, label: 'Offers' },
  { to: '/staff', icon: UserCheck, label: 'Staff' },
  { to: '/analytics', icon: BarChart, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/audit-logs', icon: FileText, label: 'Audit Logs' },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={`bg-dark text-gray-300 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="flex h-16 items-center justify-center border-b border-gray-800 px-4">
          <span className={`font-bold text-white ${sidebarOpen ? 'text-xl' : 'text-xs'}`}>
            {sidebarOpen ? 'Property OS' : 'POS'}
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => (
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
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 rounded-md border border-gray-300 px-4 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:outline-none">
              <option>UAE</option>
              <option>UK</option>
            </select>
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell className="h-6 w-6" />
              <span className="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="flex items-center space-x-2 border-l pl-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                <span className="text-xs text-gray-500">{user?.role}</span>
              </div>
              <button
                onClick={logout}
                className="ml-2 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
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
