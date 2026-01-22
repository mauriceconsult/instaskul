// app/beta-signup/page.tsx
export default function BetaSignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold">Request Beta Access</h1>
        <p className="text-muted-foreground">
          InstaSkul is currently in closed beta. Join our waitlist to get early access.
        </p>
        
        <div className="space-y-4 text-left bg-card p-6 rounded-lg border">
          <h2 className="font-semibold">How to get access:</h2>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Follow us on social media for invitation code giveaways</li>
            <li>Ask a friend who's already using InstaSkul for their referral link</li>
            <li>Contact us directly at <a href="mailto:beta@instaskul.com" className="underline">beta@instaskul.com</a></li>
          </ol>
        </div>

        <div className="flex gap-4 justify-center">
          <a 
            href="https://twitter.com/instaskul" 
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            Twitter
          </a>
          <a 
            href="https://facebook.com/instaskul" 
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            Facebook
          </a>
          <a 
            href="https://instagram.com/instaskul" 
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            Instagram
          </a>
        </div>
      </div>
    </div>
  )
}