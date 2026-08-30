// app/journal/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getArticleData(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/journal/${slug}`, {
    next: { revalidate: 3600 }, // ISR - revalidate every hour
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArticleData(slug);

  if (!data?.article) {
    return {
      title: "Article Not Found",
    };
  }

  const { article, course } = data;

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: course.imageUrl ? [{ url: course.imageUrl }] : [],
      type: "article",
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
    alternates: {
      canonical: `/journal/${slug}`,
    },
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  const data = await getArticleData(slug);

  if (!data?.article) {
    notFound();
  }

  const { article, course, relatedCourses } = data;

  return (
    <article className="max-w-4xl mx-auto px-6 py-12 prose prose-lg dark:prose-invert">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-8">
        <a href="/journal" className="hover:underline">Journal</a> →{" "}
        <a href={`/courses/${course.id}`} className="hover:underline">
          {course.title}
        </a>
      </nav>

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{article.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={article.publishedAt}>
            {new Intl.DateTimeFormat("en-US", { 
              dateStyle: "long" 
            }).format(new Date(article.publishedAt))}
          </time>
          <span>•</span>
          <span>{article.wordCount?.toLocaleString()} words</span>
          <span>•</span>
          <span>{article.style} Style</span>
        </div>

        {course.imageUrl && (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-auto rounded-xl mt-8 object-cover"
          />
        )}
      </header>

      {/* Main Article Content */}
      <div className="mb-16">
        <a
          href={article.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors text-lg"
        >
          Read Full Article (Download .docx)
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* Course Information */}
      <div className="border rounded-2xl p-8 mb-16 bg-muted/30">
        <h2 className="text-2xl font-semibold mb-4">Part of Course: {course.title}</h2>
        <p className="text-muted-foreground mb-6">{course.description}</p>
        
        <a
          href={course.enrollUrl}
          className="inline-block bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-lg font-medium hover:scale-105 transition-transform"
        >
          Enroll in this Course — {course.amount} {course.currency}
        </a>
      </div>

      {/* Related Articles / Courses */}
      {relatedCourses && relatedCourses.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Related Academic Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map((rel: any) => (
              <a
                key={rel.slug}
                href={`/journal/${rel.slug}`}
                className="group border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
              >
                {rel.imageUrl && (
                  <img
                    src={rel.imageUrl}
                    alt={rel.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {rel.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {rel.amount} {rel.currency}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-20 text-center text-sm text-muted-foreground border-t pt-8">
        Published by Instaskul Academic Journal • 
        <a href="/journal" className="hover:underline ml-1">Browse all articles</a>
      </footer>
    </article>
  );
}