// app/payment/success/page.tsx
import { InstaSkulLogo } from '@/components/instaskul-logo'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage({
  searchParams
}: {
  searchParams: { ref?: string }
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Small logo at top */}
      <div className="mb-8">
        <InstaSkulLogo size="sm" showTagline={false} />
      </div>

      {/* Success message */}
      <div className="max-w-md text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your course enrollment is complete. You can start learning now.
          </p>
        </div>

        <div className="bg-muted p-4 rounded-lg text-sm">
          <p className="text-muted-foreground">Transaction Reference</p>
          <p className="font-mono font-semibold">{searchParams.ref}</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="lg">Browse Courses</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}