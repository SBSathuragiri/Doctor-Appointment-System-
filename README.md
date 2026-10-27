Doctor Appointment System — Client
Frontend web application for the Doctor Appointment System. It provides separate experiences for patients, doctors, and administrators.
Tech stack
- React
- TypeScript
- Vite
- React Router
Check client/package.json for the exact dependency and script list.
Prerequisites
- Node.js version supported by the project
- npm
- The backend API running locally or deployed
Setup
From the repository root:
cd client
npm install
Create a .env file in the client directory if the API helper uses a Vite environment variable for the backend URL. Vite-exposed variables must start with VITE_. For example:
VITE_API_BASE_URL=http://localhost:5000
Use the exact variable name expected by client/src/services/api.ts. If the API helper uses a relative URL with a Vite proxy instead, configure that existing approach rather than adding this variable unnecessarily.

Never put database credentials, session secrets, or other server-only secrets in frontend environment variables. Vite variables are included in the browser bundle.
Run locally
npm run dev
Vite typically prints a local URL such as http://localhost:5173.

Other common scripts, if defined in client/package.json, include:
npm run build
npm run preview
Main features
Patient
- Register and sign in
- Browse doctors and view fees
- View doctor availability
- Book available appointment slots
- View appointments and prescriptions
- Receive notifications
Doctor
- Register and submit required certificates
- Manage profile and availability
- View appointments
- Confirm appointments and complete consultations
- Add prescriptions
Admin
- Review and approve doctor registrations
- Monitor patients and appointments
- Configure commission and application branding
- Manage administrative notifications/settings
Available features depend on the routes and components implemented in the current branch.
Routing and access control
The app uses React Router with role-aware routes for patient, doctor, and admin dashboards. Public pages include login and registration pages. The public-route logic can redirect an authenticated user to the dashboard for their role.

Frontend route guards improve navigation and user experience, but backend endpoints must independently enforce authentication and role permissions.
Connecting to the backend
Check client/src/services/api.ts to confirm how the API base URL is configured. Make sure it points to the running backend. For session-based authentication, requests must include cookies/credentials, and the backend must allow the frontend origin through CORS.

For local development, keep the frontend and backend URLs consistent with your actual configuration.
Build
npm run build
Resolve any TypeScript or build errors before deploying. To preview the built app locally, if the script exists:
npm run preview
Deployment
Deploy the client as a static site using the build command defined by client/package.json (commonly npm run build) and the generated Vite output directory (commonly dist).

Configure the production API URL using the environment variable or URL strategy implemented in client/src/services/api.ts. If using React Router history routes, configure the hosting provider to rewrite application routes to index.html.
Troubleshooting
- API requests fail: verify the API base URL and that the backend is running.
- Login succeeds but the session disappears: check cookie credentials, CORS, HTTPS, and backend session configuration.
- Refresh on a nested route returns 404: configure a single-page-app fallback to index.html.
- Environment variable is undefined: confirm the variable name matches the API helper and starts with VITE_ if it is read by Vite.
