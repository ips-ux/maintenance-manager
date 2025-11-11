/**
 * Firebase Connection Test Utility
 * Tests Firebase connectivity and data availability
 */

import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Test Firebase connection and data availability
 * @returns {Promise<Object>} Test results
 */
export async function testFirebaseConnection() {
  const results = {
    connectionStatus: 'unknown',
    collections: {
      units: { exists: false, count: 0, error: null },
      turns: { exists: false, count: 0, error: null },
      calendar: { exists: false, count: 0, error: null },
      activity: { exists: false, count: 0, error: null },
      vendors: { exists: false, count: 0, error: null },
      users: { exists: false, count: 0, error: null }
    },
    overallStatus: 'unknown'
  };

  try {
    console.log('🔍 Testing Firebase connection...');

    // Test each collection
    const collectionsToTest = ['units', 'turns', 'calendar', 'activity', 'vendors', 'users'];

    for (const collectionName of collectionsToTest) {
      try {
        console.log(`Testing collection: ${collectionName}`);
        const q = query(collection(db, collectionName), limit(1));
        const querySnapshot = await getDocs(q);

        results.collections[collectionName].exists = true;
        results.collections[collectionName].count = querySnapshot.size;

        console.log(`✓ ${collectionName}: ${querySnapshot.size} documents found`);
      } catch (error) {
        console.error(`✗ ${collectionName}: Error -`, error.message);
        results.collections[collectionName].error = error.message;
      }
    }

    // Determine overall status
    const hasData = Object.values(results.collections).some(col => col.count > 0);

    if (hasData) {
      results.connectionStatus = 'connected';
      results.overallStatus = 'success';
      console.log('✅ Firebase connection successful and data exists!');
    } else {
      results.connectionStatus = 'connected';
      results.overallStatus = 'no-data';
      console.warn('⚠️ Firebase connected but no data found. Run seedDatabase().');
    }

    return {
      success: true,
      data: results
    };
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    results.connectionStatus = 'error';
    results.overallStatus = 'error';

    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      data: results
    };
  }
}

/**
 * Get detailed collection info
 * @param {string} collectionName - Collection to inspect
 * @returns {Promise<Object>} Collection details
 */
export async function getCollectionInfo(collectionName) {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data: {
        collectionName,
        documentCount: documents.length,
        documents: documents.slice(0, 5) // First 5 documents
      }
    };
  } catch (error) {
    console.error(`Error getting collection info for ${collectionName}:`, error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

export default {
  testFirebaseConnection,
  getCollectionInfo
};
