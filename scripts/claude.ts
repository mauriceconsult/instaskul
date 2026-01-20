#!/usr/bin/env node
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function processFile(command: string, filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const code = fs.readFileSync(filePath, "utf-8");
  const ext = path.extname(filePath).slice(1);
  const fileName = path.basename(filePath);

  const prompts: Record<string, string> = {
    review: `Review this ${ext} code for production readiness:\n\n\`\`\`${ext}\n${code}\n\`\`\``,
    optimize: `Optimize this ${ext} code:\n\n\`\`\`${ext}\n${code}\n\`\`\``,
    explain: `Explain this ${ext} code:\n\n\`\`\`${ext}\n${code}\n\`\`\``,
  };

  console.log(`\n🤖 ${command.charAt(0).toUpperCase() + command.slice(1)}ing ${fileName}...\n`);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompts[command] }],
  });

  const content = message.content[0];
  if (content.type === "text") console.log(content.text);
}

const [command, filePath] = process.argv.slice(2);

if (!command || !["review", "optimize", "explain"].includes(command)) {
  console.log(`
╔═══════════════════════════════════════╗
║     Claude Code Assistant CLI         ║
╚═══════════════════════════════════════╝

Usage: npm run claude <command> <file>

Commands:
  review <file>    - Review code
  optimize <file>  - Optimize code
  explain <file>   - Explain code

Example:
  npm run claude review ./lib/payroll.ts
  `);
  process.exit(0);
}

if (!filePath) {
  console.error("❌ Error: Please provide a file path");
  process.exit(1);
}

await processFile(command, filePath);
