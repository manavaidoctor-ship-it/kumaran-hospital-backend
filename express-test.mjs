import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Basic ping check
app.get("/api/ping", (req, res) => {
  res.send("✅ Server running fine");
});

// ✅ Static test route to confirm response
app.get("/api/patients", (req, res) => {
  console.log("📡 /api/patients called");
  res.json([
    { id: 1, name: "Test Patient 1", age: 30, gender: "Male" },
    { id: 2, name: "Test Patient 2", age: 25, gender: "Female" }
  ]);
});

// ✅ Start server
app.listen(5000, () => {
  console.log("🚀 Express (ESM) test running on port 5000");
});
