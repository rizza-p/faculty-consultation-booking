const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "faculty_consultation_booking",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

const pool = mysql.createPool(dbConfig);

async function ensureDatabaseReady() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbConfig.database}\``);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('student','faculty','admin') NOT NULL,
        department VARCHAR(120) NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
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
      )
    `);
    await connection.query(`
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
      )
    `);
  } finally {
    await connection.end();
  }
}

async function seedDemoAccounts() {
  const [countRow] = await pool.query("SELECT COUNT(*) AS total FROM users");
  const totalUsers = Number(countRow[0].total || 0);

  if (totalUsers > 0) {
    return false;
  }

  const accounts = [
    { name: "Demo Student", email: "student@example.com", password: "Student123!", role: "student", department: "College of Computer Studies" },
    { name: "Demo Faculty", email: "faculty@example.com", password: "Faculty123!", role: "faculty", department: "College of Computer Studies" },
    { name: "System Administrator", email: "admin@example.com", password: "Admin123!", role: "admin", department: "IT Services" }
  ];

  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    await pool.execute(
      `INSERT INTO users (full_name,email,password_hash,role,department,active)
       VALUES (?,?,?,?,?,1)
       ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), password_hash=VALUES(password_hash),
       role=VALUES(role), department=VALUES(department), active=1`,
      [account.name, account.email, passwordHash, account.role, account.department]
    );
  }

  const [faculty] = await pool.execute("SELECT id FROM users WHERE email='faculty@example.com' LIMIT 1");
  if (!faculty.length) {
    return false;
  }

  const [slots] = await pool.execute("SELECT id FROM availability_slots WHERE faculty_id=? LIMIT 1", [faculty[0].id]);
  if (!slots.length) {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    const formatDate = (date) => date.toISOString().slice(0, 19).replace("T", " ");
    await pool.execute(
      "INSERT INTO availability_slots (faculty_id, starts_at, ends_at, active) VALUES (?,?,?,1)",
      [faculty[0].id, formatDate(start), formatDate(end)]
    );
  }

  return true;
}

pool.ensureDatabaseReady = ensureDatabaseReady;
pool.seedDemoAccounts = seedDemoAccounts;

module.exports = pool;
