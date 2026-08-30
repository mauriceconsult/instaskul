import { prisma } from "@/lib/prisma";

export interface JournalArticleInput {
  journalId: string;
  style?: "APA" | "MLA" | "Chicago";
  minWords?: number;
  maxWords?: number;
}

export interface JournalArticlePromptResult {
  prompt: string;
  contextUsed: string;
  excerpt: string;
}

const VALID_STYLES = new Set(["APA", "MLA", "Chicago"] as const);
type CitationStyle = "APA" | "MLA" | "Chicago";

function toCitationStyle(raw: string | null | undefined): CitationStyle {
  if (raw && VALID_STYLES.has(raw as CitationStyle)) {
    return raw as CitationStyle;
  }
  return "APA";
}

export async function buildArticlePrompt(
  input: JournalArticleInput
): Promise<JournalArticlePromptResult> {
  const journal = await prisma.journal.findUnique({
    where: { id: input.journalId },
    select: {
      title: true,
      description: true,
      context: true,
      style: true,
      minWords: true,
      maxWords: true,
      course: {
        select: {
          title: true,
          contents: {
            where: { isPublished: true },
            orderBy: { createdAt: "desc" },
            select: { title: true, description: true },
          },
        },
      },
    },
  });

  if (!journal) throw new Error("Journal not found");
  if (!journal.course) throw new Error("Associated course not found");

  const { course } = journal;
  const style = input.style ?? toCitationStyle(journal.style);
  const minWords = input.minWords ?? journal.minWords;
  const maxWords = input.maxWords ?? journal.maxWords;

  type ContentItem = { title: string; description: string | null };

  const tutorialSections =
    course.contents.length > 0
      ? course.contents
          .map(
            (t: ContentItem, i: number) =>
              `  Section ${i + 1}: "${t.title}"${t.description ? ` — ${t.description}` : ""}`
          )
          .join("\n")
      : "No structured tutorials found. Use standard logical academic sections for the field.";

  const prompt = `You are an expert academic writer specialising in ${course.title}.
Write a submission-ready ${style}-style academic article.

COURSE: ${course.title}
JOURNAL TITLE: ${journal.title}
JOURNAL DESCRIPTION: ${journal.description ?? "N/A"}

CENTRAL THESIS / CONTEXT (the unifying argument of the entire article):
${journal.context}

COURSE MODULE STRUCTURE (map each module explicitly to a main article section — use module titles as Level 2 headings):
${tutorialSections}

REQUIREMENTS:
- Length: ${minWords}–${maxWords} words (strictly enforced)
- Citation style: ${style} (latest edition)
- Required sections in order:
  1. Title (descriptive, academically appropriate — include course subject area)
  2. Abstract (150–250 words — begin with a 2–3 sentence overview suitable for non-specialists)
  3. Keywords (5–8 terms, comma-separated)
  4. Introduction (situate the argument, review scope, signal the article's contribution)
  5. Main body — one section per course module listed above
  6. Discussion and Implications
  7. Conclusion (end with a forward-looking statement on the field)
  8. References (25–45 entries)
- The central thesis must anchor every section — not appear only in the introduction
- All citations must be real, verifiable, peer-reviewed sources
- The article must be of publication quality suitable for a global top-100 journal in the field
- Maintain formal academic register throughout

PUBLICITY NOTE:
The approved article will be published publicly as a quality indicator for the course and as marketing content for Instaskul's course catalogue. Ensure the Abstract's opening 2–3 sentences are accessible and compelling to a non-specialist reader who may discover this article via search and click through to enrol.

OUTPUT FORMAT:
Return ONLY the article as clean markdown:
  # for the article title
  ## for major sections
  ### for subsections
No preamble, notes, or text outside the article. End with the complete References list in ${style} format.`;

  const contextSentences = journal.context
    .split(/(?<=[.!?])\s+/)
    .slice(0, 3)
    .join(" ");

  return {
    prompt,
    contextUsed: journal.context,
    excerpt: contextSentences,
  };
}