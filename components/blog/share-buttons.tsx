// components/blog/share-buttons.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Share2, Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ShareButtonsProps {
  url: string
  title: string
  description: string
}

export default function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  // Check if native share is available
  useEffect(() => {
    setCanShare(
      typeof navigator !== 'undefined' && 
      typeof navigator.share === 'function'
    )
  }, [])

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const nativeShare = async () => {
    if (!canShare) return

    try {
      await navigator.share({
        title,
        text: description,
        url
      })
    } catch (err) {
      // User cancelled share or error occurred
      console.log('Share cancelled or failed:', err)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Share2 className="h-4 w-4" />
        <span>Share:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </Button>
        </a>

        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </Button>
        </a>

        <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </Button>
        </a>

        <Button variant="outline" size="sm" onClick={copyLink}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </>
          )}
        </Button>

        {canShare && (
          <Button variant="outline" size="sm" onClick={nativeShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </div>
    </div>
  )
}