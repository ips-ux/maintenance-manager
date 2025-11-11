# Database Structure and Rules Documentation

**Last Updated:** 2025-11-11
**Database System:** Firebase Firestore
**Document Version:** 1.0

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Collection Schemas](#collection-schemas)
3. [Data Relationships](#data-relationships)
4. [Enums and Constants](#enums-and-constants)
5. [Business Rules](#business-rules)
6. [Timestamp Patterns](#timestamp-patterns)
7. [Array and Object Structures](#array-and-object-structures)
8. [Sample Data Patterns](#sample-data-patterns)

---

## Database Overview

### Firebase Firestore Structure

The Maintenance Manager application uses **Google Firebase Firestore** as its primary database. Firestore is a NoSQL, document-oriented database that stores data in collections of documents.

### Collection Names

The database consists of six primary collections:

| Collection | Purpose | Estimated Documents |
|-----------|---------|---------------------|
| **Units** | Apartment/rental unit inventory | ~120 documents |
| **Turns** | Turn/turnover operations for vacant units | Variable (5-20 active) |
| **Vendors** | Service providers and contractors | ~6 documents |
| **Users** | User accounts and technician profiles | ~3+ documents |
| **Calendar Events** | Scheduled maintenance, inspections, vendor visits | Variable (5-50 active) |
| **Activities** | Audit log of all user actions | Continuously growing |

### Overall Organization Philosophy

The database follows a **hybrid hierarchical-relational** model:

- **Document-centric**: Each collection contains independent documents with complete information
- **Reference-based relationships**: Collections reference each other via document IDs rather than embedding
- **Denormalization**: Common fields (e.g., `unitNumber`, `vendorName`, `assignedTechnicianName`) are duplicated for query efficiency
- **Audit trail**: Activities collection logs all significant actions for accountability
- **Timestamp-based ordering**: Most collections use Firestore Timestamps for chronological queries

---

## Collection Schemas

### 1. Units Collection

**Collection Name:** `units`

**Document ID Format:** Auto-generated Firestore document IDs (e.g., `abc123def456`)

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `unitNumber` | String | Yes | Unique unit identifier (e.g., "101", "204", "301") |
| `bedrooms` | Number | Yes | Number of bedrooms (0-3+) |
| `bathrooms` | Number | Yes | Number of bathrooms (1-2+) |
| `squareFootage` | Number | Yes | Total square footage of unit |
| `floor` | Number | Yes | Floor level (derived from unit number) |
| `building` | String | Yes | Building name or identifier (e.g., "Main") |
| `status` | String | Yes | Current unit status - see [Status Values](#status-values) |
| `currentTurnId` | String or Null | No | References active Turn document ID |
| `lastTurnCompletedDate` | Timestamp or Null | No | When the last turn was completed |
| `isVacant` | Boolean | Yes | Whether unit is currently vacant |
| `vacantSince` | Timestamp or Null | No | When the unit became vacant |
| `daysVacant` | Number | No | Number of days unit has been vacant |
| `notes` | String | No | General notes about the unit (e.g., "Corner unit with great natural light") |
| `amenities` | Array of Strings | No | List of special features (e.g., ["Balcony", "Updated Kitchen"]) |

#### Validation Rules

- `unitNumber` must be unique across the collection
- `bedrooms` and `bathrooms` must be non-negative integers
- `squareFootage` must be greater than 0
- `status` must be one of the defined status values
- `isVacant` and `status` relationship: If `isVacant` is true, `status` should be "Ready" or "In Progress"
- If `isVacant` is false, `status` should be "Occupied"
- `daysVacant` is calculated and stored for query efficiency; `daysVacant = (currentDate - vacantSince)`

#### Example Document

```json
{
  "id": "unit_firebase_id_001",
  "unitNumber": "204",
  "bedrooms": 2,
  "bathrooms": 1,
  "squareFootage": 850,
  "floor": 2,
  "building": "Main",
  "status": "In Progress",
  "currentTurnId": "turn_firebase_id_001",
  "lastTurnCompletedDate": null,
  "isVacant": true,
  "vacantSince": Timestamp(2025-11-05),
  "daysVacant": 6,
  "notes": "Corner unit with great natural light",
  "amenities": ["Balcony", "Updated Kitchen"]
}
```

---

### 2. Turns Collection

**Collection Name:** `turns`

**Document ID Format:** Auto-generated Firestore document IDs (e.g., `turn_abc123`)

**Purpose:** Represents a unit turnover operation—the process of preparing a vacant unit for the next tenant.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `unitId` | String | Yes | References Units collection document ID |
| `unitNumber` | String | Yes | Denormalized unit number for display/query |
| `bedrooms` | Number | Yes | Denormalized bedroom count |
| `bathrooms` | Number | Yes | Denormalized bathroom count |
| `status` | String | Yes | Turn status - see [Turn Status Values](#turn-status-values) |
| `startDate` | Timestamp | Yes | When the turn commenced |
| `targetCompletionDate` | Timestamp | Yes | Expected completion date |
| `actualCompletionDate` | Timestamp or Null | No | When the turn was actually completed |
| `assignedTechnicianId` | String | Yes | References Users collection (uid field) |
| `assignedTechnicianName` | String | Yes | Denormalized technician name |
| `checklist` | Array of Objects | Yes | Task checklist - see [Checklist Structure](#checklist-structure) |
| `notes` | String | No | General notes about the turn |
| `blockageReason` | String or Null | No | Reason if turn is blocked/delayed |
| `priority` | String | No | Turn priority level - see [Priority Levels](#priority-levels) |

#### Validation Rules

- `unitId` must reference a valid Units document
- `status` must be one of the defined turn status values
- `startDate` must be <= `targetCompletionDate`
- If `status` is "Completed", `actualCompletionDate` must not be null
- `assignedTechnicianId` must reference a valid user
- All checklist items must have valid structure (see Checklist Structure)
- Completion percentage can be calculated as: `(completedTasks / totalTasks) * 100`

#### Example Document

```json
{
  "id": "turn_firebase_id_001",
  "unitId": "unit_firebase_id_001",
  "unitNumber": "204",
  "bedrooms": 2,
  "bathrooms": 1,
  "status": "In Progress",
  "startDate": Timestamp(2025-11-05),
  "targetCompletionDate": Timestamp(2025-11-10),
  "actualCompletionDate": null,
  "assignedTechnicianId": "tech-john-123",
  "assignedTechnicianName": "John Doe",
  "checklist": [...],
  "notes": "Scheduled carpet cleaning for tomorrow",
  "blockageReason": null,
  "priority": "Normal"
}
```

---

### 3. Vendors Collection

**Collection Name:** `vendors`

**Document ID Format:** Auto-generated Firestore document IDs

**Purpose:** Maintains records of third-party service providers used for specialized maintenance tasks.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vendorName` | String | Yes | Official company name (e.g., "CleanPro Services") |
| `category` | String | Yes | Service category - see [Vendor Categories](#vendor-categories) |
| `contactName` | String | Yes | Primary contact person name |
| `phone` | String | Yes | Primary phone number |
| `alternatePhone` | String | No | Secondary phone number |
| `email` | String | Yes | Primary email address |
| `website` | String | No | Company website URL |
| `address` | Object or Null | No | Business address - see [Address Object Structure](#address-object-structure) |
| `servicesOffered` | Array of Strings | Yes | List of specific services provided |
| `licensedInsured` | Boolean | Yes | Whether vendor is licensed and insured |
| `preferredVendor` | Boolean | Yes | Whether this is a preferred/trusted vendor |
| `rating` | Number | No | Average rating (0-5 scale) |
| `lastServiceDate` | Timestamp | No | Date of most recent service |
| `totalJobsCompleted` | Number | No | Cumulative count of completed jobs |
| `notes` | String | No | General notes (e.g., "Emergency service available") |
| `active` | Boolean | Yes | Whether vendor is currently available |

#### Validation Rules

- `vendorName` should be unique (enforced at application level)
- `category` must match predefined vendor categories
- `email` should follow valid email format
- `rating` must be between 0 and 5 if provided
- `licenseInsured` should be true for preferred vendors
- `lastServiceDate` must not be in the future
- `totalJobsCompleted` must be non-negative

#### Example Document

```json
{
  "id": "vendor_firebase_id_001",
  "vendorName": "CleanPro Services",
  "category": "Carpet",
  "contactName": "Robert Johnson",
  "phone": "(555) 123-4567",
  "alternatePhone": "",
  "email": "robert@cleanpro.com",
  "website": "https://cleanproservices.com",
  "address": {
    "street": "123 Business Blvd",
    "city": "Austin",
    "state": "TX",
    "zip": "78701"
  },
  "servicesOffered": ["Carpet Cleaning", "Upholstery", "Tile Cleaning"],
  "licensedInsured": true,
  "preferredVendor": true,
  "rating": 4.5,
  "lastServiceDate": Timestamp(2025-11-06),
  "totalJobsCompleted": 47,
  "notes": "Usually available within 48 hours",
  "active": true
}
```

---

### 4. Users Collection

**Collection Name:** `users`

**Document ID Format:** Firebase Authentication UID (e.g., `tech-john-123`)

**Purpose:** Stores user account information, roles, permissions, and profile data.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | String | Yes | Firebase Authentication unique ID (document ID) |
| `email` | String | Yes | User's email address |
| `displayName` | String | Yes | Full name of user |
| `phoneNumber` | String | No | Contact phone number |
| `role` | String | Yes | User role - see [User Roles](#user-roles) |
| `permissions` | Array of Strings | Yes | List of permission strings (e.g., "turns.view", "turns.edit") |
| `active` | Boolean | Yes | Whether user account is active |
| `emailVerified` | Boolean | Yes | Whether email has been verified |
| `photoURL` | String or Null | No | URL to user's profile photo |
| `bio` | String | No | User biography or professional summary |
| `specialties` | Array of Strings | No | Areas of expertise (e.g., ["Plumbing", "Electrical"]) |
| `certifications` | Array of Strings | No | Professional certifications held |
| `lastLoginAt` | Timestamp | No | When user last logged in |
| `totalTurnsCompleted` | Number | No | Count of completed turns |
| `avgTurnCompletionTime` | Number | No | Average days to complete a turn |
| `notificationSettings` | Object | No | User notification preferences - see [Notification Settings](#notification-settings) |

#### Validation Rules

- `uid` must be unique (primary key)
- `email` should follow valid email format and be unique
- `role` must be one of the defined user roles
- `permissions` must contain valid permission strings
- `photoURL` should be a valid URL if provided
- `totalTurnsCompleted` must be non-negative
- `avgTurnCompletionTime` should be positive if provided
- `lastLoginAt` must not be in the future

#### Example Document

```json
{
  "uid": "tech-john-123",
  "email": "john.doe@maintenance.com",
  "displayName": "John Doe",
  "phoneNumber": "(555) 111-2222",
  "role": "Technician",
  "permissions": ["turns.view", "turns.edit", "units.view", "calendar.view"],
  "active": true,
  "emailVerified": true,
  "photoURL": null,
  "bio": "Senior maintenance technician with 10 years experience",
  "specialties": ["Plumbing", "Electrical", "HVAC"],
  "certifications": ["EPA 608", "Electrical License"],
  "lastLoginAt": Timestamp(2025-11-11 14:00:00),
  "totalTurnsCompleted": 143,
  "avgTurnCompletionTime": 4.8,
  "notificationSettings": {
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false
  }
}
```

---

### 5. Calendar Events Collection

**Collection Name:** `calendarEvents` (or equivalent)

**Document ID Format:** Auto-generated Firestore document IDs

**Purpose:** Maintains scheduled events including vendor visits, inspections, move-ins, and maintenance activities.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Event title (e.g., "Carpet Cleaning - Unit 204") |
| `description` | String | No | Detailed event description |
| `eventType` | String | Yes | Type of event - see [Event Types](#event-types) |
| `startDateTime` | Timestamp | Yes | Event start date and time |
| `endDateTime` | Timestamp | Yes | Event end date and time |
| `allDay` | Boolean | Yes | Whether event spans entire day(s) |
| `unitId` | String | Yes | References Units collection document ID |
| `unitNumber` | String | Yes | Denormalized unit number |
| `turnId` | String or Null | No | References Turns document if applicable |
| `vendorId` | String or Null | No | References Vendors document if vendor visit |
| `vendorName` | String or Null | No | Denormalized vendor name |
| `assignedTo` | String or Null | No | References Users collection (uid) |
| `assignedToName` | String or Null | No | Denormalized technician name |
| `status` | String | Yes | Event status - see [Event Status Values](#event-status-values) |
| `completedAt` | Timestamp or Null | No | When event was completed |
| `cancelledReason` | String or Null | No | Reason if event was cancelled |
| `notes` | String | No | Additional event notes |
| `reminderSent` | Boolean | No | Whether reminder notification was sent |

#### Validation Rules

- `startDateTime` must be before or equal to `endDateTime`
- `unitId` must reference a valid Units document
- If `eventType` is "Vendor Visit", `vendorId` should not be null
- If `status` is "Completed", `completedAt` must not be null
- If `status` is "Cancelled", `cancelledReason` should not be null
- `assignedTo` should reference a valid user if provided

#### Example Document

```json
{
  "id": "event_firebase_id_001",
  "title": "Carpet Cleaning - Unit 204",
  "description": "Deep carpet cleaning for all rooms",
  "eventType": "Vendor Visit",
  "startDateTime": Timestamp(2025-11-11 14:00:00),
  "endDateTime": Timestamp(2025-11-11 16:00:00),
  "allDay": false,
  "unitId": "unit_firebase_id_001",
  "unitNumber": "204",
  "turnId": null,
  "vendorId": "vendor_firebase_id_001",
  "vendorName": "CleanPro Services",
  "assignedTo": "tech-mike-789",
  "assignedToName": "Mike Roberts",
  "status": "Scheduled",
  "completedAt": null,
  "cancelledReason": null,
  "notes": "Use eco-friendly products",
  "reminderSent": false
}
```

---

### 6. Activities Collection

**Collection Name:** `activities`

**Document ID Format:** Auto-generated Firestore document IDs

**Purpose:** Audit log recording all significant actions performed in the system for tracking and compliance.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | String | Yes | References Users collection (uid) |
| `userName` | String | Yes | Denormalized user display name |
| `userRole` | String | Yes | User's role at time of action |
| `action` | String | Yes | Human-readable description of action |
| `actionType` | String | Yes | Structured action type - see [Action Types](#action-types) |
| `entityType` | String | Yes | Type of entity affected - see [Entity Types](#entity-types) |
| `entityId` | String | No | ID of affected entity |
| `entityName` | String | No | Human-readable name of affected entity |
| `timestamp` | Timestamp | Yes | When the action occurred |
| `metadata` | Object | No | Additional contextual data specific to action |

#### Validation Rules

- `userId` must reference a valid user
- `actionType` must be one of the predefined types
- `entityType` must be one of the predefined types
- `timestamp` must not be in the future
- `metadata` structure depends on `actionType`

#### Example Documents

```json
{
  "id": "activity_firebase_id_001",
  "userId": "tech-john-123",
  "userName": "John D.",
  "userRole": "Technician",
  "action": "Cleaning completed in Unit 204",
  "actionType": "task.completed",
  "entityType": "turn",
  "entityId": "turn-204",
  "entityName": "Unit 204 Turn",
  "timestamp": Timestamp(2025-11-11 12:00:00),
  "metadata": {
    "taskName": "Deep Clean",
    "unitNumber": "204"
  }
}
```

```json
{
  "id": "activity_firebase_id_002",
  "userId": "tech-mike-789",
  "userName": "Mike R.",
  "userRole": "Technician",
  "action": "Vendor scheduled for Unit 301",
  "actionType": "vendor.scheduled",
  "entityType": "calendar",
  "entityId": "event-301",
  "entityName": "Carpet Cleaning - Unit 301",
  "timestamp": Timestamp(2025-11-11 05:00:00),
  "metadata": {
    "vendorName": "CleanPro Services",
    "unitNumber": "301"
  }
}
```

---

## Data Relationships

### Relationship Diagram

```
Units (Parent)
  ├─ One-to-Many: currentTurnId → Turns
  ├─ One-to-Many: unit references in CalendarEvents
  └─ One-to-Many: unit references in Activities

Turns (Child of Units)
  ├─ Many-to-One: unitId → Units
  ├─ Many-to-One: assignedTechnicianId → Users
  └─ One-to-Many: turn references in CalendarEvents

Vendors
  ├─ One-to-Many: vendor references in CalendarEvents
  └─ One-to-Many: vendor references in Activities

Users
  ├─ One-to-Many: uid references in Turns
  ├─ One-to-Many: uid references in CalendarEvents
  └─ One-to-Many: uid references in Activities

CalendarEvents
  ├─ Many-to-One: unitId → Units
  ├─ Many-to-One: turnId → Turns (optional)
  ├─ Many-to-One: vendorId → Vendors (optional)
  └─ Many-to-One: assignedTo → Users (optional)

Activities
  ├─ Many-to-One: userId → Users
  ├─ References any entity by type (unitId, turnId, vendorId, etc.)
```

### Foreign Key Patterns

All relationships use **document ID references** rather than embedding related data. This follows NoSQL best practices:

- **Units → Turns**: `turns.unitId` = `units.id`
- **Turns → Users**: `turns.assignedTechnicianId` = `users.uid`
- **Turns → Units**: `turns.unitNumber` (denormalized for display)
- **CalendarEvents → Units**: `calendarEvents.unitId` = `units.id`
- **CalendarEvents → Vendors**: `calendarEvents.vendorId` = `vendors.id`
- **CalendarEvents → Turns**: `calendarEvents.turnId` = `turns.id` (optional)
- **Activities → Users**: `activities.userId` = `users.uid`

### Denormalization Strategy

To optimize query performance and reduce Firestore read costs, the following fields are denormalized (copied from parent collections):

| Referencing Collection | Denormalized Fields |
|------------------------|-------------------|
| Turns | `unitNumber`, `bedrooms`, `bathrooms`, `assignedTechnicianName` |
| CalendarEvents | `unitNumber`, `vendorName`, `assignedToName` |
| Activities | `userName`, `userRole`, `entityName` |

**Important**: When these denormalized fields are updated (e.g., technician name change), all related documents must be updated to maintain consistency. Consider implementing application-level triggers or batch update jobs.

---

## Enums and Constants

### Status Values

#### Unit Status

- **"Occupied"**: Unit is currently occupied by a tenant
- **"Ready"**: Unit is vacant and ready for occupancy
- **"In Progress"**: Unit is vacant and undergoing turn preparation

```
Occupied ←→ In Progress → Ready → Occupied
```

### Turn Status Values

- **"Not Started"**: Turn has been created but work has not begun
- **"In Progress"**: Turn is actively being worked on
- **"Blocked"**: Turn is delayed (see `blockageReason`)
- **"Completed"**: Turn has been finished; `actualCompletionDate` is set

Typical workflow:
```
Not Started → In Progress ⟷ Blocked → Completed
```

### Vendor Categories

Standard service categories for vendors:

- `"Carpet"` - Flooring, carpet cleaning
- `"HVAC"` - Heating, ventilation, air conditioning
- `"Paint"` - Interior/exterior painting
- `"Plumbing"` - Plumbing repairs and maintenance
- `"Electrical"` - Electrical work
- `"Appliance"` - Appliance repair and installation

### User Roles

- **"Technician"**: Field maintenance worker, completes turns
- **"Manager"**: Oversees operations, creates turns, approves completions
- **"Admin"**: Full system access, user management
- **"Vendor"**: Third-party service provider with limited access

### Event Types

- **"Vendor Visit"**: Service provider scheduled to visit unit
- **"Inspection"**: Quality inspection or walkthrough
- **"Move-in"**: Tenant move-in scheduled
- **"Move-out"**: Tenant move-out or vacancy
- **"Maintenance"**: Routine maintenance task
- **"Meeting"**: Team meeting or coordination event

### Event Status Values

- **"Scheduled"**: Event is confirmed and upcoming
- **"In Progress"**: Event is currently occurring
- **"Completed"**: Event has been finished
- **"Cancelled"**: Event has been cancelled
- **"Rescheduled"**: Event has been rescheduled to different time

### Action Types

Format: `[entity].[action]`

Common action types:

- **"task.completed"**: A task in a turn was marked complete
- **"task.started"**: A task was started
- **"task.skipped"**: A task was skipped
- **"turn.created"**: A new turn was created
- **"turn.completed"**: A turn was marked complete
- **"turn.blocked"**: A turn was blocked/delayed
- **"turn.unblocked"**: A turn blockage was removed
- **"vendor.scheduled"**: A vendor service was scheduled
- **"vendor.completed"**: A vendor service was completed
- **"unit.status.changed"**: Unit status was updated
- **"event.created"**: Calendar event was created
- **"event.cancelled"**: Calendar event was cancelled
- **"event.rescheduled"**: Calendar event was rescheduled

### Entity Types

Types of entities that can be affected by actions:

- **"turn"**: A turn operation
- **"unit"**: A unit/apartment
- **"vendor"**: A vendor service
- **"calendar"**: A calendar event
- **"user"**: A user account
- **"task"**: A task within a turn

### Priority Levels

- **"Low"**: Non-urgent
- **"Normal"**: Standard priority (default)
- **"High"**: Urgent, should be prioritized
- **"Critical"**: Highest priority, immediate action needed

---

## Business Rules

### Vacancy Rate Calculation

**Vacancy Rate** = (Number of Vacant Units / Total Units) × 100%

**Vacant** units are those where:
- `isVacant` = true
- `status` = "Ready" OR "In Progress"

The system tracks this with:
- `daysVacant`: Number of days since `vacantSince` timestamp
- `vacantSince`: Timestamp when unit became vacant

Example calculation:
```
Total Units: 120
Occupied: 110
Vacant: 10
Vacancy Rate: (10 / 120) × 100% = 8.33%
```

### Turn Workflow States

A turn progresses through these phases:

1. **Creation**: Turn document created, status = "Not Started"
   - Unit status changed to "In Progress"
   - Technician assigned
   - Checklist initialized

2. **Execution**: Technician works through checklist
   - Individual tasks marked complete
   - Activities logged for each completion
   - Status may change to "Blocked" if obstacles encountered

3. **Completion**:
   - All required tasks completed
   - Status changed to "Completed"
   - `actualCompletionDate` set
   - Unit status changed to "Ready"
   - Optional: Schedule move-in event

4. **Blocking/Unblocking**:
   - `blockageReason` explains delay
   - Can be cleared when obstacle is resolved
   - Returns to "In Progress"

**Expected Duration**: 5 days (per `targetCompletionDate`)

### Task Completion Logic

Each task in the checklist has:

```javascript
{
  completed: Boolean,        // Whether task is done
  completedBy: String,       // User UID who completed it
  completedByName: String,   // User display name
  completedAt: Timestamp,    // When it was completed
  required: Boolean,         // Whether task is mandatory
  order: Number              // Sequence in workflow
}
```

**Completion Requirements**:
- For required tasks: ALL must be completed for turn to be marked complete
- For optional tasks: Not required for turn completion, but logged if done
- Each completion generates an Activity log entry

**Completion Percentage** = (Completed Tasks / Total Tasks) × 100%

### Derived and Calculated Fields

Some fields are calculated rather than stored directly:

| Field | Source | Formula |
|-------|--------|---------|
| `daysVacant` | Unit | (Current Date - `vacantSince`) in days |
| `floor` | Unit | First digit(s) of `unitNumber` |
| `totalTurnsCompleted` | User | Count of Turns with `assignedTechnicianId` = user.uid AND status = "Completed" |
| `avgTurnCompletionTime` | User | Average of (`actualCompletionDate` - `startDate`) for completed turns |
| Completion % | Turn | (Count of completed tasks / total tasks) × 100 |

---

## Timestamp Patterns

### Timestamp Fields

Firebase uses `Timestamp` objects that contain both date and time information.

#### Fields Using Timestamps (Firestore)

| Collection | Field | Purpose | Nullable |
|-----------|-------|---------|----------|
| Units | `lastTurnCompletedDate` | When last turn completed | Yes |
| Units | `vacantSince` | When became vacant | Yes |
| Turns | `startDate` | Turn commenced | No |
| Turns | `targetCompletionDate` | Expected completion | No |
| Turns | `actualCompletionDate` | Actual completion | Yes |
| Turns Checklist | `completedAt` | When task completed | Yes |
| Vendors | `lastServiceDate` | Last service provided | No |
| Users | `lastLoginAt` | Last login time | Yes |
| CalendarEvents | `startDateTime` | Event start | No |
| CalendarEvents | `endDateTime` | Event end | No |
| CalendarEvents | `completedAt` | Event completed | Yes |
| Activities | `timestamp` | Action timestamp | No |

### Date/Time Handling Conventions

1. **Timezone Handling**: All timestamps are stored in UTC. Client applications must handle timezone conversion for display.

2. **Timestamp Creation**:
   ```javascript
   // Creating timestamps
   Timestamp.fromDate(new Date()) // Current time
   Timestamp.fromDate(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)) // Past date
   ```

3. **Timestamp Ordering**: Timestamps can be directly compared for chronological ordering in queries.

4. **Partial Dates**: For fields that only need date (not time), store as `Timestamp` at midnight UTC:
   ```javascript
   new Date(year, month, day, 0, 0, 0, 0)
   ```

5. **Server Timestamps**: For audit fields, consider using server timestamps to ensure consistency:
   ```javascript
   serverTimestamp() // Firebase server timestamp
   ```

---

## Array and Object Structures

### Checklist Structure (within Turns)

**Type**: Array of Objects

**Field**: `turns.checklist`

**Typical Length**: 10-15 items

```javascript
{
  taskId: "task-1",                          // Unique ID for this task
  taskName: "Initial Walkthrough",           // Human-readable task name
  category: "Inspection",                    // Task category (see below)
  required: true,                            // Whether task is mandatory
  order: 1,                                  // Sequence number (1-12+)
  completed: true,                           // Whether task is done
  completedBy: "tech-john-123",             // User ID who completed (null if not done)
  completedByName: "John Doe",              // User name who completed (null if not done)
  completedAt: Timestamp(...),              // When completed (null if not done)
  photos: [],                                // Array of photo URLs/references
  notes: "Unit was clean upon arrival"      // Task notes
}
```

**Task Categories**:
- `"Inspection"`: Quality checks and walkthroughs
- `"Cleaning"`: Deep cleaning tasks
- `"Maintenance"`: Repairs and maintenance
- `"Other"`: Miscellaneous tasks (keys, documentation)

**Standard Checklist Items** (in order):
1. Initial Walkthrough (Inspection)
2. Deep Clean - Kitchen (Cleaning)
3. Deep Clean - Bathroom (Cleaning)
4. Deep Clean - Bedrooms (Cleaning)
5. Paint Touch-up (Maintenance)
6. Carpet Cleaning (Cleaning)
7. HVAC Filter Replace (Maintenance)
8. Smoke Detector Test (Inspection)
9. Appliance Check (Inspection)
10. Keys & Access (Other)
11. Final Walkthrough (Inspection)
12. Photos & Documentation (Other)

### Address Object Structure

**Location**: `vendors.address`, `users.address` (if extended)

**Type**: Object or Null

```javascript
{
  street: "123 Business Blvd",
  city: "Austin",
  state: "TX",
  zip: "78701"
}
```

**Validation**:
- All address fields should be non-empty if address is provided
- State should be 2-letter abbreviation (e.g., "TX", "CA")
- Zip should match pattern for country (US zip format)
- Can be null if address is not available

### Notification Settings Object

**Location**: `users.notificationSettings`

**Type**: Object

```javascript
{
  emailNotifications: true,     // Receive email alerts
  pushNotifications: true,      // Receive push notifications
  smsNotifications: false       // Receive SMS messages
}
```

**Default**: All set to true for new users

**Purpose**: User control over notification channels

### Metadata Object (within Activities)

**Location**: `activities.metadata`

**Type**: Object (structure varies by action type)

**Flexible Structure**: Contains additional context for the action

Common metadata examples:

```javascript
// For task.completed actions
{
  taskName: "Deep Clean",
  unitNumber: "204"
}

// For vendor.scheduled actions
{
  vendorName: "CleanPro Services",
  unitNumber: "301"
}

// For turn.created actions
{
  unitNumber: "105",
  technicianName: "Sarah Miller",
  targetCompletionDate: Timestamp(...)
}
```

---

## Sample Data Patterns

### Typical Unit Document Flow

**Initial State** (Occupied):
```json
{
  "unitNumber": "204",
  "status": "Occupied",
  "isVacant": false,
  "currentTurnId": null,
  "lastTurnCompletedDate": Timestamp(2025-09-01),
  "vacantSince": null,
  "daysVacant": 0
}
```

**After Vacancy Detected**:
```json
{
  "unitNumber": "204",
  "status": "In Progress",
  "isVacant": true,
  "currentTurnId": "turn_abc123",
  "lastTurnCompletedDate": Timestamp(2025-09-01),
  "vacantSince": Timestamp(2025-11-05),
  "daysVacant": 6
}
```

**After Turn Completion**:
```json
{
  "unitNumber": "204",
  "status": "Ready",
  "isVacant": true,
  "currentTurnId": null,
  "lastTurnCompletedDate": Timestamp(2025-11-10),
  "vacantSince": Timestamp(2025-11-05),
  "daysVacant": 6
}
```

### Typical Turn Lifecycle

**Creation**:
```json
{
  "id": "turn_abc123",
  "unitId": "unit_xyz789",
  "unitNumber": "204",
  "status": "Not Started",
  "startDate": Timestamp(2025-11-05),
  "targetCompletionDate": Timestamp(2025-11-10),
  "actualCompletionDate": null,
  "assignedTechnicianId": "tech-john-123",
  "checklist": [
    { "taskId": "task-1", "taskName": "Initial Walkthrough", "completed": false, ... },
    { "taskId": "task-2", "taskName": "Deep Clean - Kitchen", "completed": false, ... }
  ]
}
```

**In Progress** (50% complete):
```json
{
  "status": "In Progress",
  "checklist": [
    { "taskId": "task-1", "taskName": "Initial Walkthrough", "completed": true, "completedAt": Timestamp(...), ... },
    { "taskId": "task-2", "taskName": "Deep Clean - Kitchen", "completed": true, "completedAt": Timestamp(...), ... },
    { "taskId": "task-3", "taskName": "Deep Clean - Bathroom", "completed": true, "completedAt": Timestamp(...), ... },
    { "taskId": "task-4", "taskName": "Deep Clean - Bedrooms", "completed": true, "completedAt": Timestamp(...), ... },
    { "taskId": "task-5", "taskName": "Paint Touch-up", "completed": true, "completedAt": Timestamp(...), ... },
    { "taskId": "task-6", "taskName": "Carpet Cleaning", "completed": false, ... }
  ]
}
```

**Blocked**:
```json
{
  "status": "Blocked",
  "blockageReason": "Waiting for vendor carpet cleaning - rescheduled to Nov 12",
  "checklist": [...] // Partial completion
}
```

**Completed**:
```json
{
  "status": "Completed",
  "actualCompletionDate": Timestamp(2025-11-10 15:30:00),
  "checklist": [
    // All items completed with timestamps
  ]
}
```

### Typical Calendar Event Progression

**Scheduled** (future):
```json
{
  "id": "event_def456",
  "title": "Carpet Cleaning - Unit 204",
  "eventType": "Vendor Visit",
  "startDateTime": Timestamp(2025-11-12 14:00:00),
  "endDateTime": Timestamp(2025-11-12 16:00:00),
  "status": "Scheduled",
  "vendorId": "vendor_xyz789",
  "vendorName": "CleanPro Services",
  "assignedTo": "tech-mike-789",
  "completedAt": null,
  "cancelledReason": null
}
```

**In Progress** (current):
```json
{
  "status": "In Progress",
  "startDateTime": Timestamp(2025-11-11 14:00:00), // Now
  "endDateTime": Timestamp(2025-11-11 16:00:00)
}
```

**Completed**:
```json
{
  "status": "Completed",
  "completedAt": Timestamp(2025-11-11 15:45:00),
  "notes": "Carpet cleaning completed successfully"
}
```

**Cancelled**:
```json
{
  "status": "Cancelled",
  "cancelledReason": "Vendor became unavailable",
  "cancelledAt": Timestamp(2025-11-11 10:00:00)
}
```

### Edge Cases and Special Scenarios

#### Unit with No Previous Turn History
```json
{
  "unitNumber": "515",
  "lastTurnCompletedDate": null,  // New unit or no record
  "status": "Ready"
}
```

#### Vendor with No Recent Service
```json
{
  "vendorName": "Emergency Plumber",
  "lastServiceDate": null,        // Never used
  "totalJobsCompleted": 0,        // New vendor
  "active": true
}
```

#### Turn Blocked Beyond Target Completion
```json
{
  "unitNumber": "204",
  "status": "Blocked",
  "startDate": Timestamp(2025-11-05),
  "targetCompletionDate": Timestamp(2025-11-10),  // Passed
  "blockageReason": "Waiting for HVAC repair parts - on backorder",
  "priority": "High"  // Escalated due to delay
}
```

#### User with No Completions
```json
{
  "uid": "tech-new-001",
  "displayName": "New Technician",
  "totalTurnsCompleted": 0,
  "avgTurnCompletionTime": null,  // Cannot calculate average
  "lastLoginAt": null             // Never logged in
}
```

#### Calendar Event Without Assigned Technician
```json
{
  "title": "Initial Inspection - Unit 301",
  "assignedTo": null,             // Not yet assigned
  "assignedToName": null,
  "status": "Scheduled"
}
```

---

## Implementation Notes

### Firestore Best Practices

1. **Index Strategy**: Composite indexes needed for common queries:
   - `units.status + units.isVacant`
   - `turns.status + turns.startDate`
   - `calendarEvents.eventType + calendarEvents.startDateTime`
   - `activities.userId + activities.timestamp`

2. **Query Performance**: The denormalized fields (`unitNumber`, `vendorName`, etc.) enable efficient queries without requiring joins across collections.

3. **Write Optimization**: Batch writes should be used when updating multiple related documents (e.g., updating denormalized fields).

4. **Subcollections**: Consider using subcollections for:
   - `turns/{turnId}/checklist` - If checklist grows beyond reasonable size
   - `units/{unitId}/history` - Complete history of unit status changes

5. **Document Size**: Ensure documents don't exceed Firestore limits:
   - Maximum document size: 1 MB
   - Maximum array size: Not explicitly limited, but keep reasonable (~100 items)
   - Current documents are well within limits

---

**Document Last Updated**: 2025-11-11
**For questions or updates**: Contact the development team
