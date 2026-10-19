const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];

  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    db: states[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
