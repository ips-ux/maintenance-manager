/**
 * Activity Service
 * System-wide activity logging for dashboard feed and audit trail
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const ACTIVITY_COLLECTION = 'activities';

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Log an activity
 * @param {Object} activityData - Activity data
 * @returns {Promise<Object>} Created activity with ID
 */
export async function logActivity(activityData) {
  try {
    const preparedData = {
      ...activityData,
      timestamp: activityData.timestamp || Timestamp.now()
    };

    const docRef = await addDoc(collection(db, ACTIVITY_COLLECTION), preparedData);

    return {
      success: true,
      data: { id: docRef.id, ...preparedData }
    };
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't fail operations if activity logging fails
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
 * Get activity by ID
 * @param {string} activityId - Activity document ID
 * @returns {Promise<Object>} Activity data
 */
export async function getActivityById(activityId) {
  try {
    const docRef = doc(db, ACTIVITY_COLLECTION, activityId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Activity not found',
        errorCode: 'not-found'
      };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() }
    };
  } catch (error) {
    console.error('Error getting activity:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Get recent activities
 * @param {number} limitCount - Maximum number of results
 * @returns {Promise<Object>} Array of recent activities
 */
export async function getRecentActivities(limitCount = 20) {
  try {
    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const activities = [];

    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data: activities
    };
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

/**
 * Get activities with filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Array of activities
 */
export async function getActivities(options = {}) {
  try {
    const {
      userId,
      entityType,
      entityId,
      actionType,
      limitCount = 50
    } = options;

    let q = collection(db, ACTIVITY_COLLECTION);
    const constraints = [];

    // Add filters
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    if (entityType) {
      constraints.push(where('entityType', '==', entityType));
    }
    if (entityId) {
      constraints.push(where('entityId', '==', entityId));
    }
    if (actionType) {
      constraints.push(where('actionType', '==', actionType));
    }

    // Add ordering and limit
    constraints.push(orderBy('timestamp', 'desc'));
    constraints.push(limit(limitCount));

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data: activities
    };
  } catch (error) {
    console.error('Error getting activities:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

/**
 * Get activities for specific entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @returns {Promise<Object>} Array of activities
 */
export async function getActivitiesByEntity(entityType, entityId) {
  return getActivities({
    entityType,
    entityId,
    limitCount: 100
  });
}

/**
 * Get activities by user
 * @param {string} userId - User ID
 * @param {number} limitCount - Maximum number of results
 * @returns {Promise<Object>} Array of activities
 */
export async function getActivitiesByUser(userId, limitCount = 50) {
  return getActivities({
    userId,
    limitCount
  });
}

/**
 * Get activities by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Array of activities
 */
export async function getActivitiesByDateRange(startDate, endDate) {
  try {
    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc'),
      limit(500)
    );

    const querySnapshot = await getDocs(q);
    const activities = [];

    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data: activities
    };
  } catch (error) {
    console.error('Error getting activities by date range:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete an activity
 * @param {string} activityId - Activity document ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteActivity(activityId) {
  try {
    const docRef = doc(db, ACTIVITY_COLLECTION, activityId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting activity:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Delete old activities (for maintenance)
 * @param {number} daysToKeep - Number of days of activity to keep
 * @returns {Promise<Object>} Delete result
 */
export async function deleteOldActivities(daysToKeep = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      where('timestamp', '<', Timestamp.fromDate(cutoffDate)),
      limit(500)
    );

    const querySnapshot = await getDocs(q);
    let deleteCount = 0;

    // Delete in batches
    for (const docSnapshot of querySnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      deleteCount++;
    }

    return {
      success: true,
      data: {
        deletedCount: deleteCount,
        cutoffDate: cutoffDate.toISOString()
      }
    };
  } catch (error) {
    console.error('Error deleting old activities:', error);
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
 * Get activity statistics
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics
 * @returns {Promise<Object>} Activity statistics
 */
export async function getActivityStatistics(startDate, endDate) {
  try {
    const activitiesResult = await getActivitiesByDateRange(startDate, endDate);

    if (!activitiesResult.success) {
      return activitiesResult;
    }

    const activities = activitiesResult.data;
    const stats = {
      total: activities.length,
      byActionType: {},
      byEntityType: {},
      byUser: {},
      topUsers: []
    };

    // Count by action type
    activities.forEach((activity) => {
      stats.byActionType[activity.actionType] = (stats.byActionType[activity.actionType] || 0) + 1;
      stats.byEntityType[activity.entityType] = (stats.byEntityType[activity.entityType] || 0) + 1;
      stats.byUser[activity.userId] = (stats.byUser[activity.userId] || 0) + 1;
    });

    // Get top users
    stats.topUsers = Object.entries(stats.byUser)
      .map(([userId, count]) => {
        const userActivity = activities.find(a => a.userId === userId);
        return {
          userId,
          userName: userActivity?.userName || 'Unknown',
          activityCount: count
        };
      })
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 10);

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error getting activity statistics:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Format activity for display
 * @param {Object} activity - Activity object
 * @returns {Object} Formatted activity
 */
export function formatActivityForDisplay(activity) {
  const timestamp = activity.timestamp.toDate();
  const now = new Date();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let timeAgo;
  if (diffMins < 1) {
    timeAgo = 'Just now';
  } else if (diffMins < 60) {
    timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = timestamp.toLocaleDateString();
  }

  return {
    ...activity,
    timeAgo,
    formattedDate: timestamp.toLocaleString()
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  logActivity,
  getActivityById,
  getRecentActivities,
  getActivities,
  getActivitiesByEntity,
  getActivitiesByUser,
  getActivitiesByDateRange,
  deleteActivity,
  deleteOldActivities,
  getActivityStatistics,
  formatActivityForDisplay
};
