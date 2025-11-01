import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// ✅ Health check
app.get("/api/ping", (req, res) => res.send("✅ Server running fine"));

// ✅ Get all patients (for report or total list)
app.get("/api/patients", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM patients ORDER BY patient_id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching patients:", err);
    res.status(500).json({ message: "Error fetching patient list" });
  }
});

// ✅ Add a new patient (linked to active camp)
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
      camp_id, // 👈 added from frontend
    } = req.body;

    if (!name || !gender || !phone) {
      return res
        .status(400)
        .json({ message: "Name, Gender, and Phone are required." });
    }

    const [result] = await pool.query(
      `INSERT INTO patients 
       (name, relative_name, village, panchayat, union_name, age, gender, phone, reason, doctor, camp_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
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

// ✅ Get single patient by ID (for OP Chit print)
app.get("/api/patients/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM patients WHERE patient_id = ?",
      [req.params.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Patient not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching patient by ID:", err);
    res.status(500).json({ message: "Error fetching patient details" });
  }
});

// ✅ Get patients for a specific camp
app.get("/api/patients/camp/:camp_id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM patients WHERE camp_id = ? ORDER BY patient_id DESC",
      [req.params.camp_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching patients for camp:", err);
    res.status(500).json({ message: "Error fetching patients for camp" });
  }
});

// ✅ Create new camp
app.post("/api/camps", async (req, res) => {
  try {
    const { camp_name, location, camp_date } = req.body;

    if (!camp_name) {
      return res.status(400).json({ message: "Camp name is required" });
    }

    // Create a unique camp code
    const today = new Date();
    const year = today.getFullYear();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const camp_code = `CAMP${year}-${randomCode}`;

    const [result] = await pool.query(
      `INSERT INTO camps (camp_code, camp_name, camp_date, location, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [camp_code, camp_name, camp_date || new Date(), location || null]
    );

    res.json({
      message: "✅ Camp created successfully",
      camp_id: result.insertId,
      camp_name,
      camp_date,
      location,
      camp_code,
    });
  } catch (err) {
    console.error("❌ Error creating camp:", err);
    res.status(500).json({ message: "Error creating camp" });
  }
});

// ✅ Get all camps (for reports / selection)
app.get("/api/camps", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM camps ORDER BY camp_id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching camps:", err);
    res.status(500).json({ message: "Error fetching camps" });
  }
});

// ✅ Get doctor list (optional)
app.get("/api/doctors", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM doctors ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching doctors:", err);
    res.status(500).json({ message: "Error fetching doctor list" });
  }
});
// ✅ Delete a patient by ID
app.delete("/api/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM patients WHERE patient_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "✅ Patient deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting patient:", err);
    res.status(500).json({ message: "Error deleting patient" });
  }
});

// ✅ Start server
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});
