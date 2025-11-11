/**
 * Users Service
 * User profile management complementing Firebase Authentication
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const USERS_COLLECTION = 'users';

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new user profile (called after Firebase Auth user creation)
 * @param {string} uid - Firebase Auth UID
 * @param {Object} userData - User profile data
 * @returns {Promise<Object>} Created user profile
 */
export async function createUserProfile(uid, userData) {
  try {
    const preparedData = {
      uid,
      ...userData,
      totalTurnsCompleted: userData.totalTurnsCompleted || 0,
      avgTurnCompletionTime: userData.avgTurnCompletionTime || 0,
      lastLoginAt: null,
      notificationSettings: userData.notificationSettings || {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Use setDoc with uid as document ID
    await setDoc(doc(db, USERS_COLLECTION, uid), preparedData);

    return {
      success: true,
      data: { id: uid, ...preparedData }
    };
  } catch (error) {
    console.error('Error creating user profile:', error);
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
 * Get user profile by UID
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(uid) {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'User profile not found',
        errorCode: 'not-found'
      };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() }
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Get users with optional filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Array of users
 */
export async function getUsers(options = {}) {
  try {
    const {
      role,
      active,
      limitCount = 100,
      orderByField = 'displayName',
      orderDirection = 'asc'
    } = options;

    let q = collection(db, USERS_COLLECTION);
    const constraints = [];

    // Add filters
    if (role) {
      constraints.push(where('role', '==', role));
    }
    if (active !== undefined) {
      constraints.push(where('active', '==', active));
    }

    // Add ordering and limit
    constraints.push(orderBy(orderByField, orderDirection));
    constraints.push(limit(limitCount));

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data: users
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

/**
 * Get active users
 * @returns {Promise<Object>} Array of active users
 */
export async function getActiveUsers() {
  return getUsers({
    active: true,
    orderByField: 'displayName',
    orderDirection: 'asc'
  });
}

/**
 * Get users by role
 * @param {string} role - User role
 * @returns {Promise<Object>} Array of users
 */
export async function getUsersByRole(role) {
  return getUsers({
    role,
    active: true,
    orderByField: 'displayName',
    orderDirection: 'asc'
  });
}

/**
 * Get all technicians
 * @returns {Promise<Object>} Array of technicians
 */
export async function getTechnicians() {
  return getUsersByRole('Technician');
}

/**
 * Search users by display name or email
 * @param {string} searchTerm - Search term
 * @returns {Promise<Object>} Array of matching users
 */
export async function searchUsers(searchTerm) {
  try {
    const allUsersResult = await getActiveUsers();

    if (!allUsersResult.success) {
      return allUsersResult;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchingUsers = allUsersResult.data.filter((user) => {
      return (
        user.displayName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    });

    return {
      success: true,
      data: matchingUsers
    };
  } catch (error) {
    console.error('Error searching users:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update user profile
 * @param {string} uid - User UID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updateUserProfile(uid, updates) {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);

    // Add updated timestamp
    updates.updatedAt = Timestamp.now();

    await updateDoc(docRef, updates);

    return {
      success: true,
      data: { id: uid, ...updates }
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Update last login timestamp
 * @param {string} uid - User UID
 * @returns {Promise<Object>} Update result
 */
export async function updateLastLogin(uid) {
  return updateUserProfile(uid, {
    lastLoginAt: Timestamp.now()
  });
}

/**
 * Update user notification settings
 * @param {string} uid - User UID
 * @param {Object} settings - Notification settings
 * @returns {Promise<Object>} Update result
 */
export async function updateNotificationSettings(uid, settings) {
  return updateUserProfile(uid, {
    notificationSettings: settings
  });
}

/**
 * Update user performance stats (technicians)
 * @param {string} uid - User UID
 * @param {number} turnsCompleted - Total turns completed
 * @param {number} avgCompletionTime - Average completion time in days
 * @returns {Promise<Object>} Update result
 */
export async function updateUserStats(uid, turnsCompleted, avgCompletionTime) {
  return updateUserProfile(uid, {
    totalTurnsCompleted: turnsCompleted,
    avgTurnCompletionTime: Math.round(avgCompletionTime * 10) / 10
  });
}

/**
 * Deactivate user
 * @param {string} uid - User UID
 * @returns {Promise<Object>} Update result
 */
export async function deactivateUser(uid) {
  return updateUserProfile(uid, {
    active: false
  });
}

/**
 * Reactivate user
 * @param {string} uid - User UID
 * @returns {Promise<Object>} Update result
 */
export async function reactivateUser(uid) {
  return updateUserProfile(uid, {
    active: true
  });
}

/**
 * Update user role
 * @param {string} uid - User UID
 * @param {string} newRole - New role
 * @returns {Promise<Object>} Update result
 */
export async function updateUserRole(uid, newRole) {
  const validRoles = ['Admin', 'Technician', 'Viewer', 'Manager'];

  if (!validRoles.includes(newRole)) {
    return {
      success: false,
      error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      errorCode: 'invalid-role'
    };
  }

  return updateUserProfile(uid, {
    role: newRole
  });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete user profile (use with caution)
 * Note: This does NOT delete the Firebase Auth user
 * @param {string} uid - User UID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteUserProfile(uid) {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting user profile:', error);
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
 * Check if user has permission
 * @param {string} uid - User UID
 * @param {string} permission - Permission to check
 * @returns {Promise<Object>} Permission check result
 */
export async function checkUserPermission(uid, permission) {
  try {
    const userResult = await getUserProfile(uid);

    if (!userResult.success) {
      return {
        success: false,
        hasPermission: false,
        error: userResult.error
      };
    }

    const user = userResult.data;
    const hasPermission = user.permissions?.includes(permission) || false;

    return {
      success: true,
      hasPermission
    };
  } catch (error) {
    console.error('Error checking user permission:', error);
    return {
      success: false,
      hasPermission: false,
      error: error.message
    };
  }
}

/**
 * Get user statistics
 * @returns {Promise<Object>} User statistics
 */
export async function getUserStatistics() {
  try {
    const allUsersResult = await getUsers({ limitCount: 500 });

    if (!allUsersResult.success) {
      return allUsersResult;
    }

    const users = allUsersResult.data;
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.active).length,
      inactiveUsers: users.filter(u => !u.active).length,
      byRole: {},
      technicianStats: {
        total: 0,
        avgTurnsCompleted: 0,
        avgCompletionTime: 0
      }
    };

    // Count by role
    users.forEach((user) => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
    });

    // Calculate technician statistics
    const technicians = users.filter(u => u.role === 'Technician' && u.active);
    stats.technicianStats.total = technicians.length;

    if (technicians.length > 0) {
      const totalTurns = technicians.reduce((sum, t) => sum + (t.totalTurnsCompleted || 0), 0);
      const totalAvgTime = technicians.reduce((sum, t) => sum + (t.avgTurnCompletionTime || 0), 0);

      stats.technicianStats.avgTurnsCompleted = Math.round(totalTurns / technicians.length);
      stats.technicianStats.avgCompletionTime = Math.round((totalAvgTime / technicians.length) * 10) / 10;
    }

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error getting user statistics:', error);
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
  createUserProfile,
  getUserProfile,
  getUsers,
  getActiveUsers,
  getUsersByRole,
  getTechnicians,
  searchUsers,
  updateUserProfile,
  updateLastLogin,
  updateNotificationSettings,
  updateUserStats,
  deactivateUser,
  reactivateUser,
  updateUserRole,
  deleteUserProfile,
  checkUserPermission,
  getUserStatistics
};
