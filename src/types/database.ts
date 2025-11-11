/**
 * Firebase Database Type Definitions
 * IPS-UX Maintenance Manager
 *
 * Complete TypeScript interfaces for all Firestore collections
 * and document structures. Use these types for type-safe database operations.
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export type UnitStatus = 'Ready' | 'In Progress' | 'Blocked' | 'Occupied';

export type TurnStatus = 'In Progress' | 'Completed' | 'Blocked' | 'Cancelled';

export type TurnPriority = 'Normal' | 'High' | 'Urgent';

export type TaskCategory = 'Cleaning' | 'Maintenance' | 'Inspection' | 'Other';

export type EventType = 'Vendor Visit' | 'Inspection' | 'Move-in' | 'Other';

export type EventStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';

export type UserRole = 'Admin' | 'Technician' | 'Viewer' | 'Manager';

export type VendorCategory = 'Carpet' | 'HVAC' | 'Plumbing' | 'Electrical' | 'Paint' | 'Appliance' | 'General' | 'Landscaping';

export type ActivityActionType =
  | 'turn.created'
  | 'turn.completed'
  | 'turn.blocked'
  | 'task.completed'
  | 'vendor.scheduled'
  | 'unit.status_changed'
  | 'note.added'
  | 'photo.uploaded';

export type EntityType = 'turn' | 'unit' | 'calendar' | 'vendor' | 'user';

// ============================================================================
// UNITS COLLECTION
// ============================================================================

export interface Unit {
  // Document ID is managed by Firestore
  id?: string;

  // Core Unit Information
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  floor?: number;
  building?: string;

  // Status Tracking
  status: UnitStatus;
  currentTurnId: string | null;
  lastTurnCompletedDate: Timestamp | null;

  // Vacancy Tracking
  isVacant: boolean;
  vacantSince: Timestamp | null;
  daysVacant: number;

  // Additional Metadata
  notes?: string;
  amenities?: string[];

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// For creating new units (before Firestore adds timestamps)
export type CreateUnitInput = Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>;

// For updating units (partial fields)
export type UpdateUnitInput = Partial<Omit<Unit, 'id' | 'createdAt'>>;

// ============================================================================
// TURNS COLLECTION
// ============================================================================

export interface ChecklistTask {
  taskId: string;
  taskName: string;
  category: TaskCategory;
  required: boolean;
  order: number;
  completed: boolean;
  completedBy: string | null;
  completedByName: string | null;
  completedAt: Timestamp | null;
  photos: string[]; // Firebase Storage paths
  notes?: string;
}

export interface Turn {
  // Document ID is managed by Firestore
  id?: string;

  // Unit Reference
  unitId: string;
  unitNumber: string;

  // Status and Timeline
  status: TurnStatus;
  startDate: Timestamp;
  targetCompletionDate: Timestamp;
  actualCompletionDate: Timestamp | null;
  daysInProgress: number;
  daysOverdue: number;

  // Assignment
  assignedTechnicianId: string;
  assignedTechnicianName: string;

  // Checklist System
  checklist: ChecklistTask[];

  // Summary Statistics
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;

  // Additional Information
  notes?: string;
  blockageReason?: string | null;
  priority: TurnPriority;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateTurnInput = Omit<Turn, 'id' | 'createdAt' | 'updatedAt' | 'daysInProgress' | 'daysOverdue' | 'totalTasks' | 'completedTasks' | 'progressPercentage'>;

export type UpdateTurnInput = Partial<Omit<Turn, 'id' | 'createdAt'>>;

// Subcollection: Turn Activities
export interface TurnActivity {
  id?: string;
  userId: string;
  userName: string;
  action: string;
  actionType: ActivityActionType;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
}

// ============================================================================
// CALENDAR COLLECTION
// ============================================================================

export interface CalendarEvent {
  // Document ID is managed by Firestore
  id?: string;

  // Event Details
  title: string;
  description?: string;
  eventType: EventType;

  // Scheduling
  startDateTime: Timestamp;
  endDateTime: Timestamp;
  allDay: boolean;

  // References
  unitId: string | null;
  unitNumber: string | null;
  turnId: string | null;
  vendorId: string | null;
  vendorName: string | null;

  // Assignment
  assignedTo: string | null;
  assignedToName: string | null;

  // Status
  status: EventStatus;
  completedAt: Timestamp | null;
  cancelledReason: string | null;

  // Additional Information
  notes?: string;
  reminderSent: boolean;

  // Timestamps
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
}

export type CreateCalendarEventInput = Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateCalendarEventInput = Partial<Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>>;

// ============================================================================
// VENDORS COLLECTION
// ============================================================================

export interface VendorAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Vendor {
  // Document ID is managed by Firestore
  id?: string;

  // Basic Information
  vendorName: string;
  category: VendorCategory;

  // Contact Information
  contactName: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  website?: string;

  // Address
  address: VendorAddress | null;

  // Business Details
  servicesOffered: string[];
  licensedInsured: boolean;
  preferredVendor: boolean;

  // Performance Tracking
  rating?: number; // 1-5
  lastServiceDate: Timestamp | null;
  totalJobsCompleted: number;

  // Additional Information
  notes?: string;
  active: boolean;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateVendorInput = Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateVendorInput = Partial<Omit<Vendor, 'id' | 'createdAt'>>;

// ============================================================================
// USERS COLLECTION
// ============================================================================

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export interface User {
  // Document ID must match Firebase Auth UID
  id?: string;

  // Basic Information
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;

  // Role and Permissions
  role: UserRole;
  permissions: string[];

  // Status
  active: boolean;
  emailVerified: boolean;

  // Profile Information
  photoURL: string | null;
  bio?: string;

  // Work Information (for technicians)
  specialties?: string[];
  certifications?: string[];

  // Activity Tracking
  lastLoginAt: Timestamp | null;
  totalTurnsCompleted: number;
  avgTurnCompletionTime: number;

  // Preferences
  notificationSettings: NotificationSettings;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateUserInput = Partial<Omit<User, 'id' | 'uid' | 'createdAt'>>;

// ============================================================================
// ACTIVITY COLLECTION
// ============================================================================

export interface Activity {
  // Document ID is managed by Firestore
  id?: string;

  // User Information
  userId: string;
  userName: string;
  userRole: UserRole;

  // Action Details
  action: string;
  actionType: ActivityActionType;

  // Entity References
  entityType: EntityType;
  entityId: string;
  entityName: string;

  // Additional Context
  metadata?: Record<string, any>;

  // Timestamp
  timestamp: Timestamp;

  // Display Helpers
  icon?: string;
  color?: string;
}

export type CreateActivityInput = Omit<Activity, 'id'>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

// For paginated queries
export interface PaginatedResult<T> {
  data: T[];
  lastDoc: any; // DocumentSnapshot
  hasMore: boolean;
}

// For query filters
export interface QueryFilter {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any';
  value: any;
}

// For sorting
export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
}

// Standard query options
export interface QueryOptions {
  filters?: QueryFilter[];
  sorts?: QuerySort[];
  limit?: number;
  startAfter?: any;
}

// Standard service response
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

// Batch operation result
export interface BatchOperationResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors?: Array<{ id: string; error: string }>;
}

// ============================================================================
// FIREBASE STORAGE TYPES
// ============================================================================

export interface StorageMetadata {
  contentType: string;
  customMetadata: {
    uploadedBy: string;
    uploadedAt: string;
    entityType: EntityType;
    entityId: string;
    taskId?: string;
  };
}

export interface PhotoUploadResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

// ============================================================================
// COMPUTED FIELD HELPERS
// ============================================================================

/**
 * Helper function to calculate days between two timestamps
 */
export function calculateDaysBetween(startDate: Timestamp, endDate: Timestamp = Timestamp.now()): number {
  const start = startDate.toDate();
  const end = endDate.toDate();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Helper function to calculate turn progress
 */
export function calculateTurnProgress(checklist: ChecklistTask[]): {
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
} {
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter(task => task.completed).length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    totalTasks,
    completedTasks,
    progressPercentage: Math.round(progressPercentage * 100) / 100 // Round to 2 decimals
  };
}

/**
 * Helper function to check if turn is overdue
 */
export function calculateDaysOverdue(targetDate: Timestamp, actualDate: Timestamp | null = null): number {
  const compareDate = actualDate || Timestamp.now();
  const target = targetDate.toDate();
  const compare = compareDate.toDate();

  if (compare <= target) {
    return 0;
  }

  const diffTime = compare.getTime() - target.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Type guards can be added here if needed
};
