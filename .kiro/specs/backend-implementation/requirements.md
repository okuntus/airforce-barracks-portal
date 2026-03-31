# Requirements Document

## Introduction

The Airforce Information Portal backend is scaffolded but not yet production-ready. The Express + MongoDB API exists with routes for auth, alerts, events, and announcements, but the frontend still falls back to mock data, the Auth page only supports demo login, environment configuration is incomplete, there is no admin seed script, input validation is minimal, and there is no test coverage or deployment setup. This feature covers everything needed to fully implement, harden, and connect the backend so the portal operates end-to-end on real data.

## Glossary

- **API**: The Express REST API running in `backend/`
- **Auth_Page**: The React login/signup page at `community-app/src/pages/Auth.jsx`
- **AuthContext**: The React context at `community-app/src/contexts/AuthContext.jsx` that manages session state
- **Admin_User**: A MongoDB User document with `role: "admin"` used to manage portal content
- **Seed_Script**: A Node.js script that creates the initial Admin_User in the database
- **JWT**: JSON Web Token used for stateless authentication between the frontend and API
- **Mock_Fallback**: The pattern in frontend pages where `mockData.js` is used when the API is unreachable
- **Protected_Route**: An API endpoint that requires a valid JWT in the `Authorization` header
- **Rate_Limiter**: The `express-rate-limit` middleware applied to `/api/` routes
- **Validator**: Input validation logic applied to incoming request bodies before database writes
- **CORS**: Cross-Origin Resource Sharing configuration controlling which origins may call the API
- **Env_Config**: Environment variables loaded via `dotenv` from a `.env` file
- **Health_Endpoint**: The `GET /api/health` route that reports API liveness

## Requirements

---

### Requirement 1: Environment Configuration

**User Story:** As a developer, I want all sensitive values and environment-specific settings managed through environment variables, so that the application can be deployed to different environments without code changes.

#### Acceptance Criteria

1. THE API SHALL load `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, and `CLIENT_URL` from Env_Config at startup.
2. IF `JWT_SECRET` is the literal string `"fallback_secret"` at startup, THEN THE API SHALL log a warning to the console indicating that a production secret must be set.
3. THE repository SHALL include a `.env.example` file listing all required environment variable keys with placeholder values and inline comments.
4. THE repository SHALL include `.env` in `.gitignore` so that secrets are never committed to version control.

---

### Requirement 2: Admin User Seeding

**User Story:** As a developer, I want a script that creates an initial admin user in the database, so that I can log in and manage content immediately after deployment.

#### Acceptance Criteria

1. THE Seed_Script SHALL accept `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from Env_Config or command-line arguments.
2. WHEN the Seed_Script is executed and no User document with the given email exists, THE Seed_Script SHALL create a User document with `role: "admin"` and a bcrypt-hashed password.
3. WHEN the Seed_Script is executed and a User document with the given email already exists, THE Seed_Script SHALL skip creation and log a message indicating the user already exists.
4. IF the Seed_Script encounters a database connection error, THEN THE Seed_Script SHALL log the error and exit with a non-zero exit code.
5. THE `backend/package.json` SHALL include a `"seed"` npm script that invokes the Seed_Script.

---

### Requirement 3: Input Validation

**User Story:** As a developer, I want all API endpoints to validate incoming request bodies, so that malformed or malicious data is rejected before reaching the database.

#### Acceptance Criteria

1. WHEN a `POST /api/auth/register` request is received with an `email` field that is not a valid email address format, THE Validator SHALL return HTTP 400 with a descriptive error message.
2. WHEN a `POST /api/auth/register` request is received with a `password` field shorter than 6 characters, THE Validator SHALL return HTTP 400 with a descriptive error message.
3. WHEN a `POST /api/alerts` request is received with a `severity` value not in `["low", "medium", "high", "warning", "info"]`, THE Validator SHALL return HTTP 400 with a descriptive error message.
4. WHEN a `POST /api/events` request is received with a `date` field that cannot be parsed as a valid ISO 8601 date, THE Validator SHALL return HTTP 400 with a descriptive error message.
5. WHEN a `POST /api/announcements` request is received with a `priority` value not in `["low", "medium", "high"]`, THE Validator SHALL return HTTP 400 with a descriptive error message.
6. WHEN any validated field exceeds its maximum allowed length (title: 200 characters, message/content: 5000 characters), THE Validator SHALL return HTTP 400 with a descriptive error message.

---

### Requirement 4: Auth Page — Real Login and Registration

**User Story:** As a portal user, I want to log in and register using my real credentials against the backend API, so that my account is persisted and I can access protected content.

#### Acceptance Criteria

1. WHEN a user submits the login form on the Auth_Page with valid credentials, THE Auth_Page SHALL call `authApi.login()` and on success store the returned JWT via `authApi.setToken()` and navigate to the home route.
2. WHEN a user submits the login form on the Auth_Page and the API returns an error, THE Auth_Page SHALL display the error message returned by the API without navigating away.
3. WHEN a user submits the signup form on the Auth_Page with valid fields, THE Auth_Page SHALL call `authApi.register()` and on success store the returned JWT and navigate to the home route.
4. WHEN a user submits the signup form on the Auth_Page and the passwords do not match, THE Auth_Page SHALL display a validation error before making any API call.
5. WHILE the Auth_Page is awaiting an API response, THE Auth_Page SHALL display a loading indicator and disable the submit button to prevent duplicate submissions.
6. THE Auth_Page SHALL retain the demo login buttons so that the portal remains usable without a live backend.

---

### Requirement 5: Frontend API Integration — Remove Mock Fallback Dependency

