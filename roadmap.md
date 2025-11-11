---
title: Maintenance Manager - Product Roadmap
version: 2025-11-11
lastUpdated: 2025-11-11
status: Active Development
---

## Project Vision

A comprehensive turn management application that streamlines the apartment make-ready process from key return through move-in readiness. The system eliminates manual tracking, streamlines vendor scheduling & supplier orders, improves turn times, elevates organization, and provides complete visibility into maintenance operations without requiring CRM integration.

**Repository**: https://github.com/your-org/maintenance-manager
**Firebase Project**: https://console.firebase.google.com/u/0/project/maintenance-manager-ae292/

---

## Phase Overview

**Current Phase**: V1.0 Core Foundation
**Target Completion**: Q1 2026
**Overall V1 Progress**: 35%

---

## Completed Features

### 1. Authentication & Access Control (100% Complete)

**Status**: Implemented
**Completion Date**: 2025-11-10
**Evidence**: `src/features/auth/`, `src/features/auth/AuthProvider.jsx`, `src/features/auth/AuthContext.js`

- Firebase authentication implementation
- Protected routes (login required)
- User session management
- Logout functionality
- Foundation for future role-based permissions

**Key Files**:
- `src/features/auth/AuthProvider.jsx` - Authentication context provider
- `src/features/auth/AuthContext.js` - Auth context definition

---

### 2. Navigation & Layout (100% Complete)

**Status**: Implemented
**Completion Date**: 2025-11-10
**Evidence**: `src/components/Header.jsx`, responsive design implementation

- Responsive header with mobile/tablet/desktop breakpoints
- Professional navigation menu with workflow hierarchy:
  - Dashboard | Calendar | Turns | Orders (main workflow)
  - Units | Vendors (list views - separated)
- User controls (username, notifications bell placeholder, logout, settings)
- Hamburger menu for mobile/tablet (below 1120px)
- Sticky header design

---

### 3. Dashboard (100% Complete)

**Status**: Implemented
**Completion Date**: 2025-11-11
**Evidence**: `src/pages/Dashboard.jsx` (180 lines of functionality)

**Components Implemented**:
- Quick Actions buttons:
  - Key Return
  - Schedule Vendor
  - Create Order
  - Make Ready (with live count)

- Statistics overview (4 metric cards with trend indicators):
  - Total Units
  - Vacant Units
  - Turns in Progress
  - Average Turn Time (with calculated trends)

- Active Turns progress tracker (visual cards showing):
  - Unit details and bedroom/bathroom count
  - Progress bars (completed tasks / total tasks)
  - Status badges (On Track, Ready, Delayed)
  - Assigned technician
  - Days in progress

