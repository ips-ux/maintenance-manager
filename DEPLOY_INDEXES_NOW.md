# Deploy Firestore Indexes - Quick Guide

## The Problem
Your Dashboard queries are failing because the required Firestore composite indexes haven't been deployed yet. The indexes are correctly defined in `firestore.indexes.json`, but they need to be deployed to Firebase.

## Quick Fix - Deploy Indexes

### Option 1: Using Firebase CLI (Recommended)

Open a terminal/command prompt in your project root and run:

```bash
firebase deploy --only firestore:indexes
```

**Expected Output:**
```
✔ Deploy complete!

Firestore Indexes
  Indexes:  firestore.indexes.json
```

### Option 2: Using Firebase Console Links

If the CLI doesn't work, click these links to create the indexes directly in the Firebase Console:

1. **Turns Index** (status + targetCompletionDate):
   https://console.firebase.google.com/v1/r/project/maintenance-manager-ae292/firestore/indexes?create_composite=Cldwcm9qZWN0cy9tYWludGVuYW5jZS1tYW5hZ2VyLWFlMjkyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy90dXJucy9pbmRleGVzL18QARoKCgZzdGF0dXMQARoYChR0YXJnZXRDb21wbGV0aW9uRGF0ZRABGgwKCF9fbmFtZV9fEAE

2. **Units Index** (isVacant + vacantSince):
   https://console.firebase.google.com/v1/r/project/maintenance-manager-ae292/firestore/indexes?create_composite=Cldwcm9qZWN0cy9tYWludGVuYW5jZS1tYW5hZ2VyLWFlMjkyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy91bml0cy9pbmRleGVzL18QARoMCghpc1ZhY2FudBABGg8KC3ZhY2FudFNpbmNlEAEaDAoIX19uYW1lX18QAQ

3. **Calendar Events Index** (status + startDateTime):
   https://console.firebase.google.com/v1/r/project/maintenance-manager-ae292/firestore/indexes?create_composite=CmBwcm9qZWN0cy9tYWludGVuYW5jZS1tYW5hZ2VyLWFlMjkyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9jYWxlbmRhckV2ZW50cy9pbmRleGVzL18QARoKCgZzdGF0dXMQARoRCg1zdGFydERhdGVUaW1lEAEaDAoIX19uYW1lX18QAQ

### Option 3: Manual Creation in Firebase Console

1. Go to: https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/indexes
2. Click "Create Index"
3. Create these three indexes:

   **Index 1: Turns**
   - Collection ID: `turns`
   - Fields:
     - `status` (Ascending)
     - `targetCompletionDate` (Ascending)

   **Index 2: Units**
   - Collection ID: `units`
   - Fields:
     - `isVacant` (Ascending)
     - `vacantSince` (Ascending)

   **Index 3: Calendar Events**
   - Collection ID: `calendarEvents`
   - Fields:
     - `status` (Ascending)
     - `startDateTime` (Ascending)

## After Deployment

1. **Wait 2-5 minutes** for indexes to build (you'll see "Building" status)
2. **Refresh your Dashboard** - the errors should disappear
3. **Check index status** at: https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/indexes

All indexes should show "Enabled" status when ready.

## Verify Indexes Are Working

Once deployed, you should see:
- ✅ No more "query requires an index" errors in console
- ✅ Dashboard loads active turns successfully
- ✅ Dashboard loads vacant units successfully
- ✅ Dashboard loads upcoming events successfully

## Troubleshooting

### Firebase CLI Not Installed
```bash
npm install -g firebase-tools
firebase login
```

### Not Authenticated
```bash
firebase login
```

### Wrong Project
```bash
firebase use maintenance-manager-ae292
```

### Indexes Taking Too Long
Indexes can take 5-10 minutes to build, especially on first deployment. Be patient!

---

**Note:** All required indexes are already correctly defined in `firestore.indexes.json`. You just need to deploy them!

