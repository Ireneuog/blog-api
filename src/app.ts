import express from "express";
import { prisma } from "./prisma/client";
import commentRoutes from "./routes/commentRoutes";
import { requestLogger } from "./middlewares/requestLogger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Observabilidade (Sprint 3)
app.use(requestLogger);

// Health check (Sprint 3)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Rotas de comentários (Sprint 3)
// POST /comments/:postId → cria comentário
// GET  /comments/:postId → lista comentários
app.use("/comments", commentRoutes);

/* -----------------------------------------------------------
   EDITAR POST (Sprint 3)
----------------------------------------------------------- */
app.put("/posts/:id", async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { title, content } = req.body;

    // Para já, Sprint 3 simples: userId fixo
    const userId = 1;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post não encontrado" });
    }

    if (post.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Não tens permissão para editar este post" });
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { title, content },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao editar post" });
  }
});

/* -----------------------------------------------------------
   APAGAR POST (Sprint 3)
----------------------------------------------------------- */
app.delete("/posts/:id", async (req, res) => {
  try {
    const postId = Number(req.params.id);

    // Para já, Sprint 3 simples: userId fixo
    const userId = 1;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post não encontrado" });
    }

    if (post.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Não tens permissão para apagar este post" });
    }

    // Apagar comentários ligados ao post
    await prisma.comment.deleteMany({
      where: { postId },
    });

    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao apagar post" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
