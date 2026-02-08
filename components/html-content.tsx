// components/html-content.tsx
interface HtmlContentProps {
  content: string | null;
  className?: string;
}

export function HtmlContent({ content, className = "" }: HtmlContentProps) {
  if (!content) return null;

  return (
    <div
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
