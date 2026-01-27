// components/admin/blog-post-form-wrapper.tsx
"use client"

import { BlogPostForm } from './blog-post-form'

interface BlogPostFormWrapperProps {
  initialData?: {
    id?: string
    title: string
    content: string
    excerpt?: string
    coverImage?: string
    tags: string[]
    category?: string
    isPublished: boolean
  }
}

export function BlogPostFormWrapper({ initialData }: BlogPostFormWrapperProps) {
  return <BlogPostForm initialData={initialData} />
}