# Maintenance Manager

A comprehensive property maintenance management system built with React, Firebase, and Vite.

## Features

- Unit and turn management
- Technician assignment and tracking
- Calendar and scheduling
- Vendor management
- Activity logging
- Role-based access control (Admin, Manager, Technician, Viewer)
- Real-time data synchronization with Firestore
- Secure authentication with Firebase Auth

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase project configured
- Firebase CLI installed (`npm install -g firebase-tools`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration

4. Start development server:
   ```bash
   npm run dev
   ```

### First-Time Setup

After deploying the application for the first time, you need to create your admin user profile.

**Follow the detailed instructions in [SETUP.md](./SETUP.md)**

Quick steps:
1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/setup-admin.html`
3. Click "Create Admin User Profile"
4. Sign in at the main application

## Tech Stack

- **Frontend**: React 19, React Router 7
- **State Management**: Redux Toolkit with React-Redux
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Charts**: Recharts
- **Date Management**: date-fns

## Project Structure

```
maintenance-manager/
├── src/
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-based modules (auth, turns, etc.)
│   ├── pages/             # Page components
│   ├── services/          # Firebase service layer
│   ├── store/             # Redux store configuration
│   ├── utils/             # Utility functions
│   └── lib/               # Third-party library configurations
├── public/                # Static assets
├── firestore.rules        # Firestore security rules
├── storage.rules          # Firebase Storage rules
└── setup-admin.html       # Admin user setup utility

```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Firebase Deployment

### Deploy Firestore Rules

```bash
npx firebase deploy --only firestore:rules
```

### Deploy Storage Rules

```bash
npx firebase deploy --only storage
```

### Deploy Hosting

```bash
npm run build
npx firebase deploy --only hosting
```

## Security

- Role-based access control with Firestore security rules
- Authentication required for all operations
- Field-level validation in security rules
- Activity logging for audit trails

## Documentation

- [SETUP.md](./SETUP.md) - Initial setup and admin user creation
- [roadmap.md](./roadmap.md) - Feature roadmap and development plan

## Firebase Project

- **Project ID**: maintenance-manager-ae292
- **Console**: https://console.firebase.google.com/project/maintenance-manager-ae292/overview

## License

Proprietary - Greystar Property Management

## Support

For issues or questions, check the browser console for detailed error messages and refer to the setup documentation.
