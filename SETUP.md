# Maintenance Manager - Setup Guide

## Initial Admin User Setup

This guide explains how to set up your first admin user after deploying the application.

### The Problem: Chicken-and-Egg Scenario

When you first deploy the Maintenance Manager application, you have a unique bootstrap situation:

1. Firebase Authentication has created a user account (with UID)
2. Firestore security rules require a user document in the USERS collection
3. But the user can't create their own document without authentication
4. And they can't authenticate without the document existing

### The Solution: Authenticated Profile Creation

We've implemented a secure solution that:

1. Authenticates the user with their Firebase Auth credentials
2. Creates their user profile document in Firestore
3. Signs them out
4. User can then sign in normally through the application

### Step-by-Step Instructions

#### 1. Start the Development Server

```bash
npm run dev
```

The server will start on http://localhost:5173 (or another port if 5173 is in use).

#### 2. Navigate to Setup Admin Page

Open your browser and go to:
```
http://localhost:5173/setup-admin.html
```

You should see the "Admin User Setup" page with your credentials displayed:

- **Email**: robert.barron@greystar.com
- **Password**: ToRememberFor1?
- **UID**: GO4odyiO3OTNmUvAknUl0KkFh563
- **Role**: Admin

#### 3. Create Admin User Profile

Click the **"Create Admin User Profile"** button.

The script will:
1. Sign in with your credentials
2. Create your user document in the USERS collection
3. Sign you out automatically

You should see a success message: "Success! Admin user profile created. You can now sign in with your credentials."

#### 4. Verify User Exists (Optional)

Click the **"Verify User Exists"** button to confirm the user profile was created successfully.

This will show your user details:
- UID
- Email
- Role
- Active status

#### 5. Sign In to the Application

Navigate to the main application:
```
http://localhost:5173/
```

Sign in with your credentials:
- **Email**: robert.barron@greystar.com
- **Password**: ToRememberFor1?

You should now see your email in the header (not "dev@maintenance.com") and have full admin access.

---

## Technical Details

### How It Works

The setup script (`src/utils/createAdminUser.js`) performs these operations:

1. **Authentication**: Signs in the user using `signInWithEmailAndPassword()`
2. **Profile Creation**: Creates the user document with all required fields
3. **Cleanup**: Signs out the user to prevent unauthorized access

### Firestore Security Rules

The USERS collection rules allow authenticated users to create their own profile:

```javascript
match /USERS/{userId} {
  allow create: if isAuthenticated() &&
                   request.auth.uid == userId &&
                   hasRequiredFields(['uid', 'email', 'displayName', 'role',
                                     'active', 'notificationSettings']) &&
                   request.resource.data.uid == request.auth.uid;
}
```

Key security features:
- User must be authenticated
- User can only create their own profile (userId matches auth.uid)
- Required fields must be present
- UID in document must match authenticated user's UID

### User Profile Structure

The admin user profile includes:

```javascript
{
  uid: string,
  email: string,
  displayName: string,
  role: 'Admin',
  permissions: [...],
  active: boolean,
  emailVerified: boolean,
  notificationSettings: {
    emailNotifications: boolean,
    pushNotifications: boolean,
    smsNotifications: boolean
  },
  totalTurnsCompleted: number,
  avgTurnCompletionTime: number,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp
}
```

---

## Troubleshooting

### Issue: "Missing or insufficient permissions"

**Cause**: The user is not authenticated when trying to create the profile.

**Solution**: The updated script now handles authentication automatically. If you still see this error:

1. Make sure Firestore rules are deployed:
   ```bash
   npx firebase deploy --only firestore:rules
   ```

2. Check that the user exists in Firebase Authentication console
3. Verify the UID in `createAdminUser.js` matches the Firebase Auth UID

### Issue: "User already exists"

**Cause**: The user profile has already been created.

**Solution**: This is normal! You can proceed to sign in. The setup-admin.html page will detect this and show "User profile already exists! You can sign in now."

### Issue: Cannot access setup-admin.html

**Cause**: The file is in the project root, not in the public directory.

**Solution**: The file is at `/setup-admin.html` in the project root. Make sure you're accessing:
```
http://localhost:5173/setup-admin.html
```

### Issue: Authentication fails

**Cause**: Incorrect credentials or user not in Firebase Auth.

**Solution**:
1. Verify the user exists in Firebase Console → Authentication
2. Check the credentials in `createAdminUser.js` match your Firebase Auth user
3. Ensure the password is correct (default: ToRememberFor1?)

---

## Post-Setup: Managing Users

Once you're signed in as admin, you can:

1. Create additional users through the Users management page
2. Assign roles (Admin, Manager, Technician, Viewer)
3. Set permissions and manage user access
4. Deactivate/reactivate users

All new users will have their profiles created automatically through the normal user creation flow.

---

## Security Notes

- The setup-admin.html page should be removed or protected in production
- User credentials are hardcoded in the script for bootstrap purposes only
- After initial setup, all user management should go through the admin interface
- Consider rotating the admin password after initial setup
- Monitor Firebase Authentication for unauthorized sign-in attempts

---

## Firebase Console Access

To view your setup in Firebase Console:

1. Go to https://console.firebase.google.com/
2. Select project: maintenance-manager-ae292
3. Navigate to:
   - **Authentication** → Users → See all Firebase Auth users
   - **Firestore Database** → USERS collection → See user documents

---

## Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify Firebase rules are deployed
3. Confirm the user exists in Firebase Authentication
4. Review the Firestore USERS collection to see if the document exists

For additional help, refer to:
- Firebase Authentication docs: https://firebase.google.com/docs/auth
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security
