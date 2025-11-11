/**
 * Create Admin User Utility
 * Creates a user document in Firestore for an existing Firebase Auth user
 *
 * USAGE:
 * 1. Import this function in your app (e.g., from a button or console)
 * 2. Call createAdminUser() to create the admin user profile
 * 3. This is a one-time operation for setting up the initial admin
 *
 * IMPORTANT: This script will sign in the user with their credentials,
 * create the profile, then sign them out. The user can then sign in normally.
 */

import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { createUserProfile } from '../services/usersService';

/**
 * Create admin user profile for Robert Barron
 * UID: GO4odyiO3OTNmUvAknUl0KkFh563
 * Email: robert.barron@greystar.com
 *
 * This function:
 * 1. Signs in the user with their credentials
 * 2. Creates their Firestore user profile
 * 3. Signs them out
 * 4. User can then sign in normally through the app
 */
export async function createAdminUser() {
  const ADMIN_EMAIL = 'robert.barron@greystar.com';
  const ADMIN_PASSWORD = 'ToRememberFor1?';
  const ADMIN_UID = 'GO4odyiO3OTNmUvAknUl0KkFh563';

  const adminUserData = {
    uid: ADMIN_UID,
    email: ADMIN_EMAIL,
    displayName: 'Robert Barron',
    phoneNumber: '',
    role: 'Admin',
    permissions: [
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'units.view',
      'units.create',
      'units.edit',
      'units.delete',
      'turns.view',
      'turns.create',
      'turns.edit',
      'turns.delete',
      'calendar.view',
      'calendar.create',
      'calendar.edit',
      'calendar.delete',
      'vendors.view',
      'vendors.create',
      'vendors.edit',
      'vendors.delete',
      'activity.view',
      'reports.view',
      'settings.edit'
    ],
    active: true,
    emailVerified: true,
    photoURL: null,
    bio: 'Property Manager - Greystar',
    specialties: [],
    certifications: [],
    lastLoginAt: Timestamp.now(),
    totalTurnsCompleted: 0,
    avgTurnCompletionTime: 0,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false
    }
  };

  console.log('Starting admin user profile creation...');
  console.log('Step 1: Signing in with credentials...');

  try {
    // Step 1: Sign in the user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    console.log('✅ Signed in successfully');
    console.log('   UID:', userCredential.user.uid);

    // Verify UID matches
    if (userCredential.user.uid !== ADMIN_UID) {
      console.error('❌ UID mismatch! Expected:', ADMIN_UID, 'Got:', userCredential.user.uid);
      await signOut(auth);
      return {
        success: false,
        error: 'UID mismatch - the authenticated user does not match the expected admin UID'
      };
    }

    console.log('Step 2: Creating Firestore user profile...');

    // Step 2: Create user profile in Firestore
    const result = await createUserProfile(adminUserData.uid, adminUserData);

    if (result.success) {
      console.log('✅ Admin user profile created successfully!');
      console.log('Step 3: Signing out...');

      // Step 3: Sign out the user
      await signOut(auth);

      console.log('✅ Setup complete!');
      console.log('');
      console.log('You can now sign in with:');
      console.log('  Email: robert.barron@greystar.com');
      console.log('  Password: ToRememberFor1?');
      console.log('  Role: Admin');

      return result;
    } else {
      console.error('❌ Failed to create admin user profile:', result.error);

      // Sign out on failure
      await signOut(auth);

      return result;
    }
  } catch (error) {
    console.error('❌ Error during admin user creation:', error);

    // Attempt to sign out if there's an error
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error('Error signing out:', signOutError);
    }

    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

/**
 * Verify if admin user exists
 * This function signs in temporarily to check if the user profile exists
 */
export async function verifyAdminUser() {
  const ADMIN_EMAIL = 'robert.barron@greystar.com';
  const ADMIN_PASSWORD = 'ToRememberFor1?';
  const ADMIN_UID = 'GO4odyiO3OTNmUvAknUl0KkFh563';

  console.log('Verifying admin user...');
  console.log('Step 1: Signing in...');

  try {
    // Step 1: Sign in the user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    console.log('✅ Signed in successfully');

    // Step 2: Get user profile
    const { getUserProfile } = await import('../services/usersService');
    const result = await getUserProfile(ADMIN_UID);

    // Step 3: Sign out
    await signOut(auth);

    if (result.success) {
      console.log('✅ Admin user exists:');
      console.log('  UID:', result.data.uid);
      console.log('  Email:', result.data.email);
      console.log('  Name:', result.data.displayName);
      console.log('  Role:', result.data.role);
      console.log('  Active:', result.data.active);
      return result;
    } else {
      console.log('❌ Admin user not found in USERS collection');
      console.log('   Run createAdminUser() to create the user profile');
      return result;
    }
  } catch (error) {
    console.error('❌ Error verifying admin user:', error);

    // Attempt to sign out if there's an error
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error('Error signing out:', signOutError);
    }

    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

export default {
  createAdminUser,
  verifyAdminUser
};
