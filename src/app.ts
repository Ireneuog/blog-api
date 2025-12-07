import express from "express";
import commentRoutes from "./routes/commentRoutes";
import postRoutes from "./routes/postRoutes";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());

// Request logging
app.use(requestLogger);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/comments", commentRoutes);
app.use("/posts", postRoutes);

// Centralized error handling (must be last)
app.use(errorHandler);

export default app;
