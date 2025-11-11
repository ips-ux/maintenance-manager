# Firebase Database Schema - IPS-UX Maintenance Manager

## Overview
This document defines the complete Firestore database schema for the IPS-UX Maintenance Manager application. The schema supports turn management workflows, unit inventory tracking, calendar scheduling, vendor management, and activity logging.

## Table of Contents
1. [Collections Overview](#collections-overview)
2. [Collection Schemas](#collection-schemas)
3. [Firestore Indexes](#firestore-indexes)
4. [Firebase Storage Structure](#firebase-storage-structure)
5. [Query Patterns](#query-patterns)
6. [Security Considerations](#security-considerations)

---

## Collections Overview

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| `units` | Master unit inventory | Unit details, status tracking, turn references |
| `turns` | Turn workflow management | Checklist system, assignments, status tracking |
| `calendar` | Events and scheduling | Vendor visits, inspections, move-ins |
| `vendors` | Vendor directory | Contact information, categorization |
| `users` | User profiles | Extended Firebase Auth data, roles |
| `activity` | System-wide activity log | Dashboard feed, audit trail |

---

## Collection Schemas

### 1. units Collection

**Path:** `/units/{unitId}`

**Purpose:** Master inventory of all property units with current status and metadata.

**Document Structure:**

```javascript
{
  // Document ID: Auto-generated or custom (e.g., "unit-101")

  // Core Unit Information
  unitNumber: string,              // e.g., "101", "2B", "Building A-305"
  bedrooms: number,                // Number of bedrooms (0 for studio)
  bathrooms: number,               // Number of bathrooms (decimal: 1.5, 2.0)
  squareFootage: number,           // Square footage of unit
  floor: number,                   // Floor number (optional)
  building: string,                // Building identifier (optional, for multi-building)

  // Status Tracking
  status: string,                  // "Ready" | "In Progress" | "Blocked" | "Occupied"
  currentTurnId: string | null,   // Reference to active turn document ID
  lastTurnCompletedDate: timestamp | null,  // Last turn completion date

  // Vacancy Tracking
  isVacant: boolean,               // Quick vacancy check
  vacantSince: timestamp | null,   // When unit became vacant
  daysVacant: number,              // Computed field for reporting

  // Additional Metadata
  notes: string,                   // General unit notes
  amenities: array<string>,        // ["Balcony", "Washer/Dryer", etc.]

  // Timestamps
  createdAt: timestamp,            // Document creation
  updatedAt: timestamp             // Last modification
}
```

**Indexes Required:**
- Composite: `status` (ASC) + `vacantSince` (DESC)
- Single field: `isVacant` (ASC)
- Single field: `currentTurnId` (ASC)

**Sample Document:**

```javascript
{
  unitNumber: "204",
  bedrooms: 2,
  bathrooms: 2,
  squareFootage: 950,
  floor: 2,
  building: "Main",
  status: "In Progress",
  currentTurnId: "turn-xyz123",
  lastTurnCompletedDate: Timestamp(2025-10-15),
  isVacant: true,
  vacantSince: Timestamp(2025-11-01),
  daysVacant: 9,
  notes: "Corner unit with great natural light",
  amenities: ["Balcony", "Updated Kitchen"],
  createdAt: Timestamp(2025-01-15),
  updatedAt: Timestamp(2025-11-10)
}
```

---

### 2. turns Collection (HIGHEST PRIORITY)

**Path:** `/turns/{turnId}`

**Purpose:** Manages the complete turn workflow from vacancy to ready-to-rent status.

**Document Structure:**

```javascript
{
  // Document ID: Auto-generated

  // Unit Reference
  unitId: string,                  // Reference to units collection document ID
  unitNumber: string,              // Denormalized for quick display

  // Status and Timeline
  status: string,                  // "In Progress" | "Completed" | "Blocked" | "Cancelled"
  startDate: timestamp,            // Turn workflow start
  targetCompletionDate: timestamp, // Expected completion
  actualCompletionDate: timestamp | null,  // Actual completion (null if not complete)
  daysInProgress: number,          // Computed: days since start
  daysOverdue: number,             // Computed: days past target (0 if on time)

  // Assignment
  assignedTechnicianId: string,    // User ID of assigned technician
  assignedTechnicianName: string,  // Denormalized for display

  // Checklist System
  checklist: array<{
    taskId: string,                // Unique task identifier
    taskName: string,              // e.g., "Deep Clean", "Paint Touch-up"
    category: string,              // "Cleaning", "Maintenance", "Inspection"
    required: boolean,             // Is this task mandatory?
    order: number,                 // Display order (1, 2, 3...)
    completed: boolean,            // Task completion status
    completedBy: string | null,    // User ID who completed
    completedByName: string | null, // Denormalized name
    completedAt: timestamp | null, // When task was completed
    photos: array<string>,         // Firebase Storage paths
    notes: string                  // Task-specific notes
  }>,

  // Summary Statistics (Computed)
  totalTasks: number,              // Total checklist items
  completedTasks: number,          // Number completed
  progressPercentage: number,      // (completedTasks / totalTasks) * 100

  // Additional Information
  notes: string,                   // General turn notes
  blockageReason: string | null,   // Reason if status is "Blocked"
  priority: string,                // "Normal" | "High" | "Urgent"

  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Subcollection: `/turns/{turnId}/activities`**

Purpose: Detailed activity log for turn-specific events.

```javascript
{
  userId: string,                  // Who performed the action
  userName: string,                // Denormalized
  action: string,                  // Description of action
  actionType: string,              // "task_completed" | "status_changed" | "note_added"
  metadata: object,                // Additional context (task details, etc.)
  timestamp: timestamp
}
```

**Indexes Required:**
- Composite: `status` (ASC) + `targetCompletionDate` (ASC)
- Composite: `assignedTechnicianId` (ASC) + `status` (ASC)
- Composite: `unitId` (ASC) + `createdAt` (DESC)
- Single field: `startDate` (DESC)

**Sample Document:**

```javascript
{
  unitId: "unit-204",
  unitNumber: "204",
  status: "In Progress",
  startDate: Timestamp(2025-11-07),
  targetCompletionDate: Timestamp(2025-11-12),
  actualCompletionDate: null,
  daysInProgress: 3,
  daysOverdue: 0,
  assignedTechnicianId: "user-john123",
  assignedTechnicianName: "John D.",
  checklist: [
    {
      taskId: "task-1",
      taskName: "Initial Walkthrough",
      category: "Inspection",
      required: true,
      order: 1,
      completed: true,
      completedBy: "user-john123",
      completedByName: "John D.",
      completedAt: Timestamp(2025-11-07 09:00),
      photos: ["turns/turn-xyz/walkthrough-1.jpg"],
      notes: "Minor wall damage noted in bedroom"
    },
    {
      taskId: "task-2",
      taskName: "Deep Clean",
      category: "Cleaning",
      required: true,
      order: 2,
      completed: true,
      completedBy: "user-john123",
      completedByName: "John D.",
      completedAt: Timestamp(2025-11-08 14:30),
      photos: [],
      notes: ""
    },
    {
      taskId: "task-3",
      taskName: "Paint Touch-up",
      category: "Maintenance",
      required: true,
      order: 3,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null,
      photos: [],
      notes: ""
    }
  ],
  totalTasks: 12,
  completedTasks: 7,
  progressPercentage: 58.33,
  notes: "Scheduled carpet cleaning for Nov 10",
  blockageReason: null,
  priority: "Normal",
  createdAt: Timestamp(2025-11-07),
  updatedAt: Timestamp(2025-11-08)
}
```

---

### 3. calendar Collection

**Path:** `/calendar/{eventId}`

**Purpose:** Scheduling system for vendor visits, inspections, and move-ins.

**Document Structure:**

```javascript
{
  // Document ID: Auto-generated

  // Event Details
  title: string,                   // e.g., "Carpet Cleaning - Unit 301"
  description: string,             // Detailed event description
  eventType: string,               // "Vendor Visit" | "Inspection" | "Move-in" | "Other"

  // Scheduling
  startDateTime: timestamp,        // Event start
  endDateTime: timestamp,          // Event end
  allDay: boolean,                 // Is this an all-day event?

  // References
  unitId: string | null,           // Associated unit (optional)
  unitNumber: string | null,       // Denormalized
  turnId: string | null,           // Associated turn (optional)
  vendorId: string | null,         // Associated vendor (optional)
  vendorName: string | null,       // Denormalized

  // Assignment
  assignedTo: string | null,       // User ID responsible
  assignedToName: string | null,   // Denormalized

  // Status
  status: string,                  // "Scheduled" | "Completed" | "Cancelled" | "Rescheduled"
  completedAt: timestamp | null,   // When marked complete
  cancelledReason: string | null,  // Reason if cancelled

  // Additional Information
  notes: string,                   // Event notes
  reminderSent: boolean,           // Reminder notification status

  // Timestamps
  createdAt: timestamp,
  createdBy: string,               // User who created event
  updatedAt: timestamp
}
```

**Indexes Required:**
- Composite: `startDateTime` (ASC) + `status` (ASC)
- Composite: `unitId` (ASC) + `startDateTime` (ASC)
- Composite: `assignedTo` (ASC) + `startDateTime` (ASC)
- Single field: `eventType` (ASC)

**Sample Document:**

```javascript
{
  title: "Carpet Cleaning - Unit 301",
  description: "Deep carpet cleaning for all rooms",
  eventType: "Vendor Visit",
  startDateTime: Timestamp(2025-11-10 14:00),
  endDateTime: Timestamp(2025-11-10 16:00),
  allDay: false,
  unitId: "unit-301",
  unitNumber: "301",
  turnId: "turn-abc456",
  vendorId: "vendor-cleanpro",
  vendorName: "CleanPro Services",
  assignedTo: "user-mike789",
  assignedToName: "Mike R.",
  status: "Scheduled",
  completedAt: null,
  cancelledReason: null,
  notes: "Use eco-friendly products",
  reminderSent: false,
  createdAt: Timestamp(2025-11-08),
  createdBy: "user-admin123",
  updatedAt: Timestamp(2025-11-08)
}
```

---

### 4. vendors Collection

**Path:** `/vendors/{vendorId}`

**Purpose:** Directory of service vendors and contractors.

**Document Structure:**

```javascript
{
  // Document ID: Auto-generated

  // Basic Information
  vendorName: string,              // Business name
  category: string,                // "Carpet" | "HVAC" | "Plumbing" | "Electrical" | "Paint" | "General"

  // Contact Information
  contactName: string,             // Primary contact person
  phone: string,                   // Primary phone
  alternatePhone: string,          // Secondary phone (optional)
  email: string,                   // Email address
  website: string,                 // Website URL (optional)

  // Address (optional)
  address: {
    street: string,
    city: string,
    state: string,
    zip: string
  } | null,

  // Business Details
  servicesOffered: array<string>,  // List of specific services
  licensedInsured: boolean,        // Insurance/licensing status
  preferredVendor: boolean,        // Is this a preferred vendor?

  // Performance Tracking
  rating: number,                  // 1-5 rating (optional)
  lastServiceDate: timestamp | null, // Last time used
  totalJobsCompleted: number,      // Historical job count

  // Additional Information
  notes: string,                   // Internal notes
  active: boolean,                 // Is vendor active?

  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes Required:**
- Composite: `category` (ASC) + `active` (ASC)
- Single field: `preferredVendor` (ASC)
- Single field: `active` (ASC)

**Sample Document:**

```javascript
{
  vendorName: "CleanPro Services",
  category: "Carpet",
  contactName: "Robert Johnson",
  phone: "(555) 123-4567",
  alternatePhone: "",
  email: "robert@cleanpro.com",
  website: "https://cleanproservices.com",
  address: {
    street: "123 Business Blvd",
    city: "Austin",
    state: "TX",
    zip: "78701"
  },
  servicesOffered: ["Carpet Cleaning", "Upholstery", "Tile Cleaning"],
  licensedInsured: true,
  preferredVendor: true,
  rating: 4.5,
  lastServiceDate: Timestamp(2025-11-05),
  totalJobsCompleted: 47,
  notes: "Usually available within 48 hours",
  active: true,
  createdAt: Timestamp(2024-06-15),
  updatedAt: Timestamp(2025-11-05)
}
```

---

### 5. users Collection

**Path:** `/users/{userId}`

**Purpose:** Extended user profiles complementing Firebase Authentication.

**Document Structure:**

```javascript
{
  // Document ID: Must match Firebase Auth UID

  // Basic Information
  uid: string,                     // Firebase Auth UID (redundant but useful)
  email: string,                   // Email from Firebase Auth
  displayName: string,             // Full name
  phoneNumber: string,             // Contact phone (optional)

  // Role and Permissions
  role: string,                    // "Admin" | "Technician" | "Viewer" | "Manager"
  permissions: array<string>,      // ["turns.edit", "vendors.manage", etc.]

  // Status
  active: boolean,                 // Can user access system?
  emailVerified: boolean,          // From Firebase Auth

  // Profile Information
  photoURL: string | null,         // Profile photo (Firebase Storage path)
  bio: string,                     // Short bio/description (optional)

  // Work Information (for technicians)
  specialties: array<string>,      // Areas of expertise
  certifications: array<string>,   // Professional certifications

  // Activity Tracking
  lastLoginAt: timestamp | null,   // Last login time
  totalTurnsCompleted: number,     // Performance metric
  avgTurnCompletionTime: number,   // Average days to complete turn

  // Preferences
  notificationSettings: {
    emailNotifications: boolean,
    pushNotifications: boolean,
    smsNotifications: boolean
  },

  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes Required:**
- Single field: `role` (ASC)
- Single field: `active` (ASC)
- Composite: `role` (ASC) + `active` (ASC)

**Sample Document:**

```javascript
{
  uid: "user-john123",
  email: "john.doe@example.com",
  displayName: "John Doe",
  phoneNumber: "(555) 987-6543",
  role: "Technician",
  permissions: ["turns.view", "turns.edit", "units.view"],
  active: true,
  emailVerified: true,
  photoURL: "users/john123/profile.jpg",
  bio: "Senior maintenance technician with 10 years experience",
  specialties: ["Plumbing", "Electrical", "HVAC"],
  certifications: ["EPA 608", "Electrical License"],
  lastLoginAt: Timestamp(2025-11-10 08:30),
  totalTurnsCompleted: 143,
  avgTurnCompletionTime: 4.8,
  notificationSettings: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  },
  createdAt: Timestamp(2024-01-15),
  updatedAt: Timestamp(2025-11-10)
}
```

---

### 6. activity Collection

**Path:** `/activity/{activityId}`

**Purpose:** System-wide activity log for dashboard feed and audit trail.

**Document Structure:**

```javascript
{
  // Document ID: Auto-generated

  // User Information
  userId: string,                  // Who performed the action
  userName: string,                // Denormalized for display
  userRole: string,                // User's role at time of action

  // Action Details
  action: string,                  // Human-readable description
  actionType: string,              // "turn.created" | "task.completed" | "vendor.scheduled"

  // Entity References
  entityType: string,              // "turn" | "unit" | "calendar" | "vendor"
  entityId: string,                // ID of affected entity
  entityName: string,              // Denormalized (unit number, vendor name, etc.)

  // Additional Context
  metadata: object,                // Additional data (before/after values, etc.)

  // Timestamp
  timestamp: timestamp,            // When action occurred

  // Display Helpers
  icon: string,                    // Icon identifier for UI
  color: string                    // Color code for UI (optional)
}
```

**Indexes Required:**
- Single field: `timestamp` (DESC)
- Composite: `entityType` (ASC) + `timestamp` (DESC)
- Composite: `userId` (ASC) + `timestamp` (DESC)

**Sample Document:**

```javascript
{
  userId: "user-john123",
  userName: "John D.",
  userRole: "Technician",
  action: "Cleaning completed in Unit 204",
  actionType: "task.completed",
  entityType: "turn",
  entityId: "turn-xyz123",
  entityName: "Unit 204 Turn",
  metadata: {
    taskName: "Deep Clean",
    unitNumber: "204",
    turnStatus: "In Progress"
  },
  timestamp: Timestamp(2025-11-10 14:30),
  icon: "check-circle",
  color: "green"
}
```

---

## Firestore Indexes

### Required Composite Indexes

Create these indexes in the Firebase Console or via `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "units",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "vacantSince", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "turns",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "targetCompletionDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "turns",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "assignedTechnicianId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "calendar",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "startDateTime", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "calendar",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "unitId", "order": "ASCENDING" },
        { "fieldPath": "startDateTime", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "vendors",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "active", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "activity",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "entityType", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Firebase Storage Structure

### Directory Organization

```
storage/
├── turns/
│   ├── {turnId}/
│   │   ├── walkthrough/
│   │   │   ├── before-1.jpg
│   │   │   ├── before-2.jpg
│   │   ├── cleaning/
│   │   │   ├── kitchen-after.jpg
│   │   │   ├── bathroom-after.jpg
│   │   ├── maintenance/
│   │   │   ├── paint-touchup.jpg
│   │   ├── final-inspection/
│   │   │   ├── final-1.jpg
│   │   │   ├── final-2.jpg
├── users/
│   ├── {userId}/
│   │   ├── profile.jpg
├── units/
│   ├── {unitId}/
│   │   ├── unit-photos/
│   │   │   ├── exterior.jpg
│   │   │   ├── floorplan.pdf
```

### Storage Path Conventions

- Turn photos: `turns/{turnId}/{category}/{filename}`
- User profiles: `users/{userId}/profile.jpg`
- Unit photos: `units/{unitId}/unit-photos/{filename}`

### Metadata Standards

All uploaded files should include metadata:

```javascript
{
  contentType: 'image/jpeg',
  customMetadata: {
    uploadedBy: userId,
    uploadedAt: timestamp,
    entityType: 'turn',
    entityId: turnId,
    taskId: taskId (for turn photos)
  }
}
```

---

## Query Patterns

### Common Queries

#### 1. Active Turns Dashboard

```javascript
// Get all active turns ordered by target completion
const q = query(
  collection(db, 'turns'),
  where('status', '==', 'In Progress'),
  orderBy('targetCompletionDate', 'asc'),
  limit(10)
);
```

#### 2. Vacant Units

```javascript
// Get all vacant units ordered by vacancy duration
const q = query(
  collection(db, 'units'),
  where('isVacant', '==', true),
  orderBy('vacantSince', 'asc')
);
```

#### 3. Technician's Assigned Turns

```javascript
// Get turns assigned to specific technician
const q = query(
  collection(db, 'turns'),
  where('assignedTechnicianId', '==', userId),
  where('status', 'in', ['In Progress', 'Blocked']),
  orderBy('targetCompletionDate', 'asc')
);
```

#### 4. Upcoming Calendar Events

```javascript
// Get scheduled events for next 7 days
const now = Timestamp.now();
const sevenDaysLater = Timestamp.fromDate(
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
);

const q = query(
  collection(db, 'calendar'),
  where('startDateTime', '>=', now),
  where('startDateTime', '<=', sevenDaysLater),
  where('status', '==', 'Scheduled'),
  orderBy('startDateTime', 'asc')
);
```

#### 5. Recent Activity Feed

```javascript
// Get last 20 activities
const q = query(
  collection(db, 'activity'),
  orderBy('timestamp', 'desc'),
  limit(20)
);
```

#### 6. Active Vendors by Category

```javascript
// Get active vendors in specific category
const q = query(
  collection(db, 'vendors'),
  where('category', '==', 'Carpet'),
  where('active', '==', true),
  orderBy('vendorName', 'asc')
);
```

---

## Security Considerations

### Data Validation

All write operations should validate:
- Required fields are present
- Data types match schema
- Enum values are valid (status, role, etc.)
- Timestamps are valid
- References point to existing documents

### Denormalization Strategy

The schema uses strategic denormalization to improve read performance:
- User names stored with activity records
- Unit numbers stored with turns
- Vendor names stored with calendar events

**Important:** Update denormalized data when source changes using Cloud Functions or client-side logic.

### Computed Fields

Some fields are computed and should be updated on write:
- `daysVacant` in units
- `daysInProgress` in turns
- `progressPercentage` in turns
- `completedTasks` / `totalTasks` in turns

### Photo Management

- Store only Firebase Storage paths in Firestore
- Use signed URLs for photo access
- Implement photo compression before upload
- Set maximum file size limits (e.g., 5MB per photo)

---

## Schema Version

**Version:** 1.0.0
**Last Updated:** 2025-11-10
**Status:** Initial Implementation

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-10 | Initial schema definition |

---

## Related Documentation

- [Firestore Security Rules](../firestore.rules)
- [TypeScript Type Definitions](../src/types/database.ts)
- [Service Layer Documentation](../src/services/README.md)
