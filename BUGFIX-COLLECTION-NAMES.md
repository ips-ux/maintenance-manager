# CRITICAL BUGFIX: Collection Name Case Mismatch

**Date**: 2025-11-11
**Severity**: CRITICAL - Dashboard could not fetch existing data
**Status**: RESOLVED

## Problem Description

The Dashboard was displaying "Error fetching data" despite Firebase containing populated collections with data. The application could not retrieve any existing data from Firestore.

## Root Cause Analysis

Firebase collection names are **case-sensitive**. The Firebase database contains collections with UPPERCASE names:
- ACTIVITY
- CALENDAR
- TURNS
- UNITS
- USERS
- VENDORS

However, all service files were querying with lowercase collection names:
- 'activity'
- 'calendar'
- 'turns'
- 'units'
- 'users'
- 'vendors'

This mismatch caused all Firestore queries to target non-existent collections, resulting in zero data being returned.

## Impact

- Dashboard could not display any statistics
- Active turns list was empty
- Vacant units list was empty
- Calendar events were not displayed
- Recent activity feed was empty
- All data fetching operations failed silently

## Resolution

Updated collection name constants in all six service files to match Firebase's uppercase naming:

### Files Modified

1. **Z:\Documents\AI Coding\Maintenance_Manager_Gemini\maintenance-manager\src\services\unitsService.js**
   - Line 22: `const UNITS_COLLECTION = 'units';` → `const UNITS_COLLECTION = 'UNITS';`

2. **Z:\Documents\AI Coding\Maintenance_Manager_Gemini\maintenance-manager\src\services\turnsService.js**
   - Line 25: `const TURNS_COLLECTION = 'turns';` → `const TURNS_COLLECTION = 'TURNS';`

3. **Z:\Documents\AI Coding\Maintenance_Manager_Gemini\maintenance-manager\src\services\calendarService.js**
   - Line 23: `const CALENDAR_COLLECTION = 'calendar';` → `const CALENDAR_COLLECTION = 'CALENDAR';`

4. **Z:\Documents\AI Coding\Maintenance_Manager_Gemini\maintenance-manager\src\services\activityService.js**
   - Line 21: `const ACTIVITY_COLLECTION = 'activity';` → `const ACTIVITY_COLLECTION = 'ACTIVITY';`

5. **Z:\Documents\AI Coding\Maintenance_Manager_Gemini\maintenance-manager\src\services\vendorsService.js**
   - Line 22: `const VENDORS_COLLECTION = 'vendors';` → `const VENDORS_COLLECTION = 'VENDORS';`

6. **Z:\Documents\AI Coding\Maintenance_Manager_Gemini\maintenance-manager\src\services\usersService.js**
   - Line 22: `const USERS_COLLECTION = 'users';` → `const USERS_COLLECTION = 'USERS';`

## Testing Verification

After this fix, the Dashboard should now:
1. Successfully fetch units statistics (total units, vacant units, avg days vacant)
2. Display active turns with progress bars
3. Show vacant units with "Start Turn" buttons
4. Display upcoming calendar events
5. Show recent activity feed
6. All service queries will target the correct Firebase collections

## Prevention

To prevent this issue in the future:
- Always verify collection names match exactly between Firebase Console and service files
- Use constants for collection names (already implemented)
- Consider adding a Firebase collection name validation utility
- Document the expected collection naming convention in the project README

## Related Documentation

- **Roadmap Update**: Z:\Documents\AI Coding\Maintenance_Manager_Gemini\maintenance-manager\roadmap.md
  - Added to "Technical Debt & Known Issues" section
  - Version 2025-11-11c recorded in Version History

## Next Steps

1. Test the Dashboard in the browser to confirm data loads
2. Verify all service queries return expected results
3. Check browser console for any remaining errors
4. If errors persist, investigate Firestore security rules
