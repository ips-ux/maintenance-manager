# Service Integration Examples

This document provides practical examples of how to integrate the Firestore services with your React components.

## Table of Contents
1. [Dashboard Integration](#dashboard-integration)
2. [Turns Management](#turns-management)
3. [Calendar Integration](#calendar-integration)
4. [Real-time Updates](#real-time-updates)
5. [Error Handling Patterns](#error-handling-patterns)

---

## Dashboard Integration

### Replace Mock Data with Real Firestore Data

**Original Dashboard.jsx (with mock data):**
```jsx
const stats = {
  totalUnits: 120,
  vacantUnits: 8,
  turnsInProgress: 3,
  avgTurnTime: 5.2
};
```

**Updated Dashboard.jsx (with Firestore):**

```jsx
import { useState, useEffect } from 'react';
import { getUnitsStatistics } from '../services/unitsService';
import { getActiveTurns } from '../services/turnsService';
import { getRecentActivities, formatActivityForDisplay } from '../services/activityService';
import { getUpcomingEvents } from '../services/calendarService';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activeTurns, setActiveTurns] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Load all data in parallel
      const [statsResult, turnsResult, activityResult, eventsResult] = await Promise.all([
        getUnitsStatistics(),
        getActiveTurns(3),
        getRecentActivities(5),
        getUpcomingEvents(7, 4)
      ]);

      // Check for errors
      if (!statsResult.success) throw new Error(statsResult.error);
      if (!turnsResult.success) throw new Error(turnsResult.error);
      if (!activityResult.success) throw new Error(activityResult.error);
      if (!eventsResult.success) throw new Error(eventsResult.error);

      // Set data
      setStats(statsResult.data);
      setActiveTurns(turnsResult.data);
      setRecentActivity(activityResult.data.map(formatActivityForDisplay));
      setUpcomingEvents(eventsResult.data);

      setError(null);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 pb-12 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Units"
          value={stats.totalUnits}
          icon={<Home className="w-6 h-6" />}
          color="bg-blue-600"
        />
        <StatCard
          title="Vacant Units"
          value={stats.vacantUnits}
          icon={<Activity className="w-6 h-6" />}
          color="bg-green-600"
        />
        <StatCard
          title="Turns in Progress"
          value={stats.inProgressUnits}
          icon={<Wrench className="w-6 h-6" />}
          color="bg-amber-500"
        />
        <StatCard
          title="Avg Days Vacant"
          value={`${stats.avgDaysVacant} days`}
          icon={<Clock className="w-6 h-6" />}
          color="bg-gray-700"
        />
      </div>

      {/* Active Turns */}
      <Card>
        <CardHeader>
          <CardTitle>Active Turns</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTurns.length === 0 ? (
            <p className="text-gray-500">No active turns</p>
          ) : (
            <div className="space-y-4">
              {activeTurns.map((turn) => (
                <TurnProgressCard key={turn.id} turn={turn} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Turns Management

### Creating a New Turn

```jsx
import { useState } from 'react';
import { createTurn } from '../services/turnsService';
import { Timestamp } from 'firebase/firestore';

function CreateTurnForm({ unit, technician, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateTurn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create standard checklist
      const checklist = [
        {
          taskId: 'task-1',
          taskName: 'Initial Walkthrough',
          category: 'Inspection',
          required: true,
          order: 1,
          completed: false,
          completedBy: null,
          completedByName: null,
          completedAt: null,
          photos: [],
          notes: ''
        },
        {
          taskId: 'task-2',
          taskName: 'Deep Clean',
          category: 'Cleaning',
          required: true,
          order: 2,
          completed: false,
          completedBy: null,
          completedByName: null,
          completedAt: null,
          photos: [],
          notes: ''
        },
        // ... add more tasks
      ];

      const turnData = {
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        status: 'In Progress',
        startDate: Timestamp.now(),
        targetCompletionDate: Timestamp.fromDate(
          new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
        ),
        actualCompletionDate: null,
        assignedTechnicianId: technician.uid,
        assignedTechnicianName: technician.displayName,
        checklist,
        notes: '',
        blockageReason: null,
        priority: 'Normal'
      };

      const result = await createTurn(turnData);

      if (result.success) {
        onSuccess(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCreateTurn}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Start Turn'}
      </button>
      {error && (
        <p className="text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
```

### Updating a Task in Checklist

```jsx
import { useState } from 'react';
import { updateTask } from '../services/turnsService';
import { useAuth } from '../features/auth/AuthProvider';

function TaskCheckbox({ turn, task }) {
  const { currentUser } = useAuth();
  const [updating, setUpdating] = useState(false);

  const handleToggle = async () => {
    try {
      setUpdating(true);

      const userInfo = {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userRole: 'Technician'
      };

      const result = await updateTask(
        turn.id,
        task.taskId,
        { completed: !task.completed },
        userInfo
      );

      if (!result.success) {
        alert('Error updating task: ' + result.error);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <label className="flex items-center space-x-3 cursor-pointer">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
        disabled={updating}
        className="w-5 h-5 text-blue-600 rounded"
      />
      <span className={task.completed ? 'line-through text-gray-500' : ''}>
        {task.taskName}
      </span>
      {updating && <span className="text-sm text-gray-500">Updating...</span>}
    </label>
  );
}
```

---

## Calendar Integration

### Displaying Upcoming Events

```jsx
import { useState, useEffect } from 'react';
import { getUpcomingEvents } from '../services/calendarService';

function UpcomingEventsWidget() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const result = await getUpcomingEvents(7, 10); // Next 7 days, max 10 events
    if (result.success) {
      setEvents(result.data);
    }
    setLoading(false);
  }

  const formatEventTime = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) return <div>Loading events...</div>;

  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <p className="text-gray-500">No upcoming events</p>
      ) : (
        events.map((event) => (
          <div key={event.id} className="border rounded-lg p-3">
            <h4 className="font-semibold">{event.title}</h4>
            <p className="text-sm text-gray-600">
              {formatEventTime(event.startDateTime)}
            </p>
            {event.unitNumber && (
              <p className="text-sm text-gray-500">Unit {event.unitNumber}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
```

### Scheduling a Vendor Visit

```jsx
import { useState } from 'react';
import { createCalendarEvent, checkSchedulingConflict } from '../services/calendarService';
import { Timestamp } from 'firebase/firestore';

function ScheduleVendorForm({ unit, vendor, technician, onSuccess }) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [conflict, setConflict] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkConflict = async () => {
    if (!startTime || !endTime) return;

    const start = Timestamp.fromDate(new Date(startTime));
    const end = Timestamp.fromDate(new Date(endTime));

    const result = await checkSchedulingConflict(technician.uid, start, end);

    if (result.success && result.data.hasConflict) {
      setConflict(result.data.conflicts[0]);
    } else {
      setConflict(null);
    }
  };

  const handleSchedule = async () => {
    try {
      setLoading(true);

      const eventData = {
        title: `${vendor.category} Service - Unit ${unit.unitNumber}`,
        description: vendor.servicesOffered.join(', '),
        eventType: 'Vendor Visit',
        startDateTime: Timestamp.fromDate(new Date(startTime)),
        endDateTime: Timestamp.fromDate(new Date(endTime)),
        allDay: false,
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        turnId: unit.currentTurnId,
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        assignedTo: technician.uid,
        assignedToName: technician.displayName,
        status: 'Scheduled',
        completedAt: null,
        cancelledReason: null,
        notes: '',
        reminderSent: false
      };

      const result = await createCalendarEvent(eventData, technician.uid);

      if (result.success) {
        onSuccess(result.data);
      } else {
        alert('Error scheduling: ' + result.error);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Start Time</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          onBlur={checkConflict}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">End Time</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          onBlur={checkConflict}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {conflict && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-yellow-800 font-semibold">Scheduling Conflict</p>
          <p className="text-yellow-700 text-sm mt-1">
            {conflict.title} is already scheduled at this time
          </p>
        </div>
      )}

      <button
        onClick={handleSchedule}
        disabled={loading || conflict}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Scheduling...' : 'Schedule Vendor Visit'}
      </button>
    </div>
  );
}
```

---

## Real-time Updates

### Listen to Turn Updates

```jsx
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

function TurnDetails({ turnId }) {
  const [turn, setTurn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'turns', turnId),
      (docSnap) => {
        if (docSnap.exists()) {
          setTurn({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to turn:', error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [turnId]);

  if (loading) return <div>Loading...</div>;
  if (!turn) return <div>Turn not found</div>;

  return (
    <div>
      <h2>Unit {turn.unitNumber}</h2>
      <p>Status: {turn.status}</p>
      <p>Progress: {turn.progressPercentage}%</p>
      {/* Real-time updates will automatically refresh this component */}
    </div>
  );
}
```

### Listen to Activity Feed

```jsx
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

function RealtimeActivityFeed() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'activity'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setActivities(items);
      },
      (error) => {
        console.error('Error listening to activities:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="border-b pb-2">
          <p className="text-sm font-medium">{activity.action}</p>
          <p className="text-xs text-gray-500">
            {activity.userName} · {activity.timestamp.toDate().toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
```

---

## Error Handling Patterns

### Standard Error Handling with User Feedback

```jsx
import { useState } from 'react';

function DataComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await someService.getData();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Process data...
    } catch (err) {
      setError({
        message: err.message,
        retry: loadData
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600 mt-1">{error.message}</p>
        <button
          onClick={error.retry}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // ... rest of component
}
```

### Toast Notifications for Operations

```jsx
import { useState } from 'react';

function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return { toast, showToast };
}

function OperationComponent() {
  const { toast, showToast } = useToast();

  const handleOperation = async () => {
    const result = await someService.doSomething();

    if (result.success) {
      showToast('Operation completed successfully!', 'success');
    } else {
      showToast(result.error, 'error');
    }
  };

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <button onClick={handleOperation}>
        Perform Operation
      </button>
    </div>
  );
}
```

---

## Next Steps

1. **Replace all mock data** in existing components with service calls
2. **Implement real-time listeners** for dynamic updates
3. **Add loading states** to all data-fetching components
4. **Implement error boundaries** for better error handling
5. **Add optimistic updates** for better UX
6. **Implement pagination** for large data sets

For more details, see:
- [Database Schema Documentation](./database-schema.md)
- [Service Layer README](../src/services/README.md)
- [Firebase Setup Guide](./firebase-setup-guide.md)