- Vacant Units quick list with actionable "Start Turn" buttons
- Turn Performance Chart (30-day trend line graph using Recharts)
- Schedule Preview (This Week's upcoming events)
- Recent Activity Feed (team action log with timestamps)
- Professional industry-grade layout and design

**Key Files**:
- `src/pages/Dashboard.jsx` - Main dashboard component with data fetching

---

### 4. Settings Page (100% Complete)

**Status**: Implemented
**Completion Date**: 2025-11-10
**Evidence**: `src/pages/Settings.jsx` with comprehensive structure

- WordPress-style two-column layout
- Sidebar navigation (desktop) / Dropdown selector (mobile)
- Seven settings sections with placeholders:
  - Profile
  - Notifications
  - Account & Security
  - Unit Settings (Admin)
  - Vendor Settings (Admin)
  - Product Settings (Admin)
  - IPS Settings (Admin)
- Admin badges on appropriate sections
- Responsive design with mobile dropdown
- "Under Construction" notices with planned features

---

### 5. Design System (100% Complete)

**Status**: Implemented
**Completion Date**: 2025-11-10
**Evidence**: `src/styles/`, `src/components/ui/`, Tailwind + shadcn/ui integration

- Professional IPS-UX aesthetic (whites/grays, minimal color)
- Tailwind CSS + shadcn/ui components
- Custom responsive breakpoints (1120px for full nav, 768px for mobile)
- Consistent spacing and typography
- Bottom padding on pages to prevent viewport cutoff
- Custom button variants (`src/components/ui/buttonVariants.js`)

**Key Files**:
- `src/index.css` - Global styles
- `src/components/ui/button.jsx` - Button component
- `src/components/ui/card.jsx` - Card component
- `src/components/ui/buttonVariants.js` - Button variant system

---

### 6. Infrastructure & Foundation (100% Complete)

**Status**: Implemented
**Completion Date**: 2025-11-10
**Evidence**: `vite.config.js`, Firebase integration, build system

- React + Vite build system
- Firebase integration (Firestore, Authentication)
- GitHub Pages deployment ready (for inspection module)
- Component architecture with reusable UI elements
- Development environment with hot module reloading

**Key Files**:
- `vite.config.js` - Build configuration
- `src/lib/firebase.js` - Firebase initialization
- `src/App.jsx` - Main application component

---

### 7. Database Schema & Data Services (100% Complete)

**Status**: Implemented
**Completion Date**: 2025-11-11
**Evidence**: Complete service layer with CRUD operations

**Implemented Services**:

#### Turns Service (`src/services/turnsService.js`)
- Create turn with automatic progress calculation
- Get turn by ID
- Get all turns with filtering (status, technician, limit)
- Get active turns (In Progress status)
- Get turns by unit or technician
- Update turn with recalculated progress
- Update individual tasks in checklist
- Complete turn workflow (status transition + unit updates + activity logging)
- Block turn with reason tracking
- Delete turn with cleanup
- Batch progress recalculation for all active turns
- Full activity logging integration

#### Units Service (`src/services/unitsService.js`)
- Create unit with complete metadata (bedrooms, bathrooms, sqft, floor)
- Get unit statistics (total units, vacant count, average days vacant)
- Get vacant units list
- Get all units with filtering and sorting
- Update unit information
- Track unit status and turn associations
- Unit search and filtering capabilities

#### Calendar Service (`src/services/calendarService.js`)
- Create calendar events with type and color coding
- Get upcoming events with date filtering
- Get events by date range
- Update event information
- Delete events
- Support for recurring events

#### Vendors Service (`src/services/vendorsService.js`)
- Create vendor with categories and contact info
- Get vendor information
- Get vendors by category
- Update vendor details
- Track vendor performance metrics

#### Users Service (`src/services/usersService.js`)
- Create user profile with role assignment
- Get user information
- Update user details
- Role-based access tracking

#### Activity Service (`src/services/activityService.js`)
- Log activities with detailed metadata
- Track user actions and entity changes
- Format activities for display with timestamps
- Support for turn creation, task completion, turn blocking, etc.

#### Database Seeder (`src/utils/seedDatabase.js`)
- Generate 120 realistic test units with varied configurations
- Create sample turns with proper checklist structure
- Generate calendar events and vendor data
- Create user profiles for testing
- Populate activity logs with realistic actions
- 8% vacancy rate simulation
- Varied unit types (Studios, 1BR/1BA, 2BR/1BA, 2BR/2BA, 3BR/2BA)

**Key Files**:
- `src/services/turnsService.js` - Turn CRUD and workflow (619 lines)
- `src/services/unitsService.js` - Unit management
- `src/services/calendarService.js` - Calendar events
- `src/services/vendorsService.js` - Vendor management
- `src/services/usersService.js` - User profiles
- `src/services/activityService.js` - Activity logging
- `src/utils/seedDatabase.js` - Database initialization with test data

---

## Features In Progress / Not Started

### Critical Path - Must Complete for V1

#### 1. TURNS Module UI Implementation

**Priority**: HIGH (Critical Path)
**Status**: 15% Complete - Backend infrastructure ready, UI needed
**Target Completion**: 2025-11-25

**Completed**:
- Backend service layer with full CRUD operations
- Data structure in Firestore
- Progress calculation engine
- Task checklist system
- Status workflow management
- Activity logging

**Remaining**:
- Turns list view page with filtering and sorting
- Turn details page with task checklist UI
- Task completion workflow UI
- Photo upload integration
- Technician assignment interface
- Status update controls
- Turn timeline/history visualization

**Blockers**: None currently

---

#### 2. CALENDAR Module

**Priority**: HIGH (Critical Path)
**Status**: 10% Complete - Placeholder exists, service partially implemented
**Target Completion**: 2025-12-09

**Completed**:
- Calendar service layer (CRUD operations)
- Placeholder page navigation
- Event data structure design

**Remaining**:
- Calendar view component (day/week/month modes)
- Event creation modal/form
- Event types and color coding UI
- Recurring event support
- Conflict detection logic
- Integration with Turns workflow (auto-schedule inspections)
- Mobile-responsive calendar interface

**Dependencies**: Turns module (for integration)

---

#### 3. UNITS Module

**Priority**: MEDIUM (Critical Path)
**Status**: 10% Complete - Service layer ready, UI needed
**Target Completion**: 2025-12-23

**Completed**:
- Units service layer (CRUD + statistics)
- Database schema and data
- Vacant units calculation
- Statistics queries

**Remaining**:
- Unit list view page (sortable/filterable)
- Unit details page (BR/BA, square footage, etc.)
- Turn status at-a-glance visualization
- Quick actions per unit (Start Turn, View Details)
- Unit search functionality
- Status filters (Ready, In Progress, Blocked, Occupied)
- Bulk actions support

**Dependencies**: Turns module completion

---

#### 4. ORDERS Module

**Priority**: MEDIUM
**Status**: 5% Complete - Placeholder only
**Target Completion**: 2026-01-20

**Remaining**:
- Supplier configuration (admin settings integration)
- Product catalog per supplier
- Shopping cart functionality
- "Quick Buy" presets for common items
- Cart export to supplier website
- Order history tracking
- Integration with supplier websites (URL generation with cart params)

**Dependencies**: Settings module (supplier configuration)

---

#### 5. VENDORS Module

**Priority**: MEDIUM
**Status**: 10% Complete - Service layer ready, UI needed
**Target Completion**: 2026-01-06

**Completed**:
- Vendors service layer (CRUD operations)
- Database schema
- Category support

**Remaining**:
- Vendor list view with contact information
- Vendor categories display
- Quick dial/email functionality
- Vendor notes and preferences UI
- Vendor performance tracking visualization
- Schedule history per vendor

**Dependencies**: Calendar module completion

---

#### 6. Inspection Tool Integration

**Priority**: HIGH (for Turns Module)
**Status**: Not Started
**Target Completion**: 2025-12-09

**Description**: Embed existing unit inspection checklist as module within Turns workflow

**Required Work**:
- Analyze existing inspection tool at `Z:\Documents\AI Coding\Maintenance_Manager_Gemini\unit-inspection`
- Extract checklist components
- Integrate photo capture and storage
- Connect checklist data with turn workflow
- Map inspection results to turn completion status

---

### Supporting Features

#### Role-Based Permissions System

**Priority**: HIGH
**Status**: Foundation implemented
**Target Completion**: 2026-02-03

**Work Required**:
- Define role hierarchy (Admin, Supervisor, Technician, Leasing)
- Implement permission checks in services
- Restrict UI elements based on user role
- Activity log role-based filtering

---

#### Reporting & Analytics

**Priority**: MEDIUM
**Status**: Not Started
**Target Completion**: 2026-02-17

**Planned Features**:
- Turn time analytics
- Technician productivity reports
- Vendor performance metrics
- Unit vacancy trends
- Monthly completion reports

---

### 8. Developer Tools & Database Management (100% Complete)

**Status**: Implemented
**Completion Date**: 2025-11-11
**Evidence**: `src/utils/testFirebaseConnection.js`, `src/pages/Settings.jsx` (IPS Settings section)

**Implemented Features**:

#### Firebase Connection Testing
- Real-time connection status verification
- Collection-level data inspection
- Document count reporting
- Error message display for debugging
- Integrated into Settings page UI

#### Database Seeding Interface
- One-click database population with test data
- Progress reporting with detailed metrics
- Success/error state visualization
- Warning system for production environments
- Creates 120 units, vendors, technicians, turns, calendar events, and activities
- Accessible via Settings > IPS Settings > Developer Tools

#### Enhanced Dashboard Debugging
- Comprehensive error logging in Dashboard component
- Service-level error tracking
- Detailed console output for troubleshooting
- Connection testing before data fetch
- Specific error messages for each failed service

**Key Files**:
- `src/utils/testFirebaseConnection.js` - Firebase connectivity testing utility
- `src/pages/Settings.jsx` - Developer Tools UI (IPS Settings section)
- `src/pages/Dashboard.jsx` - Enhanced error logging

**Benefits**:
- Eliminates "Error fetching data" mystery errors
- Provides clear diagnostic information
- Makes it easy to populate database with realistic test data
- Speeds up development and debugging workflow

---

## Technical Debt & Known Issues

### Priority Fixes

1. **Authentication Restoration** - RESOLVED (2025-11-11)
   - Status: Complete
   - Removed development mode bypass from AuthProvider.jsx
   - Restored proper Firebase authentication with onAuthStateChanged
   - Created admin user profile utility (src/utils/createAdminUser.js)
   - User profile: robert.barron@greystar.com (UID: GO4odyiO3OTNmUvAknUl0KkFh563)
   - Updated Firestore security rules to restore authentication checks
   - All collections now require authenticated + active user status
   - AuthProvider now fetches user profile from USERS collection and merges with Firebase Auth data
   - Last login timestamp automatically updated on sign-in
   - Deployed updated security rules to Firebase

2. **Environment Configuration** - RESOLVED (2025-11-11)
   - Status: Complete
   - Firebase security rules updated to allow read access
   - Development mode bypass implemented in AuthProvider (REMOVED - see Authentication Restoration)
   - Connection testing utility added

3. **Collection Name Case Mismatch** - RESOLVED (2025-11-11)
   - Status: Fixed
   - Root Cause: Service files queried lowercase collections ('units', 'turns', etc.) but Firebase has uppercase collections ('UNITS', 'TURNS', etc.)
   - Impact: Dashboard could not fetch existing Firebase data, showing "Error fetching data"
   - Resolution: Updated all service collection constants to uppercase:
     - unitsService.js: 'units' -> 'UNITS'
     - turnsService.js: 'turns' -> 'TURNS'
     - calendarService.js: 'calendar' -> 'CALENDAR'
     - activityService.js: 'activity' -> 'ACTIVITY'
     - vendorsService.js: 'vendors' -> 'VENDORS'
     - usersService.js: 'users' -> 'USERS'
   - Dashboard now successfully fetches all existing data

4. **Error Handling** - PARTIALLY RESOLVED (2025-11-11)
   - Status: Improved
   - All services return consistent error format (Complete)
   - Dashboard now displays specific error messages (Complete)
   - UI still needs user-friendly error messages in production (Pending)
   - Retry logic needed for failed database operations (Pending)

5. **Performance Optimization**
   - Lazy load dashboard charts for large datasets
   - Implement pagination for unit/turn lists
   - Cache frequently accessed data

---

## Completion Metrics

| Feature Area | Status | Completion | Notes |
|---|---|---|---|
| Authentication | Complete | 100% | Fully implemented with session management |
| Navigation/Layout | Complete | 100% | Responsive design with mobile support |
| Dashboard | Complete | 100% | All planned widgets and visualizations |
| Settings Framework | Complete | 100% | Placeholder structure ready + Developer Tools |
| Design System | Complete | 100% | Tailwind + shadcn/ui integrated |
| Infrastructure | Complete | 100% | Firebase, Vite, React configured |
| Database Schema | Complete | 100% | All services with CRUD operations |
| Developer Tools | Complete | 100% | Connection testing + database seeding |
| Turns Module UI | In Progress | 15% | Backend ready, UI implementation needed |
| Calendar Module | In Progress | 10% | Service partially done, UI needed |
| Units Module | In Progress | 10% | Service ready, UI implementation needed |
| Vendors Module | In Progress | 10% | Service ready, UI implementation needed |
| Orders Module | Not Started | 5% | Placeholder only |
| Inspection Integration | Not Started | 0% | Pending analysis of existing tool |
| Role-Based Permissions | In Progress | 20% | Foundation in place, rules needed |

**Overall V1.0 Progress: 37%** (updated from 35% with Developer Tools completion)

---

## Recommended Next Steps (Priority Order)

### Immediate (Next 1-2 weeks)

1. **Build Turns Module UI** - CRITICAL
   - Create turns list page with filtering
   - Create turn details page with checklist
   - Implement task completion workflow
   - Connect to backend service (ready to use)
   - **Estimated Effort**: 3-4 days
   - **Blocks**: Calendar module, Units module

2. **Analyze & Plan Inspection Tool Integration**
   - Review existing inspection module structure
   - Design integration points with Turns workflow
   - Plan photo storage and retrieval
   - **Estimated Effort**: 1 day

### Short-term (2-3 weeks)

3. **Build Calendar Module**
   - Implement calendar component (day/week/month)
   - Create event management UI
   - Add recurring event support
   - **Estimated Effort**: 3-4 days
   - **Depends on**: Turns Module completion

4. **Build Units Module UI**
   - Create unit list view with filtering
   - Create unit details page
   - Add status visualization
   - **Estimated Effort**: 2-3 days
   - **Depends on**: Turns Module completion

### Medium-term (1 month)

5. **Integrate Inspection Tool**
   - Embed inspection checklist in Turns workflow
   - Implement photo upload/storage
   - Connect to turn completion tracking
   - **Estimated Effort**: 2-3 days

6. **Build Vendors Module UI**
   - Create vendor directory
   - Add vendor performance tracking
   - Implement scheduling history
   - **Estimated Effort**: 2 days

7. **Complete Role-Based Permissions**
   - Implement permission checks in all modules
   - Add role-based UI filtering
   - Add admin controls
   - **Estimated Effort**: 2-3 days

### Long-term (2 months+)

8. **Build Orders Module**
   - Supplier configuration interface
   - Shopping cart implementation
   - Supplier website integration
   - **Estimated Effort**: 3-4 days

9. **Implement Reporting & Analytics**
   - Dashboard metrics and charts
   - Export functionality
   - Historical trend analysis
   - **Estimated Effort**: 3-4 days

---

## Git Information

**Current Branch**: master
**Last Commit**: ecccb66 - Initial commit
**Modified Files** (Current Session):
- roadmap.md
- src/components/ui/button.jsx
- src/features/auth/AuthProvider.jsx (restored Firebase authentication, removed dev mode bypass)
- src/features/auth/AuthContext.js
- src/pages/Dashboard.jsx (enhanced error logging)
- src/pages/Settings.jsx (added Developer Tools section)
- src/services/turnsService.js
- src/services/unitsService.js
- src/utils/seedDatabase.js
- vite.config.js
- firestore.rules (restored authentication checks, updated to UPPERCASE collection names)

**New Files** (Current Session):
- src/components/ui/buttonVariants.js
- src/hooks/ (directory with utilities)
- src/utils/testFirebaseConnection.js (Firebase connectivity testing)
- src/utils/createAdminUser.js (Admin user profile creation utility)

---

## Review Notes

**Reviewed By**: Project Documentarian
**Review Date**: 2025-11-11
**Review Method**: Code analysis, git diff, file inspection

**Key Observations**:
- Significant backend infrastructure work completed
- All service layers fully implemented with CRUD operations
- Database schema properly designed with relationships
- UI framework (React + Vite) properly configured
- Authentication system functional and protected
- Dashboard showing integration of multiple services
- Ready to move to UI implementation phase for core workflows

**Recommendations**:
- Prioritize Turns module UI to unblock other modules
- Consider implementing Inspection integration early to validate workflow
- Plan for user testing once Turns module is complete
- Document API contract for service layer before starting module UI work

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 2025-11-11a | 2025-11-11 | Initial comprehensive roadmap with complete service layer analysis, reformatted with template structure, updated metrics from 30% to 35% based on database services implementation |
| 2025-11-11b | 2025-11-11 | Added Developer Tools section (Firebase connection testing, database seeding UI), enhanced Dashboard error logging, updated progress to 37%, resolved environment configuration issues |
| 2025-11-11c | 2025-11-11 | CRITICAL FIX: Resolved collection name case mismatch - all service files now query uppercase collection names (UNITS, TURNS, CALENDAR, ACTIVITY, VENDORS, USERS) matching Firebase schema. Dashboard now successfully fetches existing data. |
| 2025-11-11d | 2025-11-11 | AUTHENTICATION RESTORATION: Removed development mode bypass, restored proper Firebase authentication with onAuthStateChanged, created admin user profile utility for robert.barron@greystar.com, updated Firestore security rules to require authentication, deployed rules to Firebase. All collections now properly secured with authenticated + active user checks. |

---

*This roadmap is maintained as a living document. Updates are made at the end of each development session to reflect progress and changes in the codebase.*
