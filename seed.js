require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("./config/db");

async function main() {
  await pool.ensureDatabaseReady();

  const accounts = [
    { name: "Demo Student", email: "student@example.com", password: "Student123!", role: "student", department: "College of Computer Studies" },
    { name: "Demo Faculty", email: "faculty@example.com", password: "Faculty123!", role: "faculty", department: "College of Computer Studies" },
    { name: "System Administrator", email: "admin@example.com", password: "Admin123!", role: "admin", department: "IT Services" }
  ];

  for (const account of accounts) {
    const hash = await bcrypt.hash(account.password, 12);
    await pool.execute(
      `INSERT INTO users (full_name,email,password_hash,role,department,active)
       VALUES (?,?,?,?,?,1)
       ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), password_hash=VALUES(password_hash),
       role=VALUES(role), department=VALUES(department), active=1`,
      [account.name, account.email, hash, account.role, account.department]
    );
  }

  const [faculty] = await pool.execute("SELECT id FROM users WHERE email='faculty@example.com' LIMIT 1");
  if (faculty.length) {
    const [slots] = await pool.execute("SELECT id FROM availability_slots WHERE faculty_id=? LIMIT 1", [faculty[0].id]);
    if (!slots.length) {
      const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
      start.setMinutes(0, 0, 0);
      const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
      const sql = (date) => date.toISOString().slice(0, 19).replace("T", " ");
      await pool.execute("INSERT INTO availability_slots (faculty_id, starts_at, ends_at, active) VALUES (?,?,?,1)",
        [faculty[0].id, sql(start), sql(end)]);
    }
  }

  console.log("Demo accounts created/updated. Change demo passwords before real use.");
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
