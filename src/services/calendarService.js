/**
 * Calendar Service
 * Complete CRUD operations for calendar events and scheduling
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logActivity } from './activityService';

const CALENDAR_COLLECTION = 'calendarEvents';

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new calendar event
 * @param {Object} eventData - Event data
 * @param {string} createdBy - User ID creating the event
 * @returns {Promise<Object>} Created event with ID
 */
export async function createCalendarEvent(eventData, createdBy) {
  try {
    const preparedData = {
      ...eventData,
      createdAt: Timestamp.now(),
      createdBy,
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, CALENDAR_COLLECTION), preparedData);

    // Log activity
    if (eventData.unitNumber) {
      await logActivity({
        userId: createdBy,
        userName: eventData.assignedToName || 'System',
        userRole: 'Admin',
        action: `${eventData.eventType} scheduled for Unit ${eventData.unitNumber}`,
        actionType: 'vendor.scheduled',
        entityType: 'calendar',
        entityId: docRef.id,
        entityName: eventData.title,
        metadata: {
          eventType: eventData.eventType,
          unitNumber: eventData.unitNumber,
          startDateTime: eventData.startDateTime
        },
        timestamp: Timestamp.now()
      });
    }

    return {
      success: true,
      data: { id: docRef.id, ...preparedData }
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get event by ID
 * @param {string} eventId - Event document ID
 * @returns {Promise<Object>} Event data
 */
export async function getEventById(eventId) {
  try {
    const docRef = doc(db, CALENDAR_COLLECTION, eventId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Event not found',
        errorCode: 'not-found'
      };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() }
    };
  } catch (error) {
    console.error('Error getting event:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Get events with optional filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Array of events
 */
export async function getEvents(options = {}) {
  try {
    const {
      status,
      eventType,
      unitId,
      assignedTo,
      startDate,
      endDate,
      limitCount = 100,
      orderByField = 'startDateTime',
      orderDirection = 'asc'
    } = options;

    let q = collection(db, CALENDAR_COLLECTION);
    const constraints = [];

    // Add filters
    if (status) {
      constraints.push(where('status', '==', status));
    }
    if (eventType) {
      constraints.push(where('eventType', '==', eventType));
    }
    if (unitId) {
      constraints.push(where('unitId', '==', unitId));
    }
    if (assignedTo) {
      constraints.push(where('assignedTo', '==', assignedTo));
    }
    if (startDate) {
      constraints.push(where('startDateTime', '>=', startDate));
    }
    if (endDate) {
      constraints.push(where('startDateTime', '<=', endDate));
    }

    // Add ordering and limit
    constraints.push(orderBy(orderByField, orderDirection));
    constraints.push(limit(limitCount));

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    const events = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data: events
    };
  } catch (error) {
    console.error('Error getting events:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

/**
 * Get upcoming events (scheduled events from now onwards)
 * @param {number} daysAhead - Number of days to look ahead
 * @param {number} limitCount - Maximum number of results
 * @returns {Promise<Object>} Array of upcoming events
 */
export async function getUpcomingEvents(daysAhead = 7, limitCount = 20) {
  const now = Timestamp.now();
  const futureDate = Timestamp.fromDate(
    new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
  );

  return getEvents({
    status: 'Scheduled',
    startDate: now,
    endDate: futureDate,
    limitCount,
    orderByField: 'startDateTime',
    orderDirection: 'asc'
  });
}

/**
 * Get events for specific date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Array of events
 */
export async function getEventsByDateRange(startDate, endDate) {
  return getEvents({
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    orderByField: 'startDateTime',
    orderDirection: 'asc',
    limitCount: 500
  });
}

/**
 * Get events for specific unit
 * @param {string} unitId - Unit document ID
 * @returns {Promise<Object>} Array of events
 */
export async function getEventsByUnit(unitId) {
  return getEvents({
    unitId,
    orderByField: 'startDateTime',
    orderDirection: 'desc',
    limitCount: 50
  });
}

/**
 * Get events assigned to user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Array of events
 */
export async function getEventsByUser(userId) {
  return getEvents({
    assignedTo: userId,
    status: 'Scheduled',
    orderByField: 'startDateTime',
    orderDirection: 'asc',
    limitCount: 50
  });
}

/**
 * Get today's events
 * @returns {Promise<Object>} Array of today's events
 */
export async function getTodaysEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getEventsByDateRange(today, tomorrow);
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update calendar event
 * @param {string} eventId - Event document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updateCalendarEvent(eventId, updates) {
  try {
    const docRef = doc(db, CALENDAR_COLLECTION, eventId);

    // Add updated timestamp
    updates.updatedAt = Timestamp.now();

    await updateDoc(docRef, updates);

    return {
      success: true,
      data: { id: eventId, ...updates }
    };
  } catch (error) {
    console.error('Error updating event:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Complete an event
 * @param {string} eventId - Event document ID
 * @returns {Promise<Object>} Update result
 */
export async function completeEvent(eventId) {
  return updateCalendarEvent(eventId, {
    status: 'Completed',
    completedAt: Timestamp.now()
  });
}

/**
 * Cancel an event
 * @param {string} eventId - Event document ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Update result
 */
export async function cancelEvent(eventId, reason) {
  return updateCalendarEvent(eventId, {
    status: 'Cancelled',
    cancelledReason: reason
  });
}

/**
 * Reschedule an event
 * @param {string} eventId - Event document ID
 * @param {Timestamp} newStartDateTime - New start date/time
 * @param {Timestamp} newEndDateTime - New end date/time
 * @returns {Promise<Object>} Update result
 */
export async function rescheduleEvent(eventId, newStartDateTime, newEndDateTime) {
  return updateCalendarEvent(eventId, {
    status: 'Rescheduled',
    startDateTime: newStartDateTime,
    endDateTime: newEndDateTime
  });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a calendar event
 * @param {string} eventId - Event document ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteCalendarEvent(eventId) {
  try {
    const docRef = doc(db, CALENDAR_COLLECTION, eventId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check for scheduling conflicts
 * @param {string} assignedTo - User ID
 * @param {Timestamp} startDateTime - Event start time
 * @param {Timestamp} endDateTime - Event end time
 * @param {string} excludeEventId - Event ID to exclude from conflict check
 * @returns {Promise<Object>} Conflict check result
 */
export async function checkSchedulingConflict(
  assignedTo,
  startDateTime,
  endDateTime,
  excludeEventId = null
) {
  try {
    const eventsResult = await getEvents({
      assignedTo,
      status: 'Scheduled',
      startDate: startDateTime,
      limitCount: 100
    });

    if (!eventsResult.success) {
      return eventsResult;
    }

    const conflicts = eventsResult.data.filter((event) => {
      // Exclude the event being updated
      if (excludeEventId && event.id === excludeEventId) {
        return false;
      }

      const eventStart = event.startDateTime.toDate();
      const eventEnd = event.endDateTime.toDate();
      const newStart = startDateTime.toDate();
      const newEnd = endDateTime.toDate();

      // Check for overlap
      return (
        (newStart >= eventStart && newStart < eventEnd) ||
        (newEnd > eventStart && newEnd <= eventEnd) ||
        (newStart <= eventStart && newEnd >= eventEnd)
      );
    });

    return {
      success: true,
      data: {
        hasConflict: conflicts.length > 0,
        conflicts
      }
    };
  } catch (error) {
    console.error('Error checking scheduling conflict:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Get event counts by type
 * @param {Date} startDate - Start date for counting
 * @param {Date} endDate - End date for counting
 * @returns {Promise<Object>} Event counts by type
 */
export async function getEventStatistics(startDate, endDate) {
  try {
    const eventsResult = await getEventsByDateRange(startDate, endDate);

    if (!eventsResult.success) {
      return eventsResult;
    }

    const events = eventsResult.data;
    const stats = {
      total: events.length,
      byType: {},
      byStatus: {},
      scheduled: 0,
      completed: 0,
      cancelled: 0
    };

    events.forEach((event) => {
      // Count by type
      stats.byType[event.eventType] = (stats.byType[event.eventType] || 0) + 1;

      // Count by status
      stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;

      // Quick access counts
      if (event.status === 'Scheduled') stats.scheduled++;
      if (event.status === 'Completed') stats.completed++;
      if (event.status === 'Cancelled') stats.cancelled++;
    });

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error getting event statistics:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  createCalendarEvent,
  getEventById,
  getEvents,
  getUpcomingEvents,
  getEventsByDateRange,
  getEventsByUnit,
  getEventsByUser,
  getTodaysEvents,
  updateCalendarEvent,
  completeEvent,
  cancelEvent,
  rescheduleEvent,
  deleteCalendarEvent,
  checkSchedulingConflict,
  getEventStatistics
};
