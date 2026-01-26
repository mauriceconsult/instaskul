// app/blog/[slug]/page.tsx

import { getPostBySlug } from "@/lib/blog"
import { notFound } from "next/navigation"

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="prose mx-auto py-12">
      <h1>{post.title}</h1>
      <p className="text-gray-500">{post.date}</p>

      {/* however you render content */}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
