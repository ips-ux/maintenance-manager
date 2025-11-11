# Firestore Services

This directory contains all Firestore database service modules for the IPS-UX Maintenance Manager application.

## Overview

Each service module provides a complete CRUD (Create, Read, Update, Delete) API for its respective Firestore collection, along with specialized operations and utility functions.

## Service Modules

### 1. turnsService.js
**Purpose:** Turn workflow management

**Key Functions:**
- `createTurn(turnData)` - Create a new turn
- `getTurnById(turnId)` - Get turn by ID
- `getActiveTurns(limitCount)` - Get all active turns
- `updateTask(turnId, taskId, taskUpdates, userInfo)` - Update checklist task
- `completeTurn(turnId, userInfo)` - Complete a turn
- `blockTurn(turnId, reason, userInfo)` - Block a turn

**Features:**
- Automatic progress calculation
- Days in progress tracking
- Days overdue calculation
- Activity logging integration
- Unit status synchronization

### 2. unitsService.js
**Purpose:** Unit inventory management

**Key Functions:**
- `createUnit(unitData)` - Create a new unit
- `getUnitById(unitId)` - Get unit by ID
- `getVacantUnits(limitCount)` - Get all vacant units
- `getUnitsStatistics()` - Get unit statistics
- `markUnitVacant(unitId)` - Mark unit as vacant
- `markUnitOccupied(unitId)` - Mark unit as occupied

**Features:**
- Automatic days vacant calculation
- Status tracking
- Vacancy management
- Bulk operations support

### 3. calendarService.js
**Purpose:** Calendar events and scheduling

**Key Functions:**
- `createCalendarEvent(eventData, createdBy)` - Create event
- `getUpcomingEvents(daysAhead, limitCount)` - Get upcoming events
- `getTodaysEvents()` - Get today's events
- `completeEvent(eventId)` - Mark event complete
- `rescheduleEvent(eventId, newStartDateTime, newEndDateTime)` - Reschedule
- `checkSchedulingConflict(assignedTo, startDateTime, endDateTime)` - Check conflicts

**Features:**
- Date range queries
- Conflict detection
- Event statistics
- Multi-entity associations

### 4. vendorsService.js
**Purpose:** Vendor directory management

**Key Functions:**
- `createVendor(vendorData)` - Create vendor
- `getVendorById(vendorId)` - Get vendor by ID
- `getVendorsByCategory(category, activeOnly)` - Get vendors by category
- `searchVendors(searchTerm)` - Search vendors
- `recordVendorJobCompletion(vendorId)` - Update job stats
- `updateVendorRating(vendorId, rating)` - Update rating

**Features:**
- Category-based organization
- Performance tracking
- Preferred vendor management
- Search functionality

### 5. activityService.js
**Purpose:** System-wide activity logging

**Key Functions:**
- `logActivity(activityData)` - Log an activity
- `getRecentActivities(limitCount)` - Get recent activities
- `getActivitiesByEntity(entityType, entityId)` - Get entity activities
- `getActivityStatistics(startDate, endDate)` - Get statistics
- `formatActivityForDisplay(activity)` - Format for UI
- `deleteOldActivities(daysToKeep)` - Maintenance cleanup

**Features:**
- Automatic timestamp handling
- Flexible filtering
- Time-ago formatting
- Audit trail support

### 6. usersService.js
**Purpose:** User profile management

**Key Functions:**
- `createUserProfile(uid, userData)` - Create user profile
- `getUserProfile(uid)` - Get user profile
- `getTechnicians()` - Get all technicians
- `updateUserRole(uid, newRole)` - Update user role
- `updateUserStats(uid, turnsCompleted, avgCompletionTime)` - Update stats
- `checkUserPermission(uid, permission)` - Check permission

**Features:**
- Role-based organization
- Performance tracking for technicians
- Notification preferences
- Permission system support

## Usage Examples

### Creating a Turn

```javascript
import { createTurn } from './services/turnsService';
import { Timestamp } from 'firebase/firestore';

const turnData = {
  unitId: 'unit-123',
  unitNumber: '204',
  status: 'In Progress',
  startDate: Timestamp.now(),
  targetCompletionDate: Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
  actualCompletionDate: null,
  assignedTechnicianId: 'user-abc',
  assignedTechnicianName: 'John Doe',
  checklist: [
    {
      taskId: 'task-1',
      taskName: 'Deep Clean',
      category: 'Cleaning',
      required: true,
      order: 1,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null,
      photos: [],
      notes: ''
    }
  ],
  notes: 'Standard turn',
  priority: 'Normal'
};

const result = await createTurn(turnData);

if (result.success) {
  console.log('Turn created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Getting Vacant Units

```javascript
import { getVacantUnits } from './services/unitsService';

