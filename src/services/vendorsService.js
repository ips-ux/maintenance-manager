/**
 * Vendors Service
 * Complete CRUD operations for vendor directory management
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

const VENDORS_COLLECTION = 'vendors';

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new vendor
 * @param {Object} vendorData - Vendor data
 * @returns {Promise<Object>} Created vendor with ID
 */
export async function createVendor(vendorData) {
  try {
    const preparedData = {
      ...vendorData,
      totalJobsCompleted: vendorData.totalJobsCompleted || 0,
      lastServiceDate: vendorData.lastServiceDate || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, VENDORS_COLLECTION), preparedData);

    return {
      success: true,
      data: { id: docRef.id, ...preparedData }
    };
  } catch (error) {
    console.error('Error creating vendor:', error);
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
 * Get vendor by ID
 * @param {string} vendorId - Vendor document ID
 * @returns {Promise<Object>} Vendor data
 */
export async function getVendorById(vendorId) {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, vendorId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Vendor not found',
        errorCode: 'not-found'
      };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() }
    };
  } catch (error) {
    console.error('Error getting vendor:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Get vendors with optional filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Array of vendors
 */
export async function getVendors(options = {}) {
  try {
    const {
      category,
      active,
      preferredVendor,
      limitCount = 100,
      orderByField = 'vendorName',
      orderDirection = 'asc'
    } = options;

    let q = collection(db, VENDORS_COLLECTION);
    const constraints = [];

    // Add filters
    if (category) {
      constraints.push(where('category', '==', category));
    }
    if (active !== undefined) {
      constraints.push(where('active', '==', active));
    }
    if (preferredVendor !== undefined) {
      constraints.push(where('preferredVendor', '==', preferredVendor));
    }

    // Add ordering and limit
    constraints.push(orderBy(orderByField, orderDirection));
    constraints.push(limit(limitCount));

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    const vendors = [];
    querySnapshot.forEach((doc) => {
      vendors.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data: vendors
    };
  } catch (error) {
    console.error('Error getting vendors:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

/**
 * Get active vendors
 * @param {number} limitCount - Maximum number of results
 * @returns {Promise<Object>} Array of active vendors
 */
export async function getActiveVendors(limitCount = 100) {
  return getVendors({
    active: true,
    limitCount,
    orderByField: 'vendorName',
    orderDirection: 'asc'
  });
}

/**
 * Get vendors by category
 * @param {string} category - Vendor category
 * @param {boolean} activeOnly - Return only active vendors
 * @returns {Promise<Object>} Array of vendors
 */
export async function getVendorsByCategory(category, activeOnly = true) {
  const options = {
    category,
    orderByField: 'vendorName',
    orderDirection: 'asc'
  };

  if (activeOnly) {
    options.active = true;
  }

  return getVendors(options);
}

/**
 * Get preferred vendors
 * @returns {Promise<Object>} Array of preferred vendors
 */
export async function getPreferredVendors() {
  return getVendors({
    preferredVendor: true,
    active: true,
    orderByField: 'category',
    orderDirection: 'asc'
  });
}

/**
 * Search vendors by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<Object>} Array of matching vendors
 */
export async function searchVendors(searchTerm) {
  try {
    const allVendorsResult = await getActiveVendors(500);

    if (!allVendorsResult.success) {
      return allVendorsResult;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchingVendors = allVendorsResult.data.filter((vendor) => {
      return (
        vendor.vendorName.toLowerCase().includes(searchLower) ||
        vendor.contactName.toLowerCase().includes(searchLower) ||
        vendor.category.toLowerCase().includes(searchLower)
      );
    });

    return {
      success: true,
      data: matchingVendors
    };
  } catch (error) {
    console.error('Error searching vendors:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: []
    };
  }
}

/**
 * Get vendor categories with counts
 * @returns {Promise<Object>} Categories with vendor counts
 */
export async function getVendorCategories() {
  try {
    const allVendorsResult = await getActiveVendors(500);

    if (!allVendorsResult.success) {
      return allVendorsResult;
    }

    const categoryCounts = {};
    allVendorsResult.data.forEach((vendor) => {
      categoryCounts[vendor.category] = (categoryCounts[vendor.category] || 0) + 1;
    });

    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count
    }));

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    console.error('Error getting vendor categories:', error);
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
 * Update vendor
 * @param {string} vendorId - Vendor document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updateVendor(vendorId, updates) {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, vendorId);

    // Add updated timestamp
    updates.updatedAt = Timestamp.now();

    await updateDoc(docRef, updates);

    return {
      success: true,
      data: { id: vendorId, ...updates }
    };
  } catch (error) {
    console.error('Error updating vendor:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Mark vendor as preferred
 * @param {string} vendorId - Vendor document ID
 * @returns {Promise<Object>} Update result
 */
export async function markVendorPreferred(vendorId) {
  return updateVendor(vendorId, {
    preferredVendor: true
  });
}

/**
 * Mark vendor as inactive
 * @param {string} vendorId - Vendor document ID
 * @returns {Promise<Object>} Update result
 */
export async function deactivateVendor(vendorId) {
  return updateVendor(vendorId, {
    active: false
  });
}

/**
 * Reactivate vendor
 * @param {string} vendorId - Vendor document ID
 * @returns {Promise<Object>} Update result
 */
export async function reactivateVendor(vendorId) {
  return updateVendor(vendorId, {
    active: true
  });
}

/**
 * Update vendor job completion stats
 * @param {string} vendorId - Vendor document ID
 * @returns {Promise<Object>} Update result
 */
export async function recordVendorJobCompletion(vendorId) {
  try {
    const vendorResult = await getVendorById(vendorId);

    if (!vendorResult.success) {
      return vendorResult;
    }

    const vendor = vendorResult.data;

    return updateVendor(vendorId, {
      totalJobsCompleted: (vendor.totalJobsCompleted || 0) + 1,
      lastServiceDate: Timestamp.now()
    });
  } catch (error) {
    console.error('Error recording vendor job completion:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Update vendor rating
 * @param {string} vendorId - Vendor document ID
 * @param {number} rating - Rating (1-5)
 * @returns {Promise<Object>} Update result
 */
export async function updateVendorRating(vendorId, rating) {
  if (rating < 1 || rating > 5) {
    return {
      success: false,
      error: 'Rating must be between 1 and 5',
      errorCode: 'invalid-rating'
    };
  }

  return updateVendor(vendorId, {
    rating: Math.round(rating * 10) / 10 // Round to 1 decimal
  });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a vendor (use with caution)
 * @param {string} vendorId - Vendor document ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteVendor(vendorId) {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, vendorId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting vendor:', error);
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
 * Create multiple vendors at once
 * @param {Array} vendorsData - Array of vendor data objects
 * @returns {Promise<Object>} Batch operation result
 */
export async function createBulkVendors(vendorsData) {
  try {
    const results = [];
    const errors = [];

    for (const vendorData of vendorsData) {
      const result = await createVendor(vendorData);
      if (result.success) {
        results.push(result.data);
      } else {
        errors.push({
          vendorName: vendorData.vendorName,
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
    console.error('Error creating bulk vendors:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Get vendor statistics
 * @returns {Promise<Object>} Vendor statistics
 */
export async function getVendorStatistics() {
  try {
    const allVendorsResult = await getVendors({ limitCount: 1000 });

    if (!allVendorsResult.success) {
      return allVendorsResult;
    }

    const vendors = allVendorsResult.data;
    const stats = {
      totalVendors: vendors.length,
      activeVendors: vendors.filter(v => v.active).length,
      inactiveVendors: vendors.filter(v => !v.active).length,
      preferredVendors: vendors.filter(v => v.preferredVendor && v.active).length,
      byCategory: {},
      avgRating: 0,
      totalJobsCompleted: 0
    };

    // Calculate category breakdown
    vendors.forEach((vendor) => {
      if (vendor.active) {
        stats.byCategory[vendor.category] = (stats.byCategory[vendor.category] || 0) + 1;
      }
    });

    // Calculate average rating
    const ratedVendors = vendors.filter(v => v.rating && v.active);
    if (ratedVendors.length > 0) {
      const totalRating = ratedVendors.reduce((sum, v) => sum + v.rating, 0);
      stats.avgRating = Math.round((totalRating / ratedVendors.length) * 10) / 10;
    }

    // Calculate total jobs completed
    stats.totalJobsCompleted = vendors.reduce((sum, v) => sum + (v.totalJobsCompleted || 0), 0);

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error getting vendor statistics:', error);
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
  createVendor,
  getVendorById,
  getVendors,
  getActiveVendors,
  getVendorsByCategory,
  getPreferredVendors,
  searchVendors,
  getVendorCategories,
  updateVendor,
  markVendorPreferred,
  deactivateVendor,
  reactivateVendor,
  recordVendorJobCompletion,
  updateVendorRating,
  deleteVendor,
  createBulkVendors,
  getVendorStatistics
};
