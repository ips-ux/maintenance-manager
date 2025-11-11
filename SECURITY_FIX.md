# Security Fix: Exposed Firebase API Key

## ⚠️ CRITICAL: API Key Has Been Exposed

Your Firebase API key was committed to the repository and is now publicly visible. **You must rotate it immediately.**

## Immediate Actions Required

### Step 1: Rotate Your Firebase API Key

1. Go to Firebase Console: https://console.firebase.google.com/project/maintenance-manager-ae292/settings/general
2. Scroll down to "Your apps" section
3. Find your web app
4. Click the settings gear icon → "Regenerate secret"
5. **Copy the new API key** - you'll need it for Step 3

### Step 2: Restrict API Key (Recommended)

1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials?project=maintenance-manager-ae292
2. Find your API key (the one that was exposed)
3. Click on it to edit
4. Under "API restrictions":
   - Select "Restrict key"
   - Check only: **Firebase Installations API**, **Firebase Cloud Messaging API**, **Firebase Remote Config API**
5. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     - `localhost:*` (for development)
     - `maintenance-manager-ae292.web.app` (if using Firebase Hosting)
     - `maintenance-manager-ae292.firebaseapp.com` (if using Firebase Hosting)
     - Your production domain (if applicable)
6. Click "Save"

### Step 3: Create .env File

1. Create a new file named `.env` in the project root

2. Add the following content (replace `your-new-api-key-here` with your regenerated API key):
   ```env
   VITE_FIREBASE_API_KEY=your-new-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=maintenance-manager-ae292.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=maintenance-manager-ae292
   VITE_FIREBASE_STORAGE_BUCKET=maintenance-manager-ae292.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=112715689411
   VITE_FIREBASE_APP_ID=1:112715689411:web:a8fbec735d776fe00aa176
   ```

   **Important**: Replace `your-new-api-key-here` with the API key you regenerated in Step 1!

3. **Verify `.env` is in `.gitignore`** (it should be now)

### Step 4: Test the Application

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Verify the app still works correctly

### Step 5: Commit the Security Fix

```bash
git add .env.example .gitignore src/lib/firebase.js SECURITY_FIX.md
git commit -m "Security: Move Firebase config to environment variables

- Remove hardcoded API key from firebase.js
- Add .env.example template
- Update .gitignore to exclude .env files
- Add environment variable validation"
git push
```

## What Changed?

1. **firebase.js**: Now reads from environment variables instead of hardcoded values
2. **.env.example**: Template file showing required environment variables
3. **.gitignore**: Updated to exclude `.env` files from version control
4. **Validation**: Added error checking to ensure env vars are loaded

## Important Notes

- ⚠️ **The old API key is still in git history** - consider using `git filter-branch` or BFG Repo-Cleaner to remove it (advanced)
- ✅ **New commits won't expose the key** - `.env` is now gitignored
- 🔒 **API keys in client-side code are still visible** - but restricting them limits damage
- 📝 **For production**: Consider using Firebase App Check for additional security

## Additional Security Recommendations

1. **Enable Firebase App Check**: Adds device attestation
   - https://console.firebase.google.com/project/maintenance-manager-ae292/appcheck

2. **Review Firestore Security Rules**: Ensure they're properly configured
   - https://console.firebase.google.com/project/maintenance-manager-ae292/firestore/rules

3. **Monitor API Usage**: Check for unusual activity
   - https://console.cloud.google.com/apis/dashboard?project=maintenance-manager-ae292

4. **Set Up Alerts**: Get notified of unusual API usage

## Need Help?

If you encounter issues:
1. Check that all environment variables are set in `.env`
2. Verify the variable names start with `VITE_` (required for Vite)
3. Restart your dev server after creating/updating `.env`
4. Check browser console for error messages

---

**Status**: ✅ Code updated to use environment variables
**Action Required**: ⚠️ Rotate API key in Firebase Console

