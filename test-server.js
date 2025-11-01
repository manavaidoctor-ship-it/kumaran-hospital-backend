import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "MANAVAIdoctor3321",
  database: "kumaran_hospital",
  connectionLimit: 10,
});

app.get("/api/ping", (req, res) => {
  res.send("✅ Server running fine");
});

app.get("/api/patients", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM patients ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ DB error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.listen(5000, () => console.log("🚀 TEST Server running on port 5000"));
