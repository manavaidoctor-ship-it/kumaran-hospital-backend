import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// ✅ Health Check
app.get("/api/ping", (req, res) => res.send("✅ Server running fine"));

// ======================================================
// 🏕️ CAMP MANAGEMENT
// ======================================================

// ✅ 1️⃣ Create a new camp (when you start a new day or camp)
app.post("/api/camps", async (req, res) => {
  try {
    const { camp_name, location, camp_date } = req.body;

    if (!camp_name) {
      return res.status(400).json({ message: "Camp name (village) is required." });
    }

    const [result] = await pool.query(
      `INSERT INTO camps (camp_name, location, camp_date) VALUES (?, ?, ?)`,
      [camp_name, location || null, camp_date || new Date()]
    );

    res.json({
      message: "✅ New camp created successfully",
      camp_id: result.insertId,
      camp_name,
      location,
      camp_date,
    });
  } catch (err) {
    console.error("❌ Error creating camp:", err);
    res.status(500).json({ message: "Error creating new camp" });
  }
});

// ✅ 2️⃣ Get all camps (list view or dropdown)
app.get("/api/camps", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM camps ORDER BY camp_date DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching camps:", err);
    res.status(500).json({ message: "Error fetching camp list" });
  }
});

// ✅ 3️⃣ Get all patients for a specific camp (for daily report)
app.get("/api/patients/camp/:camp_id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM patients WHERE camp_id = ? ORDER BY patient_id DESC",
      [req.params.camp_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching patients by camp:", err);
    res.status(500).json({ message: "Error fetching camp patients" });
  }
});

// ======================================================
// 👩‍⚕️ PATIENT MANAGEMENT
// ======================================================

// ✅ Get all patients (for admin or testing)
app.get("/api/patients", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM patients ORDER BY patient_id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching patients:", err);
    res.status(500).json({ message: "Error fetching patient list" });
  }
});

// ✅ Add new patient (register for OP chit, linked to camp)
app.post("/api/patients", async (req, res) => {
  try {
    const {
      name,
      relative_name,
      village,
      panchayat,
      union_name,
      age,
      gender,
      phone,
      reason,
      doctor,
      camp_id,
    } = req.body;

    if (!name || !gender || !phone) {
      return res
        .status(400)
        .json({ message: "Name, Gender, and Phone are required." });
    }

    const [result] = await pool.query(
      `INSERT INTO patients 
       (name, relative_name, village, panchayat, union_name, age, gender, phone, reason, doctor, camp_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        relative_name || null,
        village || null,
        panchayat || null,
        union_name || null,
        age || null,
        gender || null,
        phone || null,
        reason || null,
        doctor || null,
        camp_id || null,
      ]
    );

    res.json({
      message: "✅ Patient added successfully",
      patient_id: result.insertId,
    });
  } catch (err) {
    console.error("❌ Error inserting patient:", err);
    res.status(500).json({ message: "Error adding new patient" });
  }
});

// ✅ Get single patient (for OP chit print)
app.get("/api/patients/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM patients WHERE patient_id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Patient not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching patient by ID:", err);
    res.status(500).json({ message: "Error fetching patient details" });
  }
});

// ======================================================
// 🩺 DOCTOR MANAGEMENT (optional)
// ======================================================
app.get("/api/doctors", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM doctors ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching doctors:", err);
    res.status(500).json({ message: "Error fetching doctor list" });
  }
});

// ======================================================
// 🚀 START SERVER
// ======================================================
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});
