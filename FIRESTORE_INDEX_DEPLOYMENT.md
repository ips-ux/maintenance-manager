# Firestore Index Deployment Guide

## Issue Overview

The dashboard was failing to load due to missing Firestore composite indexes. The error indicated:

```
Error: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

## Root Cause

Firestore requires composite indexes when querying with multiple fields. Our dashboard queries use combinations like:
- `status` + `targetCompletionDate` (for active turns)
- `isVacant` + `vacantSince` (for vacant units)
- `status` + `startDateTime` (for upcoming events)

## What Was Fixed

### 1. Collection Name Corrections

Fixed collection name mismatches across all service files:

**Before:**
- `TURNS` → `turns`
- `UNITS` → `units`
- `CALENDAR` → `calendarEvents`
- `ACTIVITY` → `activities`
- `VENDORS` → `vendors`
- `USERS` → `users`

**Files Updated:**
- `src/services/turnsService.js`
- `src/services/unitsService.js`
- `src/services/calendarService.js`
- `src/services/activityService.js`
- `src/services/vendorsService.js`
- `src/services/usersService.js`

### 2. Firestore Indexes Configuration

Updated `firestore.indexes.json` with correct collection names and all required composite indexes.

**Key Indexes Added:**

#### Turns Collection
- `status` + `targetCompletionDate` (for active turns query)
- `assignedTechnicianId` + `targetCompletionDate` (for technician turns)
- `unitId` + `createdAt` (for unit turn history)

#### Units Collection
- `isVacant` + `vacantSince` (for vacant units list)
- `status` + `isVacant` (for filtering units)

#### Calendar Events Collection
- `status` + `startDateTime` (for upcoming events)
- `assignedTo` + `status` + `startDateTime` (for user-assigned events)
- `unitId` + `startDateTime` (for unit events)

#### Activities Collection
- `userId` + `timestamp` (for user activity)
- `entityType` + `timestamp` (for entity activity logs)

## How to Deploy Indexes

### Option 1: Deploy via Firebase CLI (Recommended)

This is the fastest way to deploy all indexes at once.

```bash
# 1. Navigate to project directory
cd "Z:\Documents\AI Coding\Maintenance_Manager_Gemini\maintenance-manager"

# 2. Ensure you're logged in to Firebase
firebase login

# 3. Set the active project
firebase use maintenance-manager-ae292

# 4. Deploy indexes
firebase deploy --only firestore:indexes
```

**Expected Output:**
```
✔ Deploy complete!

Firestore Indexes
  Indexes:  firestore.indexes.json
```

**Note:** Indexes can take 5-15 minutes to build. Monitor progress at:
https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/indexes

### Option 2: Create Indexes Manually via Firebase Console

If you prefer to create indexes one at a time or need to create a specific index immediately:

1. Click the error link in the console (it auto-fills the index configuration)
2. Or manually create at: https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/indexes

**Example: Creating the Active Turns Index**

1. Go to Firestore Indexes page
2. Click "Create Index"
3. Set:
   - Collection ID: `turns`
   - Field 1: `status` (Ascending)
   - Field 2: `targetCompletionDate` (Ascending)
   - Query scope: Collection
4. Click "Create"

### Option 3: Click the Auto-Generated Link

When you get the index error in the browser console, Firebase provides a direct link to create that specific index:

```
https://console.firebase.google.com/v1/r/project/maintenance-manager-ae292/firestore/indexes?create_composite=...
```

Simply click this link and approve the index creation.

## Verifying Index Status

### Check All Indexes

Visit: https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/indexes

You should see all indexes in one of these states:

- **Building** (orange) - Index is being created (can take 5-15 minutes)
- **Enabled** (green) - Index is ready to use
- **Error** (red) - There was a problem creating the index

### Test the Dashboard

Once indexes show as "Enabled":

1. Navigate to the dashboard: http://localhost:5173
2. Open browser console (F12)
3. Look for successful data fetch logs:
   ```
   Dashboard: Active turns result: {success: true, data: [...]}
   Dashboard: Vacant units result: {success: true, data: [...]}
   Dashboard: All data fetched successfully!
   ```

## Common Index Patterns

### Single Field Indexes (Auto-created)

Firestore automatically creates single-field indexes. You don't need to manually create these:
- `status`
- `targetCompletionDate`
- `isVacant`
- `timestamp`

### Composite Indexes (Manual creation required)

When querying with:
- **Multiple where clauses**: Needs composite index
- **Where clause + orderBy**: Needs composite index
- **Multiple orderBy clauses**: Needs composite index

**Example Query Requiring Composite Index:**
```javascript
query(
  collection(db, 'turns'),
  where('status', '==', 'In Progress'),
  orderBy('targetCompletionDate', 'asc')
)
```

Requires: `turns` collection index on `status` (ASC) + `targetCompletionDate` (ASC)

## Troubleshooting

### Index Already Exists Error

```
Error: Index already exists
```

**Solution:** The index was created previously. Verify it's in "Enabled" state in the console.

### Index Build Timeout

```
Error: Index creation timed out
```

**Solution:** Large collections can take time. Check the console after 15-20 minutes. If still building, it's working correctly.

### Wrong Collection Name Error

```
Error: Collection 'TURNS' not found
```

**Solution:** Ensure all service files use lowercase collection names (`turns`, not `TURNS`). This was fixed in the recent update.

### Permission Denied When Creating Index

```
Error: Missing or insufficient permissions
```

**Solution:** Ensure your Firebase account has "Editor" or "Owner" role for the project.

## Best Practices

1. **Always deploy indexes via `firestore.indexes.json`** - This keeps your index configuration version-controlled and reproducible.

2. **Test locally first** - Use the Firebase Emulator Suite to test indexes before deploying to production.

3. **Monitor index usage** - Firebase Console shows which indexes are actually being used. Remove unused indexes to save on storage costs.

4. **Plan for scale** - Indexes increase write costs. Each indexed field adds a small cost to every document write.

5. **Exempt fields that don't need ordering** - Use `arrayContains` instead of equality for array fields when possible.

## Index Configuration Reference

The complete index configuration is stored in:
```
firestore.indexes.json
```

This file is deployed with:
```bash
firebase deploy --only firestore:indexes
```

## Next Steps

After deploying indexes:

1. ✅ Wait for all indexes to reach "Enabled" state (5-15 minutes)
2. ✅ Refresh the dashboard and verify data loads successfully
3. ✅ Check browser console for any remaining errors
4. ✅ Test all dashboard widgets:
   - Active Turns
   - Vacant Units
   - Upcoming Events
   - Recent Activity

## Support

If you encounter issues:

- **Index Errors:** Check Firebase Console > Firestore > Indexes
- **Collection Name Errors:** Verify service files use lowercase collection names
- **Query Errors:** Check browser console for detailed error messages
- **Deploy Errors:** Run `firebase login --reauth` and try again

---

**Last Updated:** 2025-11-11
**Project:** IPS-UX Maintenance Manager
**Firebase Project:** maintenance-manager-ae292
