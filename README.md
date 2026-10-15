# Faculty Consultation Booking System

A web application that lets students book consultation time slots with faculty members, and lets faculty manage their availability and incoming requests — built for the Midterm Project (Campus System, Round 1).

## Team Members

- Axl Rama Doctolero
- Rizza Pabelonia
- Francis Jay Tagum

## Assigned System

Faculty Consultation Booking System

## Features

- User registration and login (student, faculty, admin roles) with bcrypt-hashed passwords and session-based authentication
- Role-based access control via middleware — pages are restricted by role, and direct URL access by an unauthorized role is blocked
- Faculty can post open consultation slots (date, start time, end time)
- Students can browse available slots and book one with a stated purpose
- Faculty can approve, decline, mark as done, or cancel incoming bookings
- Admin dashboard to view all registered users and all bookings across the system
- Input validation on registration, login, and booking forms
- Responsive styling with status badges for booking states

## Technologies

- Node.js
- Express.js
- EJS (templating)
- MySQL (via XAMPP)
- express-session (session management)
- bcrypt (password hashing)
- dotenv (environment variables)

## Installation

1. Clone the repository:

git clone https://github.com/rizza-p/faculty-consultation-booking.git
cd faculty-consultation-booking

2. Install dependencies:

npm install

## Configuration

1. Copy `.env.example` to `.env`:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=fcbs_db
SESSION_SECRET=your_secret_here
PORT=3000

2. Fill in your local MySQL credentials. `.env` is excluded from version control via `.gitignore` and must never be committed.

## Database Setup

1. Start MySQL in XAMPP Control Panel.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`).
3. Create a database named `fcbs_db`.
4. Run the following SQL to create the required tables:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'admin') NOT NULL,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slot_id INT NOT NULL,
  student_id INT NOT NULL,
  faculty_id INT NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'declined', 'done', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## How to Run

node app.js

Then open `http://localhost:3000` in your browser.

## User Accounts

No pre-seeded accounts exist. Register new accounts via `/register` and select a role (Student or Faculty). To test admin features, register a normal account, then manually set its `role` to `admin` in the `users` table via phpMyAdmin.

Example test accounts used during development:

| Role    | Email                   | Password  |
| ------- | ----------------------- | --------- |
| Student | student.test@fcbs.local | Test@1234 |
| Faculty | faculty.test@fcbs.local | Test@1234 |
| Admin   | admin.test@fcbs.local   | Test@1234 |

## Project Structure

faculty-consultation-booking/
├── config/ # Database connection
├── controllers/ # Request handling logic
├── middleware/ # Auth and role-checking middleware
├── models/ # Database queries
├── public/ # Static assets (CSS)
├── routes/ # Express route definitions
├── views/ # EJS templates
├── app.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── LICENSE

## Known Limitations

- No email notifications for booking status changes
- Faculty cannot edit or cancel a slot after it is created
- No password reset flow
- Requirements document is a separate deliverable

## AI Assistance Disclosure

Portions of this project's code, documentation, and GitHub workflow setup were developed with the assistance of Claude (Anthropic). AI assistance was used to help scaffold the Express application structure, generate boilerplate code, and draft documentation. All code was reviewed, tested, and understood by the team, who remain responsible for its correctness and for defending it during the Round 1 Showcase.

## License

See [LICENSE](./LICENSE) for details.
