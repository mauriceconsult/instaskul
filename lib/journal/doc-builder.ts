// lib/journal/docx-builder.ts
//
// Converts the AI-generated markdown-headed article text into a .docx
// buffer using the same docx-js approach as the article we built manually.

import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  LineRuleType, PageNumber, Header, TabStopType,
} from "docx";

const FONT = "Times New Roman";
const SIZE = 24;
const LEAD = { line: 480, lineRule: LineRuleType.AUTO };

const p = (text: string, opts = {}) => new Paragraph({
  spacing: { ...LEAD, before: 0, after: 0 },
  indent:  { firstLine: 720 },
  children: [new TextRun({ text, font: FONT, size: SIZE })],
  ...opts,
});

export async function buildArticleDocx(
  markdownText: string,
  style: "APA" | "MLA" | "Chicago" = "APA",
): Promise<Buffer> {
  const lines    = markdownText.split("\n");
  const children = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { children.push(p("")); continue; }

    if (trimmed.startsWith("### ")) {
      children.push(new Paragraph({
        spacing: { ...LEAD },
        indent:  { firstLine: 720 },
        children: [new TextRun({ text: trimmed.slice(4) + ".", font: FONT, size: SIZE, bold: true, italics: true })],
      }));
    } else if (trimmed.startsWith("## ")) {
      children.push(new Paragraph({
        spacing: { ...LEAD },
        children: [new TextRun({ text: trimmed.slice(3), font: FONT, size: SIZE, bold: true })],
      }));
    } else if (trimmed.startsWith("# ")) {
      children.push(new Paragraph({
        spacing: { ...LEAD },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: trimmed.slice(2), font: FONT, size: SIZE, bold: true })],
      }));
    } else {
      children.push(p(trimmed));
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: SIZE } } } },
    sections: [{
      properties: {
        page: {
          size:   { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
            spacing: { line: 240, lineRule: LineRuleType.AUTO },
            children: [
              new TextRun({ text: `${style.toUpperCase()} COURSEWORK — INSTASKUL`, font: FONT, size: SIZE }),
              new TextRun({ text: "\t", font: FONT, size: SIZE }),
              new TextRun({ text: PageNumber.CURRENT, font: FONT, size: SIZE }),
            ],
          })],
        }),
      },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}