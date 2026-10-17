# Requirements Document
## Faculty Consultation Booking System — Campus System Midterm, Round 1

**Team members:** Jay, Rizza, Axl  
**Technology:** Node.js, Express, EJS, HTML, CSS, JavaScript, MySQL  
**Document status:** Initial requirements for the academic prototype

## 1. Project overview

The Faculty Consultation Booking System provides a central way for students to request consultation times with faculty members. Faculty members publish availability and manage incoming requests. Administrators monitor accounts and booking activity.

### Problem addressed

Informal consultation arrangements can make it difficult for students and faculty to coordinate schedules and keep a clear record of request status. The system centralizes booking requests, availability, decisions, and booking history.

### Main objective

Develop a working campus web application with functional pages, forms, persistent data, login/session management, role-based access control, and server-side input validation, consistent with the Round 1 project instructions.

## 2. Users and stakeholders

| User/stakeholder | Description | Main needs |
|---|---|---|
| Student | Requests consultations with faculty | Find faculty, request a time, track status, reschedule or cancel eligible bookings |
| Faculty member | Provides consultation time and handles requests | Publish availability, review requests, approve/reject, track consultations |
| System administrator | Maintains access and monitors system use | View account list, deactivate/reactivate accounts, review booking summaries |
| Course instructor/evaluator | Assesses the project and team workflow | Verify requirements, functioning application, security basics, documentation, and GitHub evidence |
| Development team | Builds and maintains the prototype | Clear scope, testable requirements, traceable issues and code contributions |

## 3. Functional requirements

| ID | Requirement | Acceptance evidence |
|---|---|---|
| FR-01 | The system shall allow active users to log in using email and password. | Valid login creates a session; invalid credentials are rejected. |
| FR-02 | The system shall allow authenticated users to log out. | Logout destroys the session and returns to login. |
| FR-03 | The system shall enforce role-based access for student, faculty, and admin pages. | A student cannot access faculty/admin routes; direct URL attempts are denied. |
| FR-04 | A student shall be able to view active faculty accounts. | Faculty options appear in the student booking form. |
| FR-05 | A student shall be able to submit a consultation request with faculty, topic, start time, duration, and optional notes. | Valid request is saved with pending status. |
| FR-06 | The system shall check that a requested time falls within active faculty availability. | Out-of-slot request is rejected with a message. |
| FR-07 | The system shall prevent overlapping pending/approved bookings for the same faculty member. | Conflicting request is rejected. |
| FR-08 | A student shall be able to view their booking history and status. | Only the signed-in student's records are shown. |
| FR-09 | A student shall be able to cancel an eligible future pending or approved booking. | Status changes to cancelled; ineligible changes are refused. |
| FR-10 | A student shall be able to request rescheduling of an eligible future booking. | New time is validated and booking returns to pending status. |
| FR-11 | A faculty member shall be able to create availability slots. | Valid future slot is stored and displayed. |
| FR-12 | A faculty member shall be able to activate/deactivate their own availability slots. | Only the owner's slot can be changed. |
| FR-13 | A faculty member shall be able to approve or reject their own pending requests. | Status changes to approved or rejected. |
| FR-14 | A faculty member shall be able to mark an approved past booking as completed. | Eligible booking status becomes completed. |
| FR-15 | An administrator shall be able to view summary counts, users, and recent bookings. | Admin dashboard shows summary and tabular data. |
| FR-16 | An administrator shall be able to activate/deactivate other user accounts. | Account active status changes; admin cannot deactivate their own account through this page. |
| FR-17 | The system shall preserve users, availability, bookings, and session records in MySQL. | Data remains after page refresh; booking data remains after application restart. |
| FR-18 | The system shall display success/error feedback after important actions. | Form submissions return clear status messages. |

## 4. Non-functional requirements

| ID | Requirement | Acceptance evidence |
|---|---|---|
| NFR-01 — Security | Passwords shall be stored as bcrypt hashes, not plaintext. | Database contains password hashes. |
| NFR-02 — Security | SQL operations with user-supplied values shall use parameterized queries. | Route/model code uses placeholders. |
| NFR-03 — Access control | Protected routes shall verify authentication and role on the server. | Direct URL test confirms unauthorized access is denied. |
| NFR-04 — Validation | Required fields, string lengths, dates, duration, availability, and conflicts shall be validated. | Invalid form tests return an error and do not create invalid records. |
| NFR-05 — Data integrity | Booking records shall reference existing student and faculty accounts. | MySQL foreign keys enforce relationships. |
| NFR-06 — Usability | Forms and status labels shall be understandable on desktop and mobile screens. | Main pages can be used at common browser widths. |
| NFR-07 — Maintainability | Routes, middleware, database configuration, views, and public assets shall be separated. | Repository follows documented structure. |
| NFR-08 — Reliability | Database errors shall not expose stack traces to normal users. | Generic error page is shown; details are logged server-side. |
| NFR-09 — Portability | Configuration shall be supplied through environment variables. | App can be configured without editing committed source files. |
| NFR-10 — Collaboration | Team work shall be traceable through issues, branches, pull requests, reviews, and commits. | Instructor can inspect genuine repository evidence. |

