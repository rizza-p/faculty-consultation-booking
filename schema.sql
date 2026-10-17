CREATE DATABASE IF NOT EXISTS faculty_consultation_booking
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE faculty_consultation_booking;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','faculty','admin') NOT NULL,
  department VARCHAR(120) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS availability_slots (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT UNSIGNED NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_availability_faculty FOREIGN KEY (faculty_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_availability_faculty_time (faculty_id, starts_at, ends_at)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  faculty_id INT UNSIGNED NOT NULL,
  topic VARCHAR(120) NOT NULL,
  notes VARCHAR(1000) NULL,
  starts_at DATETIME NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  status ENUM('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_student FOREIGN KEY (student_id) REFERENCES users(id),
  CONSTRAINT fk_booking_faculty FOREIGN KEY (faculty_id) REFERENCES users(id),
  INDEX idx_booking_student (student_id, created_at),
  INDEX idx_booking_faculty_time (faculty_id, starts_at),
  INDEX idx_booking_status (status)
);
