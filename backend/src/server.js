const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const env = require("./config/env");
const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const resumesRouter = require("./routes/resume");
const dashboardRouter = require("./routes/dashboard");
const insightsRouter = require("./routes/insights");
const versionsRouter = require("./routes/version");
const historyRouter = require("./routes/history");

const app = express();
const isVercel = !!process.env.VERCEL;

app.set("trust proxy", 1);

const allowedOrigins = [
  "https://ai-resume-checker-liard-nine.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

if (!env.isProd) app.use(morgan("dev"));

// Vercel par: har request se pehle DB connect hone ka wait karo
// (crash nahi karega, fail hua to agli request dobara try karegi)
let dbPromise = null;
app.use(async (req, res, next) => {
  if (!isVercel || req.path === "/api/health") return next();
  try {
    dbPromise = dbPromise || connectDB();
    await dbPromise;
    next();
  } catch (err) {
    dbPromise = null;
    console.error("DB connect failed:", err);
    next(err);
  }
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/resumes", resumesRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/versions", versionsRouter);
app.use("/api/history", historyRouter);

app.use(notFound);
app.use(errorHandler);

// Local mein hi server listen karega, Vercel par nahi
if (!isVercel) {
  const PORT = env.port || process.env.PORT || 5000;
  connectDB()
    .then(() =>
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`)),
    )
    .catch((err) => {
      console.error("Failed to start server:", err);
      process.exit(1);
    });
}

module.exports = app;
