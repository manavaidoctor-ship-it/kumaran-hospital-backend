import express from "express";

const app = express();

app.get("/api/ping", (req, res) => {
  res.send("✅ Server running fine");
});

app.get("/api/patients", (req, res) => {
  res.json([{ name: "Working route!" }]);
});

app.listen(5000, () => console.log("🚀 Clean test running on 5000"));

