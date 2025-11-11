import { useEffect, useState, useContext } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { AuthContext } from './AuthContext';
import { getUserProfile, updateLastLogin } from '../../services/usersService';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile from Firestore
        try {
          const userProfileResult = await getUserProfile(firebaseUser.uid);

          if (userProfileResult.success) {
            // Merge Firebase Auth data with Firestore profile
            const fullUserData = {
              ...firebaseUser,
              ...userProfileResult.data
            };
            setUser(fullUserData);

            // Update last login timestamp
            await updateLastLogin(firebaseUser.uid);
          } else {
            // User exists in Firebase Auth but not in Firestore
            console.error('User profile not found in Firestore:', userProfileResult.error);
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(firebaseUser);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Export useAuth hook for consuming the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
