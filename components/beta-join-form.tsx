// components/beta-join-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface BetaJoinFormProps {
  inviteCode?: string
  referralCode?: string
}

export default function BetaJoinForm({ 
  inviteCode, 
  referralCode 
}: BetaJoinFormProps) {
  const router = useRouter()
  const [code, setCode] = useState(inviteCode || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First validate the code
      const validateRes = await fetch('/api/beta/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() })
      })

      const validateData = await validateRes.json()

      if (!validateRes.ok) {
        throw new Error(validateData.error || 'Invalid invitation code')
      }

      if (!validateData.valid) {
        throw new Error(validateData.reason || 'This invitation code is not valid')
      }

      // Then claim/redeem the code
      const claimRes = await fetch('/api/beta/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.toUpperCase(),
          referralCode 
        })
      })

      const claimData = await claimRes.json()

      if (!claimRes.ok) {
        throw new Error(claimData.error || 'Failed to claim invitation')
      }

      setSuccess(true)
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard/beta-welcome')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Join InstaSkul Beta</h1>
        <p className="text-muted-foreground">
          Enter your invitation code to get started
        </p>
      </div>

      {referralCode && (
        <Alert>
          <AlertDescription>
            🎉 You were referred by a friend! You'll both get rewards when you join.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Invitation Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="BETA-XXXX-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            disabled={loading || success}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Don't have a code? <a href="/beta-signup" className="underline">Request access</a>
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">
              ✅ Welcome to InstaSkul Beta! Redirecting to dashboard...
            </AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading || success || !code}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {success ? 'Access Granted!' : 'Join Beta'}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <p>Already have an account? <a href="/sign-in" className="underline">Sign in</a></p>
      </div>
    </div>
  )
}