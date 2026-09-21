import express, { ErrorRequestHandler } from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import debtRoutes from "./routes/debtRoutes";

const app = express();

class CorsOriginError extends Error {}

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new CorsOriginError("Origin is not allowed"));
  },
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86_400,
};

app.disable("x-powered-by");

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb", strict: true }));
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again shortly." },
  })
);
app.use(debtRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof CorsOriginError) {
    res.status(403).json({ error: "Origin is not allowed" });
    return;
  }

  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 500;

  res.status(status >= 400 && status < 500 ? status : 500).json({
    error: status >= 400 && status < 500 ? "Invalid request" : "Internal error",
  });
};

app.use(errorHandler);

export default app;
