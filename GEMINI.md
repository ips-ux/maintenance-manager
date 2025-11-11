# Project Overview

This is a **Maintenance Manager** application built with React. It's designed to help property managers track and manage maintenance tasks, particularly the "turn" process for rental units.

**Key Technologies:**

*   **Frontend:** React, Vite
*   **Styling:** Tailwind CSS
*   **Routing:** React Router
*   **Authentication:** Firebase Authentication
*   **Charts:** Recharts

**Architecture:**

The application follows a standard React project structure.

*   `src/pages`: Contains the main pages of the application (e.g., `Dashboard`, `Login`, `Settings`).
*   `src/features`: Organizes code by feature (e.g., `auth`, `turns`, `units`).
*   `src/components`: Contains reusable UI components.
*   `src/lib`: Contains library initializations, like Firebase.
*   `src/hooks`: Contains custom React hooks.
*   `src/styles`: Contains global styles.

Authentication is handled using Firebase and a React Context `AuthProvider`. Routes are protected, and unauthenticated users are redirected to the login page.

# Building and Running

**1. Install Dependencies:**

```bash
npm install
```

**2. Run the Development Server:**

```bash
npm run dev
```

This will start the Vite development server, and you can view the application at `http://localhost:5173` (or another port if 5173 is in use).

**3. Build for Production:**

```bash
npm run build
```

This will create a `dist` folder with the production-ready files.

**4. Lint the Code:**

```bash
npm run lint
```

This will run ESLint to check for code quality and style issues.

# Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Utility classes are preferred over custom CSS.
*   **Components:** Components are organized into `components/ui` for generic, reusable components and `components/layout` for page structure components.
*   **State Management:** For global state like authentication, the project uses React's Context API. For local component state, `useState` and `useReducer` are used.
*   **File Naming:** Components and pages are named using PascalCase (e.g., `Dashboard.jsx`).
