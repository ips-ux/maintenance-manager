# Firebase Deployment Guide
## IPS-UX Maintenance Manager

This guide will help you deploy Firebase security rules, indexes, and seed the database with test data.

---

## Prerequisites

- Firebase project: `maintenance-manager-ae292`
- Firebase CLI installed (instructions below)
- Authenticated with Firebase CLI

---

## Step 1: Install Firebase CLI

### Windows (PowerShell - Run as Administrator)
```powershell
npm install -g firebase-tools
```

### Verify Installation
```bash
firebase --version
```

### Login to Firebase
```bash
firebase login
```

This will open your browser to authenticate with your Google account.

---

## Step 2: Verify Project Configuration

Check that you're connected to the correct project:

```bash
firebase projects:list
```

You should see `maintenance-manager-ae292` in the list.

### Set Active Project (if needed)
```bash
firebase use maintenance-manager-ae292
```

---

## Step 3: Deploy Firestore Rules

Deploy security rules to protect your database:

```bash
firebase deploy --only firestore:rules
```

Expected output:
```
✔ Deploy complete!

Firestore Rules
  Rules:  firestore.rules
```

---

## Step 4: Deploy Firestore Indexes

Deploy composite indexes for optimized queries:

```bash
firebase deploy --only firestore:indexes
```

Expected output:
```
✔ Deploy complete!

Firestore Indexes
  Indexes:  firestore.indexes.json
```

**Note:** Indexes may take a few minutes to build. Check status at:
https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/indexes

---

## Step 5: Deploy Storage Rules

Deploy security rules for Firebase Storage:

```bash
firebase deploy --only storage
```

Expected output:
```
✔ Deploy complete!

Storage Rules
  Rules:  storage.rules
```

---

## Step 6: Seed the Database

### Option A: Using the Web Interface (Recommended)

1. Navigate to: http://localhost:5173/seed-database
2. Click "Seed Database" button
3. Wait for the seeding process to complete
4. Verify the results on the page

### Option B: Using Browser Console

1. Open http://localhost:5173 in your browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run:
```javascript
import { seedDatabase } from './src/utils/seedDatabase.js';
const result = await seedDatabase();
console.log(result);
```

---

## Step 7: Verify Deployment

### Check Firestore Console
Visit: https://console.firebase.google.com/project/maintenance-manager-ae292/firestore

You should see the following collections:
- `units` - 120 documents
- `vendors` - 6 documents
- `users` - 3 documents
- `turns` - Multiple documents (for units "In Progress")
- `calendarEvents` - 4 event documents
- `activities` - 5 activity log entries

### Check Rules Status
Visit: https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/rules

The rules should show as "Published" with a recent timestamp.

### Check Indexes Status
Visit: https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/indexes

All indexes should be in "Enabled" state (may take a few minutes to build).

---

## What Data Gets Seeded?

The database seeder creates realistic test data:

### Units (120 total)
- Studios (20): 450-550 sqft
- 1BR/1BA (40): 650-750 sqft
- 2BR/1BA (25): 850-950 sqft
- 2BR/2BA (25): 950-1050 sqft
- 3BR/2BA (10): 1150-1250 sqft
- 8% vacancy rate (~10 vacant units)
- Some units marked "In Progress" with active turns

### Vendors (6 companies)
- CleanPro Services (Carpet)
- CoolAir HVAC (HVAC)
- Perfect Paint Co (Paint)
- FlowRight Plumbing (Plumbing)
- Bright Spark Electric (Electrical)
- ApplianceFix Pro (Appliance)

### Users (3 technicians)
- John Doe - Senior technician (Plumbing, Electrical, HVAC)
- Sarah Miller - Turn specialist (Cleaning, Paint, Repairs)
- Mike Roberts - HVAC specialist (HVAC, Appliances, Carpentry)

### Active Turns
- Generated for vacant units with "In Progress" status
- Each turn has a 12-task checklist with partial completion
- Assigned to different technicians
- Various completion progress (1-8 days in progress)

### Calendar Events (4 events)
- Carpet cleaning today
- Final inspection tomorrow
- Move-in in 2 days
- HVAC service in 3 days

### Activity Log (5 entries)
- Recent task completions
- Vendor scheduling
- Final walkthroughs

---

## Troubleshooting

### Firebase CLI Not Found
```
Error: firebase: command not found
```

**Solution:** Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

### Authentication Error
```
Error: Authentication Error: Your credentials are no longer valid.
```

**Solution:** Re-authenticate:
```bash
firebase login --reauth
```

### Permission Denied
```
Error: Permission denied. Please check your Firebase project permissions.
```

**Solution:** Ensure you have Editor or Owner role in the Firebase project.

### Wrong Project
```
Error: Project 'xxx' doesn't match expected 'maintenance-manager-ae292'
```

**Solution:** Set the correct project:
```bash
firebase use maintenance-manager-ae292
```

### Indexes Not Building
```
Error: Index creation timed out
```

**Solution:** Indexes can take 5-10 minutes to build. Check status in Firebase Console.

### Seeder Fails with Auth Error
```
Error: Missing or insufficient permissions
```

**Solution:**
1. Ensure you're logged in to the app
2. Temporarily update Firestore rules to allow admin access
3. Re-run the seeder
4. Restore production rules

---

## Security Considerations

### During Seeding

The seeder needs to write to Firestore. There are two approaches:

#### Option 1: Use Admin SDK (Server-side)
- Run seeder as a Node.js script with Firebase Admin SDK
- Bypasses security rules
- Most secure for production

#### Option 2: Temporarily Relax Rules (Client-side)
- Modify `firestore.rules` to allow writes during seeding
- Run seeder from browser
- **Important:** Restore strict rules immediately after seeding
- Only use in development environments

### Production Rules

The deployed rules enforce:
- Authentication required for all operations
- Role-based access control (Admin, Manager, Technician)
- Field-level validation
- Immutable fields protection
- User can only edit their own profile (limited fields)

---

## Next Steps

After successful deployment:

1. **Update Dashboard** - Replace mock data with real Firestore queries
2. **Test Authentication** - Ensure login works with seeded users
3. **Test Permissions** - Verify users can only access allowed data
4. **Build Additional Pages** - Units, Turns, Calendar, Vendors
5. **Set Up Hosting** - Deploy the application to Firebase Hosting

---

## Useful Commands

### View Project Info
```bash
firebase projects:list
firebase use
```

### Deploy Everything
```bash
firebase deploy
```

### Deploy Specific Services
```bash
firebase deploy --only firestore
firebase deploy --only storage
firebase deploy --only hosting
```

### View Deployment History
```bash
firebase deploy:history
```

### Rollback Deployment
```bash
firebase deploy:rollback firestore:rules
```

---

## Firebase Console Links

- **Project Overview:** https://console.firebase.google.com/project/maintenance-manager-ae292
- **Firestore Database:** https://console.firebase.google.com/project/maintenance-manager-ae292/firestore
- **Storage:** https://console.firebase.google.com/project/maintenance-manager-ae292/storage
- **Rules:** https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/rules
- **Indexes:** https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/indexes
- **Authentication:** https://console.firebase.google.com/project/maintenance-manager-ae292/authentication

---

## Support

If you encounter issues:

1. Check Firebase Console for error messages
2. Review browser console for client-side errors
3. Verify Firebase CLI is up to date: `npm install -g firebase-tools@latest`
4. Check Firebase Status: https://status.firebase.google.com/

---

**Last Updated:** 2025-11-10
**Project:** IPS-UX Maintenance Manager
**Firebase Project ID:** maintenance-manager-ae292
