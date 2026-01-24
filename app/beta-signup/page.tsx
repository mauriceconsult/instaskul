// app/beta-signup/page.tsx
import { InstaSkulLogo } from '@/components/instaskul-logo'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BetaSignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <InstaSkulLogo size="lg" />
      </div>

      {/* Content */}
      <div className="max-w-md space-y-6 text-center bg-card p-8 rounded-lg border shadow-lg">
        <h1 className="text-3xl font-bold">Request Beta Access</h1>
        <p className="text-muted-foreground">
          InstaSkul is currently in closed beta. Join our waitlist to get early access.
        </p>
        
        <div className="space-y-4 text-left bg-muted p-6 rounded-lg">
          <h2 className="font-semibold text-center">How to get access:</h2>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Follow us on social media for invitation code giveaways</li>
            <li>Ask a friend who's already using InstaSkul for their referral link</li>
            <li>Contact us directly at{' '}
              <a href="mailto:beta@instaskul.com" className="underline text-primary">
                beta@instaskul.com
              </a>
            </li>
          </ol>
        </div>

        <div className="flex gap-4 justify-center pt-4">
          <Button variant="outline" asChild>
            <a 
              href="https://twitter.com/instaskul" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Twitter
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a 
              href="https://facebook.com/instaskul" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a 
              href="https://instagram.com/instaskul" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </Button>
        </div>
      </div>

      {/* Back to home */}
      <div className="mt-8">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}