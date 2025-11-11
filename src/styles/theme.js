// IPS-UX Theme Configuration
// Professional property management aesthetic matching unit-inspection app

export const ipsTheme = {
  colors: {
    // Primary brand color (blue from unit-inspection)
    primary: '#2563eb',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#f59e0b',
    
    // Gray scale
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Status colors for units
    status: {
      vacant: '#16a34a',      // Green
      occupied: '#2563eb',    // Blue  
      turn: '#f59e0b',        // Amber
      maintenance: '#dc2626', // Red
    }
  },
  
  // Light mode (default)
  light: {
    bgPrimary: '#f9fafb',
    bgSecondary: '#ffffff',
    bgTertiary: '#f3f4f6',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textTertiary: '#9ca3af',
    borderColor: '#e5e7eb',
  },
  
  // Dark mode
  dark: {
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    bgTertiary: '#334155',
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    borderColor: '#334155',
  },
};

export const getStatusColor = (status) => {
  const map = {
    'VACANT_READY': ipsTheme.colors.status.vacant,
    'OCCUPIED': ipsTheme.colors.status.occupied,
    'TURN_IN_PROGRESS': ipsTheme.colors.status.turn,
    'MAINTENANCE_NEEDED': ipsTheme.colors.status.maintenance,
  };
  return map[status] || ipsTheme.colors.gray[400];
};

export default ipsTheme;
