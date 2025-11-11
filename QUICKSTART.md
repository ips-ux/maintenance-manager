# Quick Start Guide
## Deploy Firebase & Seed Database

Follow these steps to get your database up and running quickly.

---

## 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

---

## 2. Login to Firebase

```bash
firebase login
```

---

## 3. Deploy Firebase Configuration

Run all deployment commands at once:

```bash
npm run deploy:firebase
```

Or deploy individually:

```bash
# Deploy Firestore rules
npm run deploy:rules

# Deploy Firestore indexes
npm run deploy:indexes

# Deploy Storage rules
npm run deploy:storage
```

---

## 4. Seed the Database

### Easy Way (Web UI):

1. Start your dev server (if not running):
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:5173/seed-database

3. Click "Seed Database" button

4. Wait for completion (~30 seconds)

---

## 5. Verify in Firebase Console

Check your data:
https://console.firebase.google.com/project/maintenance-manager-ae292/firestore

You should see:
- ✅ 120 units
- ✅ 6 vendors
- ✅ 3 users
- ✅ Active turns
- ✅ Calendar events
- ✅ Activity logs

---

## Troubleshooting

**Firebase CLI not found?**
```bash
npm install -g firebase-tools
```

**Wrong project?**
```bash
firebase use maintenance-manager-ae292
```

**Need to re-login?**
```bash
firebase login --reauth
```

---

## What's Next?

- View your data in the Dashboard
- Test user authentication
- Build additional features

For detailed information, see: [FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md)
