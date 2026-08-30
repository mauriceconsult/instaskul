import Anthropic from "@anthropic-ai/sdk";

import { buildArticlePrompt, type JournalArticleInput } from "./prompt-builder";
import { prisma } from "@/lib/prisma";
import { utapi } from "@/lib/uploadthing";
import { buildArticleDocx } from "./doc-builder";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MAXINTEL_TIMEOUT_MS = 90_000;

interface MaxintelGenerateResponse {
  output: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

function isValidMaxintelResponse(
  data: unknown,
): data is MaxintelGenerateResponse {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const value = data as Record<string, unknown>;

  return (
    typeof value.output === "string" &&
    typeof value.model === "string" &&
    typeof value.promptTokens === "number" &&
    typeof value.completionTokens === "number" &&
    typeof value.totalTokens === "number"
  );
}

async function generateWithMaxintel(
  prompt: string,
): Promise<string> {
  const apiUrl = (
    process.env.MAXINTEL_API_URL ??
    "https://maxintel.maxnovate.com"
  ).replace(/\/$/, "");

  const apiKey = process.env.PLATFORM_API_KEY;

  if (!apiKey) {
    throw new Error(
      "[ArticleGenerator/Maxintel] PLATFORM_API_KEY is not configured",
    );
  }

  const response = await fetch(`${apiUrl}/platform/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Platform-Key": apiKey,
    },
    body: JSON.stringify({
      prompt,
      type: "blog_post",
    }),
    signal: AbortSignal.timeout(MAXINTEL_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "(unreadable)");

    console.error(
      `[ArticleGenerator/Maxintel] ${response.status} from /platform/generate:`,
      body,
    );

    throw new Error(
      `[ArticleGenerator/Maxintel] Request failed with status ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (!isValidMaxintelResponse(data)) {
    console.error(
      "[ArticleGenerator/Maxintel] Unexpected response shape:",
      data,
    );

    throw new Error(
      "[ArticleGenerator/Maxintel] Response did not match expected schema",
    );
  }

  return data.output;
}

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
  input: JournalArticleInput;
  generatedBy: string;
  journalId: string;
}) {
  const { prompt, contextUsed, excerpt } =
    await buildArticlePrompt(input);

  // ── Primary: Anthropic ──────────────────────────────────────────────

  let articleText = "";

  try {
    const response = await anthropic.messages.create({
      model:
        process.env.ANTHROPIC_MODEL ??
        "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    articleText =
      response.content[0].type === "text"
        ? response.content[0].text
        : "";

    console.log(
      "[ArticleGenerator] Generated via Anthropic",
    );
  } catch (anthropicErr) {
    // ── Fallback: Maxintel ────────────────────────────────────────────

    console.error(
      "[ArticleGenerator] Anthropic generation failed:",
      anthropicErr,
    );

    try {
      articleText = await generateWithMaxintel(prompt);

      console.log(
        "[ArticleGenerator] Generated via Maxintel fallback",
      );
    } catch (maxintelErr) {
      console.error(
        "[ArticleGenerator] Maxintel fallback also failed:",
        maxintelErr,
      );

      throw new Error(
        "Failed to generate journal article content from both Anthropic and Maxintel.",
      );
    }
  }

  if (!articleText.trim()) {
    throw new Error(
      "Article generation produced empty content.",
    );
  }

  // ── Docx + upload ──────────────────────────────────────────────────

  const style = input.style ?? "APA";

  const docxBuffer = await buildArticleDocx(
    articleText,
    style,
  );

  const docxBlobPart = (
    Buffer.isBuffer(docxBuffer)
      ? Uint8Array.from(docxBuffer)
      : docxBuffer
  ) as
    | ArrayBuffer
    | ArrayBufferView
    | Blob
    | string;

  const wordCount = articleText
    .split(/\s+/)
    .filter(Boolean)
    .length;

  const fileName =
    `journal_${journalId}_${Date.now()}.docx`;

  const file = new File(
    [docxBlobPart as BlobPart],
    fileName,
    {
      type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  );

  const uploadResult = await utapi.uploadFiles(file);

  const articleUrl =
    uploadResult.data?.url ?? null;

  const journal = await prisma.journal.findUnique({
    where: {
      id: journalId,
    },
    select: {
      title: true,
    },
  });

  const slug = toSlug(
    journal?.title ?? "article",
    journalId,
  );

  // ── Upsert ─────────────────────────────────────────────────────────

  const article =
    await prisma.journalArticle.upsert({
      where: {
        journalId,
      },
      update: {
        articleUrl,
        wordCount,
        contextUsed,
        generatedBy,
        excerpt,
        slug,
        status: "draft",
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
        status: "draft",
        isPublic: false,
      },
    });

  return article;
}