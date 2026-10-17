# Faculty Consultation Booking System

A campus web application for students to request consultations with faculty members, faculty to publish available time slots and approve or reject requests, and administrators to monitor accounts and booking activity.

## Team

- Axl Rama Doctolero
- Rizza Pabelonia
- Francis Jay Tagum

## Technology

- Node.js (18 or later) and Express
- EJS templates, HTML, CSS
- MySQL with `mysql2`
- `express-session` with MySQL-backed session storage
- `bcrypt` password hashing, `dotenv` environment configuration, and Helmet security headers

## Features

### Student

- Create a student account with an `@my.cspc.edu.ph` email and log in. Demo student and faculty test emails are also supported.
- Log in and view personal booking history.
- Request a consultation with a faculty member.
- Select a future date/time, duration, topic, and optional notes.
- View booking status: pending, approved, rejected, cancelled, or completed.
- Cancel eligible future bookings or request a reschedule. A rescheduled booking returns to pending approval.

### Faculty

- Create a faculty account with an `@my.cspc.edu.ph` email and log in.
- Publish and deactivate/activate availability slots.
- View consultation requests and student details.
- Approve or reject pending requests.
- Mark an approved past consultation as completed.

### Administrator

- View summary counts and recent booking records.
- View user accounts and activate/deactivate accounts.
- Role-protected administrator dashboard.

### Validation and access control

- Passwords are hashed with bcrypt.
- Sessions are stored in MySQL; session ID is regenerated after login.
- Prepared SQL statements are used for user-provided values.
- Server-side checks validate required values, topic/notes length, future dates, durations, availability, and schedule conflicts.
- Students can only view and change their own bookings. Faculty can only manage their own availability and assigned bookings. Admin pages require the admin role.

## Project structure

```text
faculty-consultation-booking/
├── app.js
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── bookings.js
│   ├── faculty.js
│   └── admin.js
├── public/
│   └── styles.css
├── views/
│   ├── partials/
│   ├── login.ejs
│   ├── register.ejs
│   ├── student-bookings.ejs
│   ├── faculty-dashboard.ejs
│   ├── admin-dashboard.ejs
│   └── error.ejs
├── schema.sql
├── seed.js
├── utils.js
├── requirements-document.md
├── AI_DISCLOSURE.md
├── GITHUB_WORKFLOW.md
├── TEST_PLAN.md
├── LICENSE
├── .env.example
└── package.json
```

## Prerequisites

1. Install Node.js 18+ and npm.
2. Install and start MySQL. XAMPP users should start **MySQL** in the XAMPP Control Panel.
3. Have a MySQL account that can create/use the project database.

## Installation and setup

### 1. Create the database

Open phpMyAdmin or a MySQL client and import `schema.sql`. This creates the `faculty_consultation_booking` database and required tables.

### 2. Configure environment variables

Copy `.env.example` to `.env` and set the values for your own computer. Example for a typical local XAMPP setup:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=use-a-long-random-secret-here
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=faculty_consultation_booking
```

If your MySQL root account has a password, enter it as `DB_PASSWORD`. Do not commit `.env`.

### 3. Install packages

From a terminal opened in the project folder:

```bash
npm install
```

### 4. Create demo accounts and an initial faculty availability slot

```bash
npm run seed
```

Demo accounts are reset to these values whenever the seed command is run:

| Role    | Email                 | Password      |
| ------- | --------------------- | ------------- |
| Student | `student@example.com` | `Student123!` |
| Faculty | `faculty@example.com` | `Faculty123!` |
| Admin   | `admin@example.com`   | `Admin123!`   |

These are development-only credentials. Do not use them for a real deployment.

### 5. Run the application

```bash
npm start
```

Open <http://localhost:3000> in your browser. Stop the server with `Ctrl+C`.

## Suggested demonstration flow

1. Log in as faculty and check or publish a future availability slot.
2. Log in as student in another browser/incognito window and submit a consultation request during that slot.
3. Return to faculty and approve or reject the request.
4. Return to student and verify the updated status. Try rescheduling or cancelling a future booking.
5. Log in as admin and show summary cards, accounts, and recent bookings.
6. Try opening `/admin` as a student and `/faculty` as a student. The system should return an access-denied page.

## Testing

Follow `TEST_PLAN.md`. Test valid and invalid login, access restrictions, booking creation, schedule conflicts, status changes, cancellation, rescheduling, and persistent records after a refresh or restart.

## Known limitations

- This is a coursework prototype, not a production-ready campus service.
- There is no email notification, calendar integration, or password-reset workflow. Admin accounts cannot be created through registration.
- Faculty availability is represented by date/time ranges; the prototype does not support recurring weekly schedules.
- Conflict checking is application-level; a production deployment should add stronger concurrency protection and transactional locking.
- Date/time handling relies on the local server/database timezone. Set consistent timezone settings before real use.
- Demo seed accounts are public examples and must be changed for any non-demo use.
- The app uses basic form handling and does not include a dedicated CSRF token library. Add CSRF protection, production-grade logging, rate limiting, secure deployment configuration, and formal security testing before deployment.

## License

Released under the MIT License; see `LICENSE`.
