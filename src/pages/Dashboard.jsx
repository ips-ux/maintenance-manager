import { Activity, Home, Wrench, Clock, Key, Calendar, ClipboardList, CheckCircle, TrendingUp, TrendingDown, AlertCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const stats = {
    totalUnits: 120,
    vacantUnits: 8,
    turnsInProgress: 3,
    avgTurnTime: 5.2,
    trends: {
      totalUnits: 0,
      vacantUnits: -2,
      turnsInProgress: 1,
      avgTurnTime: -0.8,
    }
  };

  // Mock data for turn performance chart
  const turnPerformanceData = [
    { date: 'Week 1', days: 6.2 },
    { date: 'Week 2', days: 5.8 },
    { date: 'Week 3', days: 5.5 },
    { date: 'Week 4', days: 5.2 },
  ];

  // Mock active turns data
  const activeTurns = [
    { unit: '204', bedrooms: 2, bathrooms: 2, daysInProgress: 3, completedTasks: 7, totalTasks: 12, technician: 'John D.', targetDate: '2025-11-12', status: 'on-track' },
    { unit: '105', bedrooms: 1, bathrooms: 1, daysInProgress: 6, completedTasks: 10, totalTasks: 10, technician: 'Sarah M.', targetDate: '2025-11-10', status: 'ready' },
    { unit: '301', bedrooms: 3, bathrooms: 2, daysInProgress: 8, completedTasks: 4, totalTasks: 14, technician: 'Mike R.', targetDate: '2025-11-11', status: 'delayed' },
  ];

  // Mock vacant units data
  const vacantUnits = [
    { unit: '402', bedrooms: 2, bathrooms: 2, daysVacant: 2, status: 'ready', turnStarted: false },
    { unit: '205', bedrooms: 1, bathrooms: 1, daysVacant: 5, status: 'in-progress', turnStarted: true },
    { unit: '108', bedrooms: 2, bathrooms: 1, daysVacant: 1, status: 'blocked', turnStarted: false },
    { unit: '315', bedrooms: 3, bathrooms: 2, daysVacant: 3, status: 'in-progress', turnStarted: true },
    { unit: '209', bedrooms: 1, bathrooms: 1, daysVacant: 7, status: 'ready', turnStarted: false },
  ];

  // Mock schedule preview
  const upcomingEvents = [
    { date: 'Today', time: '2:00 PM', title: 'Carpet Cleaning - Unit 301', type: 'vendor' },
    { date: 'Tomorrow', time: '10:00 AM', title: 'Final Inspection - Unit 105', type: 'inspection' },
    { date: 'Nov 12', time: '1:00 PM', title: 'Move-in - Unit 204', type: 'move-in' },
    { date: 'Nov 13', time: '9:00 AM', title: 'HVAC Service - Unit 402', type: 'vendor' },
  ];

  // Mock activity feed
  const recentActivity = [
    { action: 'Cleaning completed', unit: '204', user: 'John D.', time: '2 hours ago' },
    { action: 'Keys returned', unit: '105', user: 'Sarah M.', time: 'Today at 9:30 AM' },
    { action: 'Vendor scheduled', unit: '301', user: 'Mike R.', time: 'Today at 11:15 AM' },
    { action: 'Paint touch-up completed', unit: '204', user: 'John D.', time: 'Yesterday at 3:45 PM' },
    { action: 'Final walkthrough passed', unit: '105', user: 'Manager', time: 'Yesterday at 2:00 PM' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 pb-12 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Beacon 85 Property Overview</p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton
              icon={<Key className="w-5 h-5" />}
              label="Key Return"
              color="bg-blue-600 hover:bg-blue-700"
            />
            <ActionButton
              icon={<Calendar className="w-5 h-5" />}
              label="Schedule Vendor"
              color="bg-purple-600 hover:bg-purple-700"
            />
            <ActionButton
              icon={<ClipboardList className="w-5 h-5" />}
              label="Create Order"
              color="bg-green-600 hover:bg-green-700"
            />
            <ActionButton
              icon={<CheckCircle className="w-5 h-5" />}
              label={`Make Ready (${stats.turnsInProgress})`}
              color="bg-amber-500 hover:bg-amber-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Units"
          value={stats.totalUnits}
          icon={<Home className="w-6 h-6" />}
          color="bg-blue-600"
          trend={stats.trends.totalUnits}
        />
        <StatCard
          title="Vacant Units"
          value={stats.vacantUnits}
          icon={<Activity className="w-6 h-6" />}
          color="bg-green-600"
          trend={stats.trends.vacantUnits}
        />
        <StatCard
          title="Turns in Progress"
          value={stats.turnsInProgress}
          icon={<Wrench className="w-6 h-6" />}
          color="bg-amber-500"
          trend={stats.trends.turnsInProgress}
        />
        <StatCard
          title="Avg Turn Time"
          value={`${stats.avgTurnTime} days`}
          icon={<Clock className="w-6 h-6" />}
          color="bg-gray-700"
          trend={stats.trends.avgTurnTime}
        />
      </div>

      {/* Active Turns & Vacant Units Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Turns Progress Cards */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Turns</CardTitle>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTurns.map((turn) => (
                <TurnProgressCard key={turn.unit} turn={turn} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vacant Units Quick List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vacant Units</CardTitle>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vacantUnits.map((unit) => (
                <VacantUnitCard key={unit.unit} unit={unit} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Turn Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Turn Performance - Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={turnPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="days" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Avg Turn Time"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Preview & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Week Schedule Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>This Week's Schedule</CardTitle>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Calendar →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, idx) => (
                <ScheduleEventCard key={idx} event={event} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stat Card Component with Trends
function StatCard({ title, value, icon, color, trend }) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const isNeutral = trend === 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {!isNeutral && (
              <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(trend)} vs last period</span>
              </div>
            )}
          </div>
          <div className={`${color} text-white p-3 rounded-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Turn Progress Card Component
function TurnProgressCard({ turn }) {
  const progress = (turn.completedTasks / turn.totalTasks) * 100;
  
  const statusColors = {
    'on-track': 'bg-green-100 text-green-700 border-green-200',
    'ready': 'bg-blue-100 text-blue-700 border-blue-200',
    'delayed': 'bg-red-100 text-red-700 border-red-200',
  };

  const statusLabels = {
    'on-track': 'On Track',
    'ready': 'Ready',
    'delayed': 'Delayed',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">Unit {turn.unit}</h4>
          <p className="text-sm text-gray-600">{turn.bedrooms}BR / {turn.bathrooms}BA</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[turn.status]}`}>
          {statusLabels[turn.status]}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{turn.completedTasks}/{turn.totalTasks}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <User className="w-4 h-4" />
          <span>{turn.technician}</span>
        </div>
        <div className="text-gray-600">
          <span className="font-medium">{turn.daysInProgress}</span> days
        </div>
      </div>
    </div>
  );
}

// Vacant Unit Card Component
function VacantUnitCard({ unit }) {
  const statusColors = {
    'ready': 'bg-green-100 text-green-700',
    'in-progress': 'bg-amber-100 text-amber-700',
    'blocked': 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    'ready': 'Ready',
    'in-progress': 'In Progress',
    'blocked': 'Blocked',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-semibold text-gray-900">Unit {unit.unit}</p>
          <p className="text-sm text-gray-600">{unit.bedrooms}BR / {unit.bathrooms}BA · {unit.daysVacant} days vacant</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[unit.status]}`}>
          {statusLabels[unit.status]}
        </span>
        {!unit.turnStarted && unit.status !== 'blocked' && (
          <button className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded hover:bg-blue-50 transition-colors">
            Start Turn
          </button>
        )}
      </div>
    </div>
  );
}

// Schedule Event Card Component
function ScheduleEventCard({ event }) {
  const typeColors = {
    'vendor': 'bg-purple-100 text-purple-700',
    'inspection': 'bg-blue-100 text-blue-700',
    'move-in': 'bg-green-100 text-green-700',
  };

  const typeIcons = {
    'vendor': '🔧',
    'inspection': '📋',
    'move-in': '🔑',
  };

  return (
    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="text-2xl">{typeIcons[event.type]}</div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{event.title}</p>
        <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[event.type]}`}>
        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
      </span>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ activity }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
      <div className="flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{activity.action}</span> in Unit {activity.unit}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {activity.user} · {activity.time}
        </p>
      </div>
    </div>
  );
}

// Action Button Component
function ActionButton({ icon, label, color }) {
  return (
    <button className={`flex items-center justify-center gap-3 p-4 ${color} text-white rounded-lg transition-colors font-medium`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
