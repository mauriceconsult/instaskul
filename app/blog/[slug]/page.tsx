// app/blog/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { InstaSkulLogo } from "@/components/instaskul-logo";
import { Share2, Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
// import { getBaseUrl, buildUrl } from "@/lib/url";
import { BlogCTAsClient } from "@/components/blog/blog-ctas.client";
import { CopyLinkButton } from "@/components/blog/share-actions";
import { buildUrl, getBaseUrl } from "@/lib/url";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, isPublished: true },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const postUrl = buildUrl(`/blog/${params.slug}`);

  return {
    title: `${post.title} | InstaSkul Blog`,
    description: post.excerpt || post.title,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: ["InstaSkul"],
      url: postUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.title,
      images: post.coverImage ? [post.coverImage] : [],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, isPublished: true },
  });

  if (!post) notFound();

  // Get the post URL - this will work in all environments
  const postUrl = buildUrl(`/blog/${post.slug}`);
  const readingTime = Math.ceil(post.content.split(" ").length / 200);

  // Format date
  const publishDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(post.createdAt));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <InstaSkulLogo size="sm" showTagline={false} linkTo="/" />
          <Link
            href="/blog"
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Posts
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <article>
          {/* Category & Tags */}
          {(post.category || post.tags.length > 0) && (
            <div className="mb-6">
              {post.category && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mr-2">
                  {post.category}
                </span>
              )}
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full mr-2"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-slate-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-8 pb-8 border-b">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {publishDate}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {readingTime} min read
            </span>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative h-[400px] md:h-[500px] mb-12 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg prose-slate max-w-none
              prose-headings:font-bold prose-headings:text-slate-900
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900 prose-strong:font-semibold
              prose-ul:my-6 prose-ol:my-6
              prose-li:text-slate-700 prose-li:my-2
              prose-img:rounded-lg prose-img:shadow-md
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
              prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6
              prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              prose-code:text-blue-600 prose-code:bg-slate-100 
              prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t bg-slate-50 -mx-4 px-4 md:-mx-8 md:px-8 py-8 rounded-lg">
            <p className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
              <Share2 className="h-5 w-5" />
              Share this post
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title
                )}&url=${encodeURIComponent(postUrl)}&via=insta_skul`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  postUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  postUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>

              <CopyLinkButton url={postUrl} />
            </div>
          </div>

          {/* Related Posts Section */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-2xl font-bold mb-6">What's Next?</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/blog"
                className="group p-6 border rounded-lg hover:shadow-md hover:border-blue-200 transition-all bg-white"
              >
                <p className="text-sm text-blue-600 font-medium mb-2 group-hover:translate-x-[-4px] transition-transform">
                  ← More Articles
                </p>
                <p className="font-semibold text-slate-900">Explore Our Blog</p>
                <p className="text-xs text-slate-600 mt-1">
                  Education insights & tips
                </p>
              </Link>

              <Link
                href="/dashboard/search"
                className="group p-6 border rounded-lg hover:shadow-md hover:border-blue-200 transition-all bg-white"
              >
                <p className="text-sm text-blue-600 font-medium mb-2 group-hover:translate-x-1 transition-transform">
                  Explore →
                </p>
                <p className="font-semibold text-slate-900">Browse Courses</p>
                <p className="text-xs text-slate-600 mt-1">
                  Discover courses from top educators
                </p>
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* Blog CTAs (client-side) */}
      <BlogCTAsClient postUrl={postUrl} />

      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt || post.title,
            image: post.coverImage,
            datePublished: post.createdAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: {
              "@type": "Organization",
              name: "InstaSkul",
            },
            publisher: {
              "@type": "Organization",
              name: "InstaSkul",
              logo: {
                "@type": "ImageObject",
                url: `${getBaseUrl()}/logo.png`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": postUrl,
            },
          }),
        }}
      />
    </div>
  );
}
