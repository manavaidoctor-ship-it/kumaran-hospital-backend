import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/ping", (req, res) => {
  res.send("✅ Server running fine");
});

app.get("/api/patients", (req, res) => {
  res.json([{ id: 1, name: "Test Patient" }]);
});

app.listen(5000, () => console.log("🚀 API Test running on port 5000"));