**User Story:** As a portal user, I want the application to display real data from the database, so that content created by admins is immediately visible to all users.

#### Acceptance Criteria

1. WHEN the API returns a non-empty array for alerts, events, or announcements, THE frontend page SHALL render the API data and SHALL NOT merge it with mock data.
2. WHEN the API is unreachable or returns an error, THE frontend page SHALL display a user-visible error message indicating that data could not be loaded, rather than silently substituting mock data.
3. THE `AuthContext` SHALL restore a user session on page load by calling `authApi.me()` when a JWT is present in localStorage, and SHALL clear the token if the call returns a 401 response.
4. WHEN `authApi.me()` returns a user with `role: "admin"`, THE AuthContext SHALL set `userRole` to `"admin"` so that admin-only UI elements are shown.

---

### Requirement 6: CORS and Security Hardening

**User Story:** As a security-conscious developer, I want the API to enforce strict CORS rules and security headers, so that only the intended frontend origin can make cross-origin requests.

#### Acceptance Criteria

1. THE API SHALL restrict CORS to the origin specified by `CLIENT_URL` in Env_Config.
2. IF a request arrives from an origin not matching `CLIENT_URL`, THEN THE API SHALL reject it with HTTP 403.
3. THE API SHALL apply `helmet()` middleware to set secure HTTP response headers on all routes.
4. THE Rate_Limiter SHALL allow a maximum of 100 requests per 15-minute window per IP address on all `/api/` routes.
5. WHEN the Rate_Limiter threshold is exceeded, THE API SHALL return HTTP 429 with a message indicating the client should retry after the window resets.

---

### Requirement 7: Consistent Error Handling

**User Story:** As a frontend developer, I want all API errors to follow a consistent JSON shape, so that the frontend can reliably parse and display error messages.

#### Acceptance Criteria

1. THE API SHALL return all error responses as JSON objects with at minimum a `message` string field.
2. WHEN an unhandled exception reaches the global error handler, THE API SHALL return HTTP 500 with `{ "message": "Internal server error" }` and SHALL log the full stack trace to the console.
3. WHEN a route receives a MongoDB `CastError` (e.g., invalid ObjectId), THE API SHALL return HTTP 400 with a descriptive message rather than HTTP 500.
4. WHEN a route receives a MongoDB duplicate key error (code 11000), THE API SHALL return HTTP 409 with a message indicating the resource already exists.
5. THE API SHALL return HTTP 404 with `{ "message": "Route not found" }` for any request path that does not match a registered route.

---

### Requirement 8: PUT/PATCH Update Endpoints

**User Story:** As an admin, I want to update existing alerts, events, and announcements, so that I can correct mistakes or change details after initial creation.

#### Acceptance Criteria

1. WHEN a `PUT /api/alerts/:id` request is received with a valid JWT and `role: "admin"`, THE API SHALL update the Alert document and return the updated document with HTTP 200.
2. WHEN a `PUT /api/events/:id` request is received with a valid JWT and `role: "admin"`, THE API SHALL update the Event document and return the updated document with HTTP 200.
3. WHEN a `PUT /api/announcements/:id` request is received with a valid JWT and `role: "admin"`, THE API SHALL update the Announcement document and return the updated document with HTTP 200.
4. IF a `PUT` request targets a document ID that does not exist, THEN THE API SHALL return HTTP 404.
5. IF a `PUT` request is made without a valid JWT, THEN THE API SHALL return HTTP 401.

---

### Requirement 9: Health Check and Readiness

**User Story:** As a DevOps engineer, I want a health check endpoint that reports the API and database status, so that load balancers and monitoring tools can verify the service is ready to handle traffic.

#### Acceptance Criteria

1. THE Health_Endpoint SHALL return HTTP 200 with a JSON body containing `status`, `timestamp`, and `db` fields.
2. WHILE the MongoDB connection is established, THE Health_Endpoint SHALL set `db` to `"connected"`.
3. IF the MongoDB connection is not established, THEN THE Health_Endpoint SHALL set `db` to `"disconnected"` and return HTTP 503.
4. THE Health_Endpoint SHALL NOT require authentication.

---

### Requirement 10: Automated Tests

**User Story:** As a developer, I want automated tests for the API routes and middleware, so that regressions are caught before deployment.

#### Acceptance Criteria

1. THE test suite SHALL include at least one test for each of the following: `POST /api/auth/login` (valid credentials), `POST /api/auth/login` (invalid credentials), `GET /api/alerts` (authenticated), `GET /api/alerts` (unauthenticated), `POST /api/alerts` (admin), and `POST /api/alerts` (non-admin).
2. WHEN the test suite is run, THE test suite SHALL use an in-memory or isolated test database so that production data is not affected.
3. THE `backend/package.json` SHALL include a `"test"` npm script that executes the test suite and exits with a non-zero code on failure.
4. FOR ALL routes that require authentication, the test suite SHALL verify that requests without a JWT return HTTP 401.

---

### Requirement 11: Deployment Configuration

**User Story:** As a developer, I want deployment configuration files and scripts, so that the backend can be deployed to a production environment with minimal manual steps.

#### Acceptance Criteria

1. THE repository SHALL include a `Procfile` or equivalent start configuration declaring `web: node backend/server.js` for platform-as-a-service deployments.
2. THE `backend/package.json` SHALL specify a `"engines"` field declaring the minimum supported Node.js version.
3. THE repository SHALL include a `README` section documenting the steps to run the backend locally, including required environment variables, the seed command, and the start command.
4. THE frontend `community-app/.env.example` SHALL include a `VITE_API_URL` entry pointing to the production API base URL placeholder.
