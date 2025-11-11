import { useState } from 'react';
import { User, Bell, Lock, Building2, Users, Package, Settings as SettingsIcon, ChevronDown } from 'lucide-react';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'profile', label: 'Profile', icon: User, admin: false },
    { id: 'notifications', label: 'Notifications', icon: Bell, admin: false },
    { id: 'security', label: 'Account & Security', icon: Lock, admin: false },
    { id: 'units', label: 'Unit Settings', icon: Building2, admin: true },
    { id: 'vendors', label: 'Vendor Settings', icon: Users, admin: true },
    { id: 'products', label: 'Product Settings', icon: Package, admin: true },
    { id: 'ips', label: 'IPS Settings', icon: SettingsIcon, admin: true },
  ];

  const activeItem = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Dropdown Selector - Visible below 1024px */}
          <div className="lg:hidden">
            <div className="relative">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <activeItem.icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{activeItem.label}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        activeSection === section.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                      {section.admin && (
                        <span className="ml-auto text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Admin</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* Desktop Sidebar - Visible at 1024px+ */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <nav className="flex flex-col">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4 ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-600 border-blue-600 font-medium'
                        : 'bg-white text-gray-700 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span>{section.label}</span>
                    {section.admin && (
                      <span className="ml-auto text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Admin</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {activeSection === 'profile' && <ProfileSettings />}
              {activeSection === 'notifications' && <NotificationSettings />}
              {activeSection === 'security' && <SecuritySettings />}
              {activeSection === 'units' && <UnitSettings />}
              {activeSection === 'vendors' && <VendorSettings />}
              {activeSection === 'products' && <ProductSettings />}
              {activeSection === 'ips' && <IPSSettings />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Profile Settings Component
function ProfileSettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
      <p className="text-gray-600 mb-6">Manage your personal information and account details</p>
      
      <div className="space-y-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Under Construction</h3>
          <p className="text-blue-700">
            Profile management features are currently in development. Soon you'll be able to update your name, 
            email, profile photo, and other personal information.
          </p>
        </div>
        
        {/* Placeholder sections */}
        <SettingSection title="Personal Information" />
        <SettingSection title="Contact Details" />
        <SettingSection title="Profile Photo" />
      </div>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
      <p className="text-gray-600 mb-6">Configure your notification preferences</p>
      
      <div className="space-y-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Under Construction</h3>
          <p className="text-blue-700">
            Notification settings are coming soon. You'll be able to customize email alerts, 
            push notifications, and in-app notifications.
          </p>
        </div>
        
        <SettingSection title="Email Notifications" />
        <SettingSection title="Push Notifications" />
        <SettingSection title="In-App Alerts" />
      </div>
    </div>
  );
}

// Security Settings Component
function SecuritySettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Account & Security</h2>
      <p className="text-gray-600 mb-6">Manage your password and security preferences</p>
      
      <div className="space-y-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Under Construction</h3>
          <p className="text-blue-700">
            Security features are in development. Soon you'll be able to change your password,
            enable two-factor authentication, and review login activity.
          </p>
        </div>
        
        <SettingSection title="Change Password" />
        <SettingSection title="Two-Factor Authentication" />
        <SettingSection title="Login History" />
      </div>
    </div>
  );
}

// Unit Settings Component
function UnitSettings() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Unit Settings</h2>
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">Admin Only</span>
      </div>
      <p className="text-gray-600 mb-6">Configure default unit settings and preferences</p>
      
      <div className="space-y-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Under Construction</h3>
          <p className="text-blue-700">
            Unit management settings are coming soon. Configure default inspection checklists,
            unit types, and other unit-specific preferences.
          </p>
        </div>
        
        <SettingSection title="Default Inspection Checklist" />
        <SettingSection title="Unit Types & Categories" />
        <SettingSection title="Custom Fields" />
      </div>
    </div>
  );
}

// Vendor Settings Component
function VendorSettings() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Settings</h2>
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">Admin Only</span>
      </div>
      <p className="text-gray-600 mb-6">Manage vendor preferences and integrations</p>
      
      <div className="space-y-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Under Construction</h3>
          <p className="text-blue-700">
            Vendor management features are in development. Configure vendor categories,
            payment terms, and integration settings.
          </p>
        </div>
        
        <SettingSection title="Vendor Categories" />
        <SettingSection title="Default Payment Terms" />
        <SettingSection title="Vendor Portal Access" />
      </div>
    </div>
  );
}

// Product Settings Component
function ProductSettings() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Product Settings</h2>
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">Admin Only</span>
      </div>
      <p className="text-gray-600 mb-6">Configure product catalog and inventory settings</p>
      
      <div className="space-y-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Under Construction</h3>
          <p className="text-blue-700">
            Product management is coming soon. Configure your product catalog,
            inventory tracking, and ordering preferences.
          </p>
        </div>
        
        <SettingSection title="Product Catalog" />
        <SettingSection title="Inventory Tracking" />
        <SettingSection title="Ordering Preferences" />
      </div>
    </div>
  );
}

// IPS Settings Component
function IPSSettings() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-gray-900">IPS Settings</h2>
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">Admin Only</span>
      </div>
      <p className="text-gray-600 mb-6">Global application settings and preferences</p>
      
      <div className="space-y-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Under Construction</h3>
          <p className="text-blue-700">
            Global IPS settings are in development. Configure property information,
            branding, integrations, and system preferences.
          </p>
        </div>
        
        <SettingSection title="Property Information" />
        <SettingSection title="Branding & Appearance" />
        <SettingSection title="Integrations" />
        <SettingSection title="System Preferences" />
      </div>
    </div>
  );
}

// Reusable Setting Section Component
function SettingSection({ title }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">Configuration options coming soon...</p>
    </div>
  );
}