## 5. Use cases

### UC-01: Student requests a consultation

- **Primary actor:** Student
- **Preconditions:** Student is logged in; selected faculty account is active; faculty has an active availability slot.
- **Main flow:**
  1. Student opens My Consultations.
  2. Student selects faculty, topic, preferred start time, duration, and optional notes.
  3. System validates required fields and time values.
  4. System checks faculty availability and overlapping pending/approved bookings.
  5. System stores the booking with pending status.
  6. System confirms that the request was submitted.
- **Alternative flows:** Invalid fields, unavailable slot, or time conflict produce an error and no new booking.
- **Postcondition:** A pending booking exists in MySQL.

### UC-02: Faculty publishes availability

- **Primary actor:** Faculty member
- **Preconditions:** Faculty member is logged in.
- **Main flow:**
  1. Faculty opens the faculty dashboard.
  2. Faculty enters a future start and end date/time.
  3. System validates that the end is later than the start.
  4. System stores and displays the active slot.
- **Alternative flow:** Invalid date/time is rejected.
- **Postcondition:** An availability slot is stored for that faculty account.

### UC-03: Faculty approves or rejects a booking

- **Primary actor:** Faculty member
- **Preconditions:** Faculty member is logged in and the booking belongs to them.
- **Main flow:**
  1. Faculty reviews a pending booking.
  2. Faculty chooses approve or reject.
  3. System verifies ownership and current status.
  4. System updates the status and displays feedback.
- **Postcondition:** Booking status is approved or rejected.

### UC-04: Student reschedules or cancels a booking

- **Primary actor:** Student
- **Preconditions:** Student is logged in; booking belongs to them; booking is pending/approved and in the future.
- **Main flow — reschedule:**
  1. Student opens their booking history.
  2. Student enters a new start time and duration.
  3. System checks active availability and schedule conflicts.
  4. System saves the new time and resets status to pending.
- **Main flow — cancel:** Student selects cancel; system verifies eligibility and changes status to cancelled.
- **Alternative flow:** Ineligible booking or invalid/conflicting time is rejected.
- **Postcondition:** Booking is updated and remains in the student's history.

### UC-05: Administrator manages account access

- **Primary actor:** Administrator
- **Preconditions:** Administrator is logged in.
- **Main flow:**
  1. Admin opens the dashboard.
  2. Admin reviews account status.
  3. Admin activates or deactivates another account.
  4. System stores the new status.
- **Alternative flow:** Admin cannot deactivate their own account through the action.
- **Postcondition:** Account status is updated.

### UC-06: User logs in and out

- **Primary actor:** Student, faculty member, or administrator
- **Preconditions:** Account exists and is active.
- **Main flow:** User submits credentials; system verifies the password hash; system creates a session and regenerates the session ID; user accesses the role dashboard. On logout, session is destroyed.
- **Alternative flow:** Incorrect credentials or inactive account are rejected with a generic message.
- **Postcondition:** Authenticated session exists after login and no longer exists after logout.

## 6. Core data entities

- **User:** id, full name, email, password hash, role, department, active status, creation timestamp.
- **Availability slot:** id, faculty owner, start, end, active status, creation timestamp.
- **Booking:** id, student, faculty, topic, notes, start, duration, status, created/updated timestamps.
- **Session:** session identifier and serialized session data maintained by the MySQL session store.

## 7. Scope and limitations

Included: login/logout, student booking/history, faculty availability and decisions, admin overview/account activation, MySQL persistence, role checks, and basic validation.

Not included in this prototype: self-registration, email notifications, password reset, recurring availability, calendar integration, or production deployment controls. These can be future enhancements.

## 8. Requirement traceability

- FR-01 to FR-03: `routes/auth.js`, `middleware/auth.js`, `app.js`
- FR-04 to FR-10: `routes/bookings.js`, `views/student-bookings.ejs`
- FR-11 to FR-14: `routes/faculty.js`, `views/faculty-dashboard.ejs`
- FR-15 to FR-16: `routes/admin.js`, `views/admin-dashboard.ejs`
- FR-17: `schema.sql`, `config/db.js`, `app.js`
- Validation helpers: `utils.js` and route handlers