const result = await getVacantUnits(10);

if (result.success) {
  result.data.forEach(unit => {
    console.log(`Unit ${unit.unitNumber}: ${unit.daysVacant} days vacant`);
  });
}
```

### Scheduling a Vendor Visit

```javascript
import { createCalendarEvent } from './services/calendarService';
import { Timestamp } from 'firebase/firestore';

const eventData = {
  title: 'Carpet Cleaning - Unit 301',
  description: 'Deep carpet cleaning',
  eventType: 'Vendor Visit',
  startDateTime: Timestamp.fromDate(new Date('2025-11-15T14:00:00')),
  endDateTime: Timestamp.fromDate(new Date('2025-11-15T16:00:00')),
  allDay: false,
  unitId: 'unit-301',
  unitNumber: '301',
  turnId: 'turn-xyz',
  vendorId: 'vendor-cleanpro',
  vendorName: 'CleanPro Services',
  assignedTo: 'user-mike',
  assignedToName: 'Mike R.',
  status: 'Scheduled',
  completedAt: null,
  cancelledReason: null,
  notes: '',
  reminderSent: false
};

const result = await createCalendarEvent(eventData, 'user-admin');
```

### Updating a Task

```javascript
import { updateTask } from './services/turnsService';

const userInfo = {
  userId: 'user-abc',
  userName: 'John Doe',
  userRole: 'Technician'
};

const result = await updateTask(
  'turn-xyz',
  'task-1',
  { completed: true },
  userInfo
);
```

### Getting Recent Activity

```javascript
import { getRecentActivities, formatActivityForDisplay } from './services/activityService';

const result = await getRecentActivities(20);

if (result.success) {
  const formattedActivities = result.data.map(formatActivityForDisplay);
  formattedActivities.forEach(activity => {
    console.log(`${activity.userName}: ${activity.action} (${activity.timeAgo})`);
  });
}
```

## Response Format

All service functions return a standardized response object:

```javascript
{
  success: boolean,
  data?: any,           // Present on success
  error?: string,       // Present on failure
  errorCode?: string    // Present on failure
}
```

### Success Response
```javascript
{
  success: true,
  data: { id: 'doc-123', ...documentData }
}
```

### Error Response
```javascript
{
  success: false,
  error: 'Document not found',
  errorCode: 'not-found'
}
```

## Error Handling

Always check the `success` property before accessing data:

```javascript
const result = await getTurnById('turn-123');

if (result.success) {
  // Use result.data
  console.log(result.data);
} else {
  // Handle error
  console.error(result.error);
}
```

## Best Practices

1. **Always validate input** - Check required fields before calling service functions
2. **Handle errors gracefully** - All functions can fail, always check `success`
3. **Use TypeScript types** - Import types from `src/types/database.ts`
4. **Denormalize strategically** - Store frequently accessed data to reduce reads
5. **Log activities** - Use `logActivity()` for important user actions
6. **Batch operations** - Use batch functions for multiple updates
7. **Maintain consistency** - Update related documents when needed

## Computed Fields

Some fields are automatically calculated:

### Turns
- `daysInProgress` - Days since turn started
- `daysOverdue` - Days past target completion
- `totalTasks` - Total checklist items
- `completedTasks` - Completed checklist items
- `progressPercentage` - Completion percentage

### Units
- `daysVacant` - Days since unit became vacant

## Activity Logging

Activities are automatically logged for:
- Turn creation
- Turn completion
- Turn blocked
- Task completion
- Vendor scheduling

To log custom activities, use:

```javascript
import { logActivity } from './services/activityService';
import { Timestamp } from 'firebase/firestore';

await logActivity({
  userId: 'user-123',
  userName: 'John Doe',
  userRole: 'Technician',
  action: 'Custom action description',
  actionType: 'turn.created',
  entityType: 'turn',
  entityId: 'turn-xyz',
  entityName: 'Unit 204 Turn',
  metadata: { customField: 'value' },
  timestamp: Timestamp.now()
});
```

## Maintenance Tasks

### Update Vacant Unit Days (Daily)
```javascript
import { updateAllVacantUnitDays } from './services/unitsService';

const result = await updateAllVacantUnitDays();
console.log(`Updated ${result.data.updatedCount} units`);
```

### Clean Old Activities (Monthly)
```javascript
import { deleteOldActivities } from './services/activityService';

const result = await deleteOldActivities(90); // Keep 90 days
console.log(`Deleted ${result.data.deletedCount} old activities`);
```

## Related Documentation

- [Database Schema](../../docs/database-schema.md)
- [TypeScript Types](../types/database.ts)
- [Firestore Security Rules](../../firestore.rules)
