import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, RefreshCw, Calendar, ClipboardList, Users, Settings, LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => location.pathname === path;
  
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">IPS Maintenance</h1>
              <p className="text-xs text-gray-500">Beacon 85</p>
            </div>
          </div>
          
          {/* Desktop Navigation - Centered - Only visible at 1120px+ */}
          <nav className="hidden xl:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            {/* Main Workflow Section */}
            <NavLink to="/" icon={<Home className="w-4 h-4" />} active={isActive('/')}>
              Dashboard
            </NavLink>
            <NavLink to="/calendar" icon={<Calendar className="w-4 h-4" />} active={isActive('/calendar')}>
              Calendar
            </NavLink>
            <NavLink to="/turns" icon={<RefreshCw className="w-4 h-4" />} active={isActive('/turns')}>
              Turns
            </NavLink>
            <NavLink to="/orders" icon={<ClipboardList className="w-4 h-4" />} active={isActive('/orders')}>
              Orders
            </NavLink>
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            {/* List Views Section */}
            <NavLink to="/units" icon={<Building2 className="w-4 h-4" />} active={isActive('/units')}>
              Units
            </NavLink>
            <NavLink to="/vendors" icon={<Users className="w-4 h-4" />} active={isActive('/vendors')}>
              Vendors
            </NavLink>
          </nav>
          
          {/* Right Side: User Controls + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Desktop User Menu - Always visible at 768px+ */}
            <div className="hidden md:flex items-center gap-3">
              {/* Stacked Username/Logout with Bell */}
              <div className="flex flex-col gap-0.5">
                <Link 
                  to="/settings"
                  className="text-sm font-medium text-gray-700 leading-tight hover:text-blue-600 transition-colors text-right"
                >
                  {user?.email}
                </Link>
                <div className="flex items-center justify-between gap-2">
                  {/* Bell Icon - Left aligned */}
                  <button
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-3 h-3" />
                  </button>
                  {/* Logout Button - Right aligned */}
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    Logout
                  </button>
                </div>
              </div>
              
              {/* Settings Cog */}
              <Link
                to="/settings"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Hamburger Menu Button - Shows when nav is hidden (below 1120px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu Dropdown - Below 1120px */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-1">
              {/* Main Workflow */}
              <MobileNavLink to="/" icon={<Home className="w-5 h-5" />} active={isActive('/')} onClick={handleNavClick}>
                Dashboard
              </MobileNavLink>
              <MobileNavLink to="/calendar" icon={<Calendar className="w-5 h-5" />} active={isActive('/calendar')} onClick={handleNavClick}>
                Calendar
              </MobileNavLink>
              <MobileNavLink to="/turns" icon={<RefreshCw className="w-5 h-5" />} active={isActive('/turns')} onClick={handleNavClick}>
                Turns
              </MobileNavLink>
              <MobileNavLink to="/orders" icon={<ClipboardList className="w-5 h-5" />} active={isActive('/orders')} onClick={handleNavClick}>
                Orders
              </MobileNavLink>
              
              {/* Divider */}
              <div className="h-px bg-gray-200 my-2"></div>
              
              {/* List Views */}
              <MobileNavLink to="/units" icon={<Building2 className="w-5 h-5" />} active={isActive('/units')} onClick={handleNavClick}>
                Units
              </MobileNavLink>
              <MobileNavLink to="/vendors" icon={<Users className="w-5 h-5" />} active={isActive('/vendors')} onClick={handleNavClick}>
                Vendors
              </MobileNavLink>
              
              {/* User Actions - Only show in mobile menu below 768px */}
              <div className="md:hidden">
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">{user?.email}</p>
                  <div className="flex gap-2">
                    <Link
                      to="/settings"
                      onClick={handleNavClick}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={logout}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ to, icon, active, children }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({ to, icon, active, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
