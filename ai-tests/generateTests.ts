// ai-tests/generateTests.js
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ficheiros-alvo (podes pôr controllers, services, utils, etc.)
const TARGET_FILES = [
  "src/controllers/postController.ts",
  "src/controllers/commentController.ts",
  "src/services/postService.ts"
];

async function main() {
  for (const file of TARGET_FILES) {
    const code = fs.readFileSync(file, "utf-8");

    console.log(`🔍 A gerar testes automáticos para: ${file}`);

    const prompt = `
Gera testes unitários Jest completos para o seguinte ficheiro TypeScript.
Inclui:
- mocks
- casos de sucesso e erro
- edge cases

Código:
${code}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const testCode = completion.choices[0].message.content;

    const outputPath = path.join("ai-tests", file.split("/").pop().replace(".ts", ".test.ai-generated.js"));
    fs.writeFileSync(outputPath, testCode);

    console.log(`✅ Teste gerado: ${outputPath}`);
  }
}

main();

