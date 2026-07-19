import React, { useContext } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { FiLayout, FiMap, FiHome, FiLogOut, FiUser, FiCalendar, FiBookmark, FiUsers } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: FiLayout },
    { name: 'Stadiums', path: '/admin/stadiums', icon: FiMap },
    { name: 'Events', path: '/admin/events', icon: FiCalendar },
    { name: 'Bookings', path: '/admin/bookings', icon: FiBookmark },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between shrink-0 shadow-lg border-r border-gray-800">
        <div>
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
            <div>
              <span className="text-xl font-bold tracking-wider text-blue-400">StadiumGenie</span>
              <span className="block text-xs text-gray-500 uppercase tracking-widest mt-0.5">Admin Portal</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Section */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/60">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shrink-0 shadow animate-pulse">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition duration-200"
            >
              <FiHome size={16} />
              View Main Site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 transition duration-200"
            >
              <FiLogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-800">Admin Console</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <FiUser size={12} /> {user?.role || 'admin'}
            </span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-grow overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}