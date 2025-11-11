/**
 * Turns Service
 * Complete CRUD operations for turn workflow management
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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logActivity } from './activityService';
import { updateUnit } from './unitsService';

const TURNS_COLLECTION = 'turns';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate turn progress statistics
 */
function calculateProgress(checklist) {
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter(task => task.completed).length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    totalTasks,
    completedTasks,
    progressPercentage: Math.round(progressPercentage * 100) / 100
  };
}

/**
 * Calculate days in progress
 */
function calculateDaysInProgress(startDate) {
  const start = startDate.toDate();
  const now = new Date();
  const diffTime = Math.abs(now - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days overdue
 */
function calculateDaysOverdue(targetDate) {
  const target = targetDate.toDate();
  const now = new Date();

  if (now <= target) {
    return 0;
  }

  const diffTime = now - target;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Prepare turn data with computed fields
 */
function prepareTurnData(turnData) {
  const progress = calculateProgress(turnData.checklist || []);
  const daysInProgress = calculateDaysInProgress(turnData.startDate);
  const daysOverdue = calculateDaysOverdue(turnData.targetCompletionDate);

  return {
    ...turnData,
    ...progress,
    daysInProgress,
    daysOverdue,
    updatedAt: Timestamp.now()
  };
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new turn
 * @param {Object} turnData - Turn data
 * @returns {Promise<Object>} Created turn with ID
 */
export async function createTurn(turnData) {
  try {
    // Prepare data with computed fields
    const preparedData = {
      ...turnData,
      ...calculateProgress(turnData.checklist || []),
      daysInProgress: 0,
      daysOverdue: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Create turn document
    const docRef = await addDoc(collection(db, TURNS_COLLECTION), preparedData);

    // Update associated unit with turn reference
    await updateUnit(turnData.unitId, {
      currentTurnId: docRef.id,
      status: 'In Progress',
      isVacant: true
    });

    // Log activity
    await logActivity({
      userId: turnData.assignedTechnicianId,
      userName: turnData.assignedTechnicianName,
      userRole: 'Technician',
      action: `Turn started for Unit ${turnData.unitNumber}`,
      actionType: 'turn.created',
      entityType: 'turn',
      entityId: docRef.id,
      entityName: `Unit ${turnData.unitNumber} Turn`,
      metadata: {
        unitId: turnData.unitId,
        unitNumber: turnData.unitNumber,
        targetDate: turnData.targetCompletionDate
      },
      timestamp: Timestamp.now()
    });

    return {
      success: true,
      data: { id: docRef.id, ...preparedData }
    };
  } catch (error) {
    console.error('Error creating turn:', error);
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
 * Get turn by ID
 * @param {string} turnId - Turn document ID
 * @returns {Promise<Object>} Turn data
 */
export async function getTurnById(turnId) {
  try {
    const docRef = doc(db, TURNS_COLLECTION, turnId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Turn not found',
        errorCode: 'not-found'
      };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() }
    };
  } catch (error) {
    console.error('Error getting turn:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Get all turns with optional filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Array of turns
 */
export async function getTurns(options = {}) {
  try {
    const { status, assignedTechnicianId, limitCount = 50, orderByField = 'targetCompletionDate', orderDirection = 'asc' } = options;

    let q = collection(db, TURNS_COLLECTION);
    const constraints = [];

    // Add filters
    if (status) {
      constraints.push(where('status', '==', status));
    }
    if (assignedTechnicianId) {
      constraints.push(where('assignedTechnicianId', '==', assignedTechnicianId));
    }

    // Add ordering and limit
    constraints.push(orderBy(orderByField, orderDirection));
    constraints.push(limit(limitCount));

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    const turns = [];
    querySnapshot.forEach((doc) => {
      turns.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data: turns
    };
  } catch (error) {
    console.error('Error getting turns:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

/**
 * Get active turns (In Progress)
 * @param {number} limitCount - Maximum number of results
 * @returns {Promise<Object>} Array of active turns
 */
export async function getActiveTurns(limitCount = 10) {
  return getTurns({
    status: 'In Progress',
    limitCount,
    orderByField: 'targetCompletionDate',
    orderDirection: 'asc'
  });
}

/**
 * Get turns by unit ID
 * @param {string} unitId - Unit document ID
 * @returns {Promise<Object>} Array of turns for unit
 */
export async function getTurnsByUnit(unitId) {
  try {
    const q = query(
      collection(db, TURNS_COLLECTION),
      where('unitId', '==', unitId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const turns = [];
    querySnapshot.forEach((doc) => {
      turns.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data: turns
    };
  } catch (error) {
    console.error('Error getting turns by unit:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

/**
 * Get turns assigned to technician
 * @param {string} technicianId - Technician user ID
 * @returns {Promise<Object>} Array of assigned turns
 */
export async function getTurnsByTechnician(technicianId) {
  return getTurns({
    assignedTechnicianId: technicianId,
    orderByField: 'targetCompletionDate',
    orderDirection: 'asc'
  });
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update turn
 * @param {string} turnId - Turn document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updateTurn(turnId, updates) {
  try {
    const docRef = doc(db, TURNS_COLLECTION, turnId);

    // If checklist is updated, recalculate progress
    if (updates.checklist) {
      const progress = calculateProgress(updates.checklist);
      updates = { ...updates, ...progress };
    }

    // Add updated timestamp
    updates.updatedAt = Timestamp.now();

    await updateDoc(docRef, updates);

    return {
      success: true,
      data: { id: turnId, ...updates }
    };
  } catch (error) {
    console.error('Error updating turn:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Update task in checklist
 * @param {string} turnId - Turn document ID
 * @param {string} taskId - Task ID in checklist
 * @param {Object} taskUpdates - Task fields to update
 * @param {Object} userInfo - User performing update
 * @returns {Promise<Object>} Update result
 */
export async function updateTask(turnId, taskId, taskUpdates, userInfo) {
  try {
    // Get current turn
    const turnResult = await getTurnById(turnId);
    if (!turnResult.success) {
      return turnResult;
    }

    const turn = turnResult.data;
    const checklist = [...turn.checklist];

    // Find and update task
    const taskIndex = checklist.findIndex(task => task.taskId === taskId);
    if (taskIndex === -1) {
      return {
        success: false,
        error: 'Task not found in checklist',
        errorCode: 'task-not-found'
      };
    }

    checklist[taskIndex] = {
      ...checklist[taskIndex],
      ...taskUpdates
    };

    // If task is being marked complete, add completion metadata
    if (taskUpdates.completed && !checklist[taskIndex].completedAt) {
      checklist[taskIndex].completedAt = Timestamp.now();
      checklist[taskIndex].completedBy = userInfo.userId;
      checklist[taskIndex].completedByName = userInfo.userName;

      // Log activity
      await logActivity({
        userId: userInfo.userId,
        userName: userInfo.userName,
        userRole: userInfo.userRole || 'Technician',
        action: `${checklist[taskIndex].taskName} completed in Unit ${turn.unitNumber}`,
        actionType: 'task.completed',
        entityType: 'turn',
        entityId: turnId,
        entityName: `Unit ${turn.unitNumber} Turn`,
        metadata: {
          taskId,
          taskName: checklist[taskIndex].taskName,
          unitNumber: turn.unitNumber
        },
        timestamp: Timestamp.now()
      });
    }

    // Update turn with new checklist
    return await updateTurn(turnId, { checklist });
  } catch (error) {
    console.error('Error updating task:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Complete a turn
 * @param {string} turnId - Turn document ID
 * @param {Object} userInfo - User completing the turn
 * @returns {Promise<Object>} Update result
 */
export async function completeTurn(turnId, userInfo) {
  try {
    const turnResult = await getTurnById(turnId);
    if (!turnResult.success) {
      return turnResult;
    }

    const turn = turnResult.data;

    // Update turn status
    const updateResult = await updateTurn(turnId, {
      status: 'Completed',
      actualCompletionDate: Timestamp.now()
    });

    if (!updateResult.success) {
      return updateResult;
    }

    // Update associated unit
    await updateUnit(turn.unitId, {
      status: 'Ready',
      currentTurnId: null,
      lastTurnCompletedDate: Timestamp.now()
    });

    // Log activity
    await logActivity({
      userId: userInfo.userId,
      userName: userInfo.userName,
      userRole: userInfo.userRole || 'Technician',
      action: `Turn completed for Unit ${turn.unitNumber}`,
      actionType: 'turn.completed',
      entityType: 'turn',
      entityId: turnId,
      entityName: `Unit ${turn.unitNumber} Turn`,
      metadata: {
        unitId: turn.unitId,
        unitNumber: turn.unitNumber,
        daysInProgress: turn.daysInProgress
      },
      timestamp: Timestamp.now()
    });

    return updateResult;
  } catch (error) {
    console.error('Error completing turn:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Block a turn
 * @param {string} turnId - Turn document ID
 * @param {string} reason - Blockage reason
 * @param {Object} userInfo - User blocking the turn
 * @returns {Promise<Object>} Update result
 */
export async function blockTurn(turnId, reason, userInfo) {
  try {
    const turnResult = await getTurnById(turnId);
    if (!turnResult.success) {
      return turnResult;
    }

    const turn = turnResult.data;

    const updateResult = await updateTurn(turnId, {
      status: 'Blocked',
      blockageReason: reason
    });

    if (!updateResult.success) {
      return updateResult;
    }

    // Update unit status
    await updateUnit(turn.unitId, {
      status: 'Blocked'
    });

    // Log activity
    await logActivity({
      userId: userInfo.userId,
      userName: userInfo.userName,
      userRole: userInfo.userRole || 'Technician',
      action: `Turn blocked for Unit ${turn.unitNumber}: ${reason}`,
      actionType: 'turn.blocked',
      entityType: 'turn',
      entityId: turnId,
      entityName: `Unit ${turn.unitNumber} Turn`,
      metadata: {
        reason,
        unitNumber: turn.unitNumber
      },
      timestamp: Timestamp.now()
    });

    return updateResult;
  } catch (error) {
    console.error('Error blocking turn:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a turn (use with caution)
 * @param {string} turnId - Turn document ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteTurn(turnId) {
  try {
    // Get turn to update associated unit
    const turnResult = await getTurnById(turnId);
    if (turnResult.success) {
      const turn = turnResult.data;
      await updateUnit(turn.unitId, {
        currentTurnId: null,
        status: 'Ready'
      });
    }

    const docRef = doc(db, TURNS_COLLECTION, turnId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting turn:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Recalculate progress for all active turns
 * Useful for maintenance tasks
 * @returns {Promise<Object>} Batch operation result
 */
export async function recalculateAllTurnProgress() {
  try {
    const result = await getActiveTurns(100);
    if (!result.success) {
      return result;
    }

    const batch = writeBatch(db);
    let updateCount = 0;

    result.data.forEach((turn) => {
      const docRef = doc(db, TURNS_COLLECTION, turn.id);
      const updates = prepareTurnData(turn);
      batch.update(docRef, updates);
      updateCount++;
    });

    await batch.commit();

    return {
      success: true,
      data: { updatedCount: updateCount }
    };
  } catch (error) {
    console.error('Error recalculating turn progress:', error);
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
  createTurn,
  getTurnById,
  getTurns,
  getActiveTurns,
  getTurnsByUnit,
  getTurnsByTechnician,
  updateTurn,
  updateTask,
  completeTurn,
  blockTurn,
  deleteTurn,
  recalculateAllTurnProgress
};
