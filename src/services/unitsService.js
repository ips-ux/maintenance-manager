/**
 * Units Service
 * Complete CRUD operations for unit inventory management
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

const UNITS_COLLECTION = 'units';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate days vacant
 */
function calculateDaysVacant(vacantSince) {
  if (!vacantSince) return 0;

  const vacant = vacantSince.toDate();
  const now = new Date();
  const diffTime = Math.abs(now - vacant);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Prepare unit data with computed fields
 */
function prepareUnitData(unitData) {
  const daysVacant = unitData.isVacant && unitData.vacantSince
    ? calculateDaysVacant(unitData.vacantSince)
    : 0;

  return {
    ...unitData,
    daysVacant,
    updatedAt: Timestamp.now()
  };
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new unit
 * @param {Object} unitData - Unit data
 * @returns {Promise<Object>} Created unit with ID
 */
export async function createUnit(unitData) {
  try {
    const preparedData = {
      ...unitData,
      daysVacant: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, UNITS_COLLECTION), preparedData);

    return {
      success: true,
      data: { id: docRef.id, ...preparedData }
    };
  } catch (error) {
    console.error('Error creating unit:', error);
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
 * Get unit by ID
 * @param {string} unitId - Unit document ID
 * @returns {Promise<Object>} Unit data
 */
export async function getUnitById(unitId) {
  try {
    const docRef = doc(db, UNITS_COLLECTION, unitId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Unit not found',
        errorCode: 'not-found'
      };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() }
    };
  } catch (error) {
    console.error('Error getting unit:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Get unit by unit number
 * @param {string} unitNumber - Unit number
 * @returns {Promise<Object>} Unit data
 */
export async function getUnitByNumber(unitNumber) {
  try {
    const q = query(
      collection(db, UNITS_COLLECTION),
      where('unitNumber', '==', unitNumber),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: false,
        error: 'Unit not found',
        errorCode: 'not-found'
      };
    }

    const doc = querySnapshot.docs[0];
    return {
      success: true,
      data: { id: doc.id, ...doc.data() }
    };
  } catch (error) {
    console.error('Error getting unit by number:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Get all units with optional filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Array of units
 */
export async function getUnits(options = {}) {
  try {
    const {
      status,
      isVacant,
      building,
      limitCount = 200,
      orderByField = 'unitNumber',
      orderDirection = 'asc'
    } = options;

    let q = collection(db, UNITS_COLLECTION);
    const constraints = [];

    // Add filters
    if (status) {
      constraints.push(where('status', '==', status));
    }
    if (isVacant !== undefined) {
      constraints.push(where('isVacant', '==', isVacant));
    }
    if (building) {
      constraints.push(where('building', '==', building));
    }

    // Add ordering and limit
    constraints.push(orderBy(orderByField, orderDirection));
    constraints.push(limit(limitCount));

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    const units = [];
    querySnapshot.forEach((doc) => {
      units.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data: units
    };
  } catch (error) {
    console.error('Error getting units:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

/**
 * Get all vacant units
 * @param {number} limitCount - Maximum number of results
 * @returns {Promise<Object>} Array of vacant units
 */
export async function getVacantUnits(limitCount = 50) {
  return getUnits({
    isVacant: true,
    limitCount,
    orderByField: 'vacantSince',
    orderDirection: 'asc'
  });
}

/**
 * Get units by status
 * @param {string} status - Unit status
 * @returns {Promise<Object>} Array of units
 */
export async function getUnitsByStatus(status) {
  return getUnits({
    status,
    orderByField: 'unitNumber',
    orderDirection: 'asc'
  });
}

/**
 * Get units statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getUnitsStatistics() {
  try {
    const allUnitsResult = await getUnits({ limitCount: 1000 });

    if (!allUnitsResult.success) {
      return allUnitsResult;
    }

    const units = allUnitsResult.data;
    const stats = {
      totalUnits: units.length,
      vacantUnits: units.filter(u => u.isVacant).length,
      occupiedUnits: units.filter(u => u.status === 'Occupied').length,
      readyUnits: units.filter(u => u.status === 'Ready').length,
      inProgressUnits: units.filter(u => u.status === 'In Progress').length,
      blockedUnits: units.filter(u => u.status === 'Blocked').length,
      avgDaysVacant: 0
    };

    // Calculate average days vacant
    const vacantUnits = units.filter(u => u.isVacant);
    if (vacantUnits.length > 0) {
      const totalDaysVacant = vacantUnits.reduce((sum, unit) => sum + unit.daysVacant, 0);
      stats.avgDaysVacant = Math.round((totalDaysVacant / vacantUnits.length) * 10) / 10;
    }

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error getting units statistics:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update unit
 * @param {string} unitId - Unit document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updateUnit(unitId, updates) {
  try {
    const docRef = doc(db, UNITS_COLLECTION, unitId);

    // Recalculate daysVacant if vacancy status changed
    if (updates.isVacant !== undefined || updates.vacantSince) {
      const currentUnit = await getUnitById(unitId);
      if (currentUnit.success) {
        const unitData = { ...currentUnit.data, ...updates };
        updates.daysVacant = unitData.isVacant && unitData.vacantSince
          ? calculateDaysVacant(unitData.vacantSince)
          : 0;
      }
    }

    // Add updated timestamp
    updates.updatedAt = Timestamp.now();

    await updateDoc(docRef, updates);

    return {
      success: true,
      data: { id: unitId, ...updates }
    };
  } catch (error) {
    console.error('Error updating unit:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Mark unit as vacant
 * @param {string} unitId - Unit document ID
 * @returns {Promise<Object>} Update result
 */
export async function markUnitVacant(unitId) {
  return updateUnit(unitId, {
    isVacant: true,
    vacantSince: Timestamp.now(),
    status: 'Ready',
    currentTurnId: null
  });
}

/**
 * Mark unit as occupied
 * @param {string} unitId - Unit document ID
 * @returns {Promise<Object>} Update result
 */
export async function markUnitOccupied(unitId) {
  return updateUnit(unitId, {
    isVacant: false,
    vacantSince: null,
    daysVacant: 0,
    status: 'Occupied',
    currentTurnId: null
  });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a unit (use with caution)
 * @param {string} unitId - Unit document ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteUnit(unitId) {
  try {
    const docRef = doc(db, UNITS_COLLECTION, unitId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting unit:', error);
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
 * Create multiple units at once
 * @param {Array} unitsData - Array of unit data objects
 * @returns {Promise<Object>} Batch operation result
 */
export async function createBulkUnits(unitsData) {
  try {
    const results = [];
    const errors = [];

    for (const unitData of unitsData) {
      const result = await createUnit(unitData);
      if (result.success) {
        results.push(result.data);
      } else {
        errors.push({
          unitNumber: unitData.unitNumber,
          error: result.error
        });
      }
    }

    return {
      success: true,
      data: {
        created: results,
        successCount: results.length,
        failureCount: errors.length,
        errors: errors.length > 0 ? errors : undefined
      }
    };
  } catch (error) {
    console.error('Error creating bulk units:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Update days vacant for all vacant units
 * Useful for daily maintenance tasks
 * @returns {Promise<Object>} Update result
 */
export async function updateAllVacantUnitDays() {
  try {
    const vacantResult = await getVacantUnits(500);
    if (!vacantResult.success) {
      return vacantResult;
    }

    let updateCount = 0;
    const errors = [];

    for (const unit of vacantResult.data) {
      const daysVacant = calculateDaysVacant(unit.vacantSince);
      const result = await updateUnit(unit.id, { daysVacant });

      if (result.success) {
        updateCount++;
      } else {
        errors.push({ unitId: unit.id, error: result.error });
      }
    }

    return {
      success: true,
      data: {
        updatedCount: updateCount,
        failureCount: errors.length,
        errors: errors.length > 0 ? errors : undefined
      }
    };
  } catch (error) {
    console.error('Error updating vacant unit days:', error);
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
  createUnit,
  getUnitById,
  getUnitByNumber,
  getUnits,
  getVacantUnits,
  getUnitsByStatus,
  getUnitsStatistics,
  updateUnit,
  markUnitVacant,
  markUnitOccupied,
  deleteUnit,
  createBulkUnits,
  updateAllVacantUnitDays
};
