/**
 * Firebase Debug Utilities
 * Helper functions for testing and verifying Firebase data integrity
 *
 * USAGE IN BROWSER CONSOLE:
 * 1. Import this file in your component or App.js
 * 2. Expose functions to window object for console access
 * 3. Run verification tests
 */

import { getUnits } from '../services/unitsService';
import { getTurns } from '../services/turnsService';
import { getEvents } from '../services/calendarService';
import { getRecentActivities } from '../services/activityService';

/**
 * Verify data integrity between units and turns
 * Checks if turn unitIds correctly reference existing units
 */
export async function verifyUnitTurnIntegrity() {
  console.log('🔍 Verifying Unit-Turn Data Integrity...\n');

  try {
    // Fetch all units and turns
    const unitsResult = await getUnits({ limitCount: 500 });
    const turnsResult = await getTurns({ limitCount: 500 });

    if (!unitsResult.success || !turnsResult.success) {
      console.error('❌ Failed to fetch data');
      return {
        success: false,
        error: 'Failed to fetch data'
      };
    }

    const units = unitsResult.data;
    const turns = turnsResult.data;

    console.log(`✓ Found ${units.length} units`);
    console.log(`✓ Found ${turns.length} turns\n`);

    // Create a map of unit IDs for quick lookup
    const unitIdMap = new Map(units.map(u => [u.id, u]));

    // Check each turn's unitId
    const issues = [];
    const validTurns = [];

    turns.forEach(turn => {
      const referencedUnit = unitIdMap.get(turn.unitId);

      if (!referencedUnit) {
        issues.push({
          turnId: turn.id,
          unitId: turn.unitId,
          unitNumber: turn.unitNumber,
          issue: 'Unit ID does not exist in database'
        });
      } else {
        validTurns.push({
          turnId: turn.id,
          unitId: turn.unitId,
          unitNumber: turn.unitNumber,
          status: turn.status
        });
      }
    });

    // Report results
    if (issues.length === 0) {
      console.log('✅ ALL TURNS REFERENCE VALID UNITS!');
      console.log(`   ${validTurns.length} turns verified\n`);
      console.table(validTurns);
    } else {
      console.error(`❌ FOUND ${issues.length} INTEGRITY ISSUES:\n`);
      console.table(issues);
      console.log(`\n✓ ${validTurns.length} valid turns`);
    }

    return {
      success: true,
      totalUnits: units.length,
      totalTurns: turns.length,
      validTurns: validTurns.length,
      issues: issues.length,
      issueDetails: issues
    };
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify calendar events reference valid units and vendors
 */
export async function verifyCalendarIntegrity() {
  console.log('🔍 Verifying Calendar Event Integrity...\n');

  try {
    const unitsResult = await getUnits({ limitCount: 500 });
    const eventsResult = await getEvents({ limitCount: 500 });

    if (!unitsResult.success || !eventsResult.success) {
      console.error('❌ Failed to fetch data');
      return { success: false };
    }

    const units = unitsResult.data;
    const events = eventsResult.data;

    console.log(`✓ Found ${units.length} units`);
    console.log(`✓ Found ${events.length} calendar events\n`);

    const unitIdMap = new Map(units.map(u => [u.id, u]));
    const issues = [];
    const validEvents = [];

    events.forEach(event => {
      const referencedUnit = unitIdMap.get(event.unitId);

      if (!referencedUnit) {
        issues.push({
          eventId: event.id,
          eventTitle: event.title,
          unitId: event.unitId,
          issue: 'Unit ID does not exist'
        });
      } else {
        validEvents.push({
          eventId: event.id,
          title: event.title,
          unitNumber: event.unitNumber,
          eventType: event.eventType
        });
      }
    });

    if (issues.length === 0) {
      console.log('✅ ALL EVENTS REFERENCE VALID UNITS!');
      console.log(`   ${validEvents.length} events verified\n`);
      console.table(validEvents);
    } else {
      console.error(`❌ FOUND ${issues.length} INTEGRITY ISSUES:\n`);
      console.table(issues);
    }

    return {
      success: true,
      totalEvents: events.length,
      validEvents: validEvents.length,
      issues: issues.length
    };
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Display dashboard data summary
 */
export async function showDashboardDataSummary() {
  console.log('📊 Dashboard Data Summary\n');

  try {
    const [unitsResult, turnsResult, eventsResult, activitiesResult] = await Promise.all([
      getUnits({ limitCount: 500 }),
      getTurns({ limitCount: 500 }),
      getEvents({ limitCount: 500 }),
      getRecentActivities(20)
    ]);

    const summary = {
      units: {
        total: unitsResult.data?.length || 0,
        vacant: unitsResult.data?.filter(u => u.isVacant).length || 0,
        inProgress: unitsResult.data?.filter(u => u.status === 'In Progress').length || 0
      },
      turns: {
        total: turnsResult.data?.length || 0,
        inProgress: turnsResult.data?.filter(t => t.status === 'In Progress').length || 0,
        completed: turnsResult.data?.filter(t => t.status === 'Completed').length || 0
      },
      events: {
        total: eventsResult.data?.length || 0,
        scheduled: eventsResult.data?.filter(e => e.status === 'Scheduled').length || 0
      },
      activities: {
        recentCount: activitiesResult.data?.length || 0
      }
    };

    console.table(summary);

    return summary;
  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List all vacant units with their turn status
 */
export async function showVacantUnitsReport() {
  console.log('🏠 Vacant Units Report\n');

  try {
    const unitsResult = await getUnits({ isVacant: true, limitCount: 100 });

    if (!unitsResult.success) {
      console.error('❌ Failed to fetch units');
      return { success: false };
    }

    const vacantUnits = unitsResult.data.map(unit => ({
      unitNumber: unit.unitNumber,
      status: unit.status,
      daysVacant: unit.daysVacant,
      hasTurn: !!unit.currentTurnId,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms
    }));

    console.table(vacantUnits);
    console.log(`\n✓ Total vacant units: ${vacantUnits.length}`);
    console.log(`✓ Units with active turns: ${vacantUnits.filter(u => u.hasTurn).length}`);
    console.log(`✓ Units ready for turn: ${vacantUnits.filter(u => !u.hasTurn && u.status === 'Ready').length}`);

    return {
      success: true,
      vacantUnits
    };
  } catch (error) {
    console.error('❌ Error fetching vacant units:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Run all verification tests
 */
export async function runAllVerifications() {
  console.log('🚀 Running All Firebase Data Verifications\n');
  console.log('='.repeat(60) + '\n');

  const results = {
    unitTurnIntegrity: await verifyUnitTurnIntegrity(),
    calendarIntegrity: await verifyCalendarIntegrity(),
    dashboardSummary: await showDashboardDataSummary(),
    vacantUnits: await showVacantUnitsReport()
  };

  console.log('\n' + '='.repeat(60));
  console.log('✅ Verification Complete!\n');

  return results;
}

// Export all functions
export default {
  verifyUnitTurnIntegrity,
  verifyCalendarIntegrity,
  showDashboardDataSummary,
  showVacantUnitsReport,
  runAllVerifications
};
