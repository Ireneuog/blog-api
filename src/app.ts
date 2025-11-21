import express from "express";
import commentRoutes from "./routes/commentRoutes";
import postRoutes from "./routes/postRoutes";
import { requestLogger } from "./middlewares/requestLogger";

const app = express();

app.use(express.json());

// Monitorização
app.use(requestLogger);

// Health check 
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Rotas de comentários
app.use("/comments", commentRoutes);

// Rotas de posts (editar/apagar)
app.use("/posts", postRoutes);

export default app;
