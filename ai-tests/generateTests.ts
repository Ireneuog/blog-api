import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const TARGET_FILES: string[] = [
  "src/controllers/postController.ts",
  "src/controllers/commentController.ts",
  "src/services/postService.ts"
];

async function main() {
  for (const file of TARGET_FILES) {
    const code = fs.readFileSync(file, "utf-8");

    const prompt = `
Gera testes unitários em TypeScript usando Jest + ts-jest para este ficheiro.
Inclui mocks, casos de sucesso, erro e edge cases.
Código:
${code}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const testCode = completion.choices[0].message?.content;
    if (!testCode) continue;

    const outputPath = path.join(
      "ai-tests",
      file.split("/").pop()!.replace(".ts", ".test.ai-generated.ts")
    );

    fs.writeFileSync(outputPath, testCode);
    console.log(`Gerado: ${outputPath}`);
  }
}

main().catch(err => console.error(err));


