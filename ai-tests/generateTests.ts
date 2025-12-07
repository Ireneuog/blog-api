import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Target files for test generation
const TARGET_PATTERNS = [
  "src/services/**/*.ts",
  "src/controllers/**/*.ts",
];

// Files to skip
const SKIP_PATTERNS = ["*.test.ts", "*.spec.ts", "index.ts"];

async function findModifiedFiles(): Promise<string[]> {
  // In CI, get files from git diff
  if (process.env.CI && process.env.GITHUB_BASE_REF) {
    const { execSync } = await import("child_process");
    try {
      const output = execSync(
        `git diff --name-only origin/${process.env.GITHUB_BASE_REF}...HEAD`,
        { encoding: "utf-8" }
      );
      return output
        .split("\n")
        .filter((f) => f.endsWith(".ts") && !f.includes(".test.ts"));
    } catch (err) {
      console.warn("Could not get git diff, using default targets");
    }
  }

  // Fallback to target patterns
  return TARGET_PATTERNS;
}

function shouldSkip(filePath: string): boolean {
  return SKIP_PATTERNS.some((pattern) => filePath.includes(pattern));
}

async function generateTestsForFile(filePath: string): Promise<string> {
  console.log(`📝 Generating tests for: ${filePath}`);

  try {
    const code = fs.readFileSync(filePath, "utf-8");

    if (code.length === 0) {
      console.warn(`⚠️  Skipping empty file: ${filePath}`);
      return "";
    }

    const prompt = `You are an expert TypeScript/Vitest test generator.

Generate comprehensive unit tests for this TypeScript file using Vitest.

Requirements:
1. Use Vitest (not Jest)
2. Import prismaMock from "../helpers/prismaMock" for database mocking
3. Use vi.mock() at the top of test file before other imports
4. Cover: success cases, error cases, edge cases, validation
5. Include proper TypeScript types
6. Add descriptive test names
7. Use proper async/await patterns
8. Mock external dependencies appropriately

File: ${filePath}
\`\`\`typescript
${code}
\`\`\`

Generate ONLY the test code, no explanations. Start with imports, then describe blocks.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const testCode = completion.choices[0].message?.content;

    if (!testCode || testCode.length < 100) {
      console.warn(`⚠️  Generated test is too short for: ${filePath}`);
      return "";
    }

    return testCode;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error generating tests for ${filePath}:`, error.message);
    }
    return "";
  }
}

async function main() {
  console.log("🤖 AI Test Generator Started\n");

  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "❌ OPENAI_API_KEY environment variable not set. Skipping AI test generation."
    );
    process.exit(1);
  }

  const targetFiles = await findModifiedFiles();
  let generatedCount = 0;
  let skippedCount = 0;

  for (const filePath of targetFiles) {
    if (shouldSkip(filePath)) {
      skippedCount++;
      continue;
    }

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const testCode = await generateTestsForFile(filePath);

    if (testCode) {
      const fileName = path.basename(filePath).replace(".ts", "");
      const outputPath = path.join(__dirname, `${fileName}.ai-generated.test.ts`);

      fs.writeFileSync(outputPath, testCode);
      console.log(`✅ Generated: ${outputPath}\n`);
      generatedCount++;

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Generated: ${generatedCount} test files`);
  console.log(`   Skipped: ${skippedCount} files`);

  if (generatedCount === 0) {
    console.log(
      "⚠️  No tests were generated. Check logs above for details."
    );
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});


