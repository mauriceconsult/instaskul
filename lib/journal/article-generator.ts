import Anthropic from "@anthropic-ai/sdk";
import { buildArticlePrompt, type JournalArticleInput } from "./prompt-builder";
import { prisma }             from "@/lib/prisma";
import { utapi }              from "@/lib/uploadthing";
import { buildArticleDocx }  from "./doc-builder";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function toSlug(title: string, journalId: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${base}-${journalId.slice(0, 8)}`;
}

export async function generateJournalArticle({
  input,
  generatedBy,
  journalId,
}: {
  input:       JournalArticleInput;
  generatedBy: string;
  journalId:   string;
}) {
  const { prompt, contextUsed, excerpt } = await buildArticlePrompt(input);

  // ── Primary: Anthropic ──────────────────────────────────────────────────────
  let articleText = ""; // Initialize with default string to avoid TS unassigned error

  try {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    articleText =
      response.content[0].type === "text"
        ? response.content[0].text
        : "";
    console.log("[ArticleGenerator] Generated via Anthropic");
  } catch (anthropicErr) {
    console.error("[ArticleGenerator] Failed to generate article:", anthropicErr);
    throw new Error("Failed to generate journal article content from Anthropic API.");
  }

  // ── Docx + upload ───────────────────────────────────────────────────────────
  const style      = input.style ?? "APA";
  const docxBuffer = await buildArticleDocx(articleText, style);

  const docxBlobPart = (Buffer.isBuffer(docxBuffer) ? Uint8Array.from(docxBuffer) : docxBuffer) as
    | ArrayBuffer
    | ArrayBufferView
    | Blob
    | string;
  const wordCount  = articleText.split(/\s+/).filter(Boolean).length;
  const fileName   = `journal_${journalId}_${Date.now()}.docx`;

  const file = new File([docxBlobPart as BlobPart], fileName, {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const uploadResult = await utapi.uploadFiles(file);
  const articleUrl = uploadResult.data?.url ?? null;

  const journal = await prisma.journal.findUnique({
    where:  { id: journalId },
    select: { title: true },
  });
  const slug = toSlug(journal?.title ?? "article", journalId);

  // ── Upsert ──────────────────────────────────────────────────────────────────
  const article = await prisma.journalArticle.upsert({
    where:  { journalId },
    update: {
      articleUrl,
      wordCount,
      contextUsed,
      generatedBy,
      excerpt,
      slug,
      status:   "draft",
      isPublic: false,
    },
    create: {
      journalId,
      generatedBy,
      contextUsed,
      excerpt,
      articleUrl,
      wordCount,
      slug,
      status:   "draft",
      isPublic: false,
    },
  });

  return article;
}