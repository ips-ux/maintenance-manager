# Firebase Setup & Deployment Guide

## Overview

This guide walks you through setting up Firebase Firestore, deploying security rules, creating indexes, and seeding the database with test data.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project already initialized (maintenance-manager-ae292)
- Node.js and npm installed

## Step 1: Firebase CLI Login

```bash
firebase login
```

Follow the prompts to authenticate with your Google account.

## Step 2: Initialize Firebase Project (if not already done)

If you haven't initialized Firebase in this directory:

```bash
firebase init
```

Select:
- **Firestore**: Configure security rules and indexes
- **Storage**: Configure security rules
- **Hosting** (optional): If you want to deploy the web app

When prompted:
- Use existing project: `maintenance-manager-ae292`
- Firestore rules file: `firestore.rules`
- Firestore indexes file: `firestore.indexes.json`
- Storage rules file: `storage.rules`

## Step 3: Deploy Firestore Security Rules

Deploy the security rules to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

This will upload the rules from `firestore.rules` to your Firebase project.

## Step 4: Deploy Firestore Indexes

Deploy the composite indexes to Firestore:

```bash
firebase deploy --only firestore:indexes
```

This will create all necessary composite indexes defined in `firestore.indexes.json`.

**Note:** Index creation can take several minutes. You can monitor progress in the Firebase Console under Firestore > Indexes.

## Step 5: Deploy Storage Security Rules

Deploy the storage security rules:

```bash
firebase deploy --only storage
```

This will upload the rules from `storage.rules` to Firebase Storage.

## Step 6: Seed the Database with Test Data

You can seed the database using the provided seeder utility.

### Option A: From Browser Console (Recommended for Development)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the browser console (F12)

3. Import and run the seeder:
   ```javascript
   import { quickSeed } from './src/utils/seedDatabase.js';
   quickSeed();
   ```

### Option B: Create a Seed Button in Your App

Add a temporary button to your settings page or create a dedicated admin page:

```jsx
import { quickSeed } from '../utils/seedDatabase';

function SeedButton() {
  const handleSeed = async () => {
    const result = await quickSeed();
    if (result.success) {
      console.log('Database seeded successfully!', result.results);
      alert('Database seeded successfully!');
    } else {
      console.error('Seeding failed:', result.error);
      alert('Seeding failed: ' + result.error);
    }
  };

  return (
    <button onClick={handleSeed} className="bg-blue-600 text-white px-4 py-2 rounded">
      Seed Database
    </button>
  );
}
```

### Option C: Node.js Script (Requires Firebase Admin SDK)

Create a script file `scripts/seed.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Import and run seeder functions here
```

## Step 7: Verify Setup

### Check Firestore Rules
1. Go to Firebase Console
2. Navigate to Firestore Database > Rules
3. Verify your rules are deployed

### Check Indexes
1. Go to Firebase Console
2. Navigate to Firestore Database > Indexes
3. Verify all indexes are building or ready

### Check Storage Rules
1. Go to Firebase Console
2. Navigate to Storage > Rules
3. Verify your storage rules are deployed

### Check Data
1. Go to Firebase Console
2. Navigate to Firestore Database > Data
3. You should see collections: `units`, `turns`, `calendar`, `vendors`, `users`, `activity`

## Step 8: Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `https://localhost:5173`

3. Log in with a test account

4. Verify:
   - Dashboard loads with real data
   - Units are displayed
   - Active turns are shown
   - Calendar events appear
   - Recent activity feed works

## Common Issues & Solutions

### Issue: "Missing or insufficient permissions"

**Solution:** Make sure you're logged in as a user with the proper role. The seeder creates technician accounts. You may need to manually create an admin user profile in Firestore:

1. Go to Firebase Console > Firestore Database
2. Create a document in the `users` collection with your Firebase Auth UID
3. Set `role: "Admin"` and `active: true`

### Issue: "Index not found" errors

**Solution:** Indexes take time to build. Either:
- Wait a few minutes and try again
- Check Firebase Console > Firestore > Indexes to see build status
- Click the link in the error message to create the missing index automatically

### Issue: Seeder fails with authentication errors

**Solution:** Ensure you're authenticated in the app before running the seeder. The seeder requires an authenticated user context.

### Issue: "Document already exists"

**Solution:** The seeder tries to create documents with specific IDs. If you've already seeded once, you'll need to either:
- Delete the existing data from Firebase Console
- Modify the seeder to use different IDs
- Use a different Firebase project for testing

## Deployment to Production

### Deploy All Firebase Resources

```bash
firebase deploy
```

This deploys:
- Firestore rules
- Firestore indexes
- Storage rules
- Hosting (if configured)

### Deploy Specific Resources

```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Firestore indexes
firebase deploy --only firestore:indexes

# Deploy only Storage rules
firebase deploy --only storage

# Deploy only Hosting
firebase deploy --only hosting
```

## Security Best Practices

### Before Going to Production:

1. **Review Security Rules**
   - Test rules thoroughly
   - Ensure users can only access their own data
   - Verify role-based access is working

2. **Enable App Check**
   - Protect your APIs from abuse
   - Configure in Firebase Console > App Check

3. **Set up Backup**
   - Enable daily backups in Firebase Console
   - Configure backup retention policy

4. **Monitor Usage**
   - Set up billing alerts
   - Monitor read/write operations
   - Review security rules logs

5. **Remove Test Data**
   - Delete seeded test data before production
   - Or use a separate Firebase project for development

## Maintenance Tasks

### Update Security Rules

1. Edit `firestore.rules` or `storage.rules`
2. Deploy: `firebase deploy --only firestore:rules` or `firebase deploy --only storage`

### Add New Indexes

1. Edit `firestore.indexes.json`
2. Deploy: `firebase deploy --only firestore:indexes`
3. Wait for indexes to build (check Firebase Console)

### Clean Old Activity Data

Run periodically (monthly recommended):

```javascript
import { deleteOldActivities } from './src/services/activityService';

// Delete activities older than 90 days
await deleteOldActivities(90);
```

### Update Vacant Unit Days

Run daily (can be automated with Cloud Functions):

```javascript
import { updateAllVacantUnitDays } from './src/services/unitsService';

await updateAllVacantUnitDays();
```

## Firebase Console URLs

- **Firebase Console**: https://console.firebase.google.com/project/maintenance-manager-ae292
- **Firestore Database**: https://console.firebase.google.com/project/maintenance-manager-ae292/firestore
- **Storage**: https://console.firebase.google.com/project/maintenance-manager-ae292/storage
- **Authentication**: https://console.firebase.google.com/project/maintenance-manager-ae292/authentication

## Support & Documentation

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Storage Documentation](https://firebase.google.com/docs/storage)
- [Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## Next Steps

After completing this setup:

1. **Integrate Services with UI**
   - Update Dashboard.jsx to use real data from services
   - Replace mock data with Firestore queries

2. **Implement Module Pages**
   - Create Turns page
   - Create Calendar page
   - Create Units page
   - Create Vendors page

3. **Add Real-time Updates**
   - Use Firestore snapshot listeners
   - Update UI automatically when data changes

4. **Implement Photo Upload**
   - Add file upload components
   - Use Firebase Storage SDK
   - Update turn checklist with photo paths

5. **Add User Management**
   - Create admin panel for user management
   - Implement role assignment
   - Add user invitation system
