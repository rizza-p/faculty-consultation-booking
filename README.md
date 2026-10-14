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
