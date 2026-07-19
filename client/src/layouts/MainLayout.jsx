import React, { useContext, useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ChatWidget from '../components/common/ChatWidget';

export default function MainLayout() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const triggerChat = () => {
    setMobileMenuOpen(false);
    // Dispatch the custom window event to open the ChatWidget panel
    window.dispatchEvent(new CustomEvent('open-stadium-genie-chat'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100/80 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                StadiumGenie
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-105 uppercase tracking-wider">
                Demo
              </span>
            </Link>

            {/* Desktop Navbar Links */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `text-sm font-semibold transition duration-150 ${
                    isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-850'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/stadiums"
                className={({ isActive }) =>
                  `text-sm font-semibold transition duration-150 ${
                    isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-850'
                  }`
                }
              >
                Stadiums
              </NavLink>
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `text-sm font-semibold transition duration-150 ${
                    isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-850'
                  }`
                }
              >
                Events
              </NavLink>
              {isAuthenticated && (
                <NavLink
                  to="/tickets"
                  className={({ isActive }) =>
                    `text-sm font-semibold transition duration-150 ${
                      isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-850'
                    }`
                  }
                >
                  My Tickets
                </NavLink>
              )}
            </nav>
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition duration-150 flex items-center gap-1 shadow-sm"
                  >
                    🛡️ Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 group px-2 py-1 rounded-xl hover:bg-slate-50 transition duration-150"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 truncate max-w-[120px]">
                    {user?.name || 'Profile'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-slate-400 hover:text-red-650 transition duration-150"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 transition duration-150"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition duration-150 shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-900 text-white"
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white shadow-inner animate-fade-in">
            <nav className="px-4 py-4 space-y-2 flex flex-col">
              <NavLink
                to="/"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-bold transition ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-650 hover:bg-slate-50'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/stadiums"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-bold transition ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-650 hover:bg-slate-50'
                  }`
                }
              >
                Stadiums
              </NavLink>
              <NavLink
                to="/events"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-bold transition ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-650 hover:bg-slate-50'
                  }`
                }
              >
                Events
              </NavLink>
              
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/tickets"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-xl text-sm font-bold transition ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-655 hover:bg-slate-50'
                      }`
                    }
                  >
                    My Tickets
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-xl text-sm font-bold transition ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-655 hover:bg-slate-50'
                      }`
                    }
                  >
                    My Profile & Edit
                  </NavLink>
                  <NavLink
                    to="/profile?tab=booking-history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-sm font-bold text-slate-655 hover:bg-slate-50"
                  >
                    Booking History
                  </NavLink>
                  <button
                    onClick={triggerChat}
                    className="px-3 py-2 rounded-xl text-sm font-bold text-slate-655 hover:bg-slate-50 text-left flex items-center gap-1"
                  >
                    ✦ AI Assistant
                  </button>
                  <NavLink
                    to="/privacy"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-xl text-sm font-bold transition ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-655 hover:bg-slate-50'
                      }`
                    }
                  >
                    Privacy Policy
                  </NavLink>
                  <div className="border-t border-slate-100 my-2 pt-2" />
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 text-left"
                  >
                    Logout ({user?.name || 'User'})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={triggerChat}
                    className="px-3 py-2 rounded-xl text-sm font-bold text-slate-655 hover:bg-slate-50 text-left flex items-center gap-1"
                  >
                    ✦ AI Assistant
                  </button>
                  <NavLink
                    to="/privacy"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-xl text-sm font-bold transition ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-655 hover:bg-slate-50'
                      }`
                    }
                  >
                    Privacy Policy
                  </NavLink>
                  <div className="border-t border-slate-100 my-2 pt-2" />
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl text-sm font-bold border text-center block text-slate-700 hover:bg-slate-55"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white text-center block mt-1.5 shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} StadiumGenie Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/stadiums" className="hover:text-slate-600">Stadiums</Link>
            <Link to="/events" className="hover:text-slate-600">Events</Link>
            <Link to="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      {/* StadiumGenie AI Assistant — floating chat widget */}
      <ChatWidget />
    </div>
  );
}