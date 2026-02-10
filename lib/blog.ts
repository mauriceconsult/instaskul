// lib/blog.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { getBlogPostUrl } from './url' // ADD THIS

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  readTime: string
  image?: string
  tags: string[]
  content: string
  url: string 
}

export interface BlogPostMetadata {
  slug: string
  title: string
  description: string
  date: string
  author: string
  readTime: string
  image?: string
  tags: string[]
  url: string // ADD THIS
}

export async function getAllPosts(): Promise<BlogPostMetadata[]> {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        readTime: data.readTime,
        image: data.image,
        tags: data.tags || [],
        url: getBlogPostUrl(slug) // ADD THIS
      } as BlogPostMetadata
    })

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    const processedContent = await remark()
      .use(html)
      .process(content)
    const contentHtml = processedContent.toString()

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      readTime: data.readTime,
      image: data.image,
      tags: data.tags || [],
      content: contentHtml,
      url: getBlogPostUrl(slug) // ADD THIS
    }
  } catch (error) {
    return null
  }
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min read`
}

// ADD THIS - for social sharing
export function getSocialShareLinks(slug: string) {
  return {
    twitter: getBlogPostUrl(slug, { source: 'twitter', campaign: 'blog_share' }),
    facebook: getBlogPostUrl(slug, { source: 'facebook', campaign: 'blog_share' }),
    linkedin: getBlogPostUrl(slug, { source: 'linkedin', campaign: 'blog_share' }),
  }
}