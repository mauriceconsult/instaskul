// components/beta-join-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
// import { getAbsoluteUrl } from '@/lib/url' // ADD THIS

interface BetaJoinFormProps {
  inviteCode?: string
  referralCode?: string
}

export default function BetaJoinForm({ inviteCode, referralCode }: BetaJoinFormProps) {
  const router = useRouter()
  const [code, setCode] = useState(inviteCode || '')
  const [validating, setValidating] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    message: string
  } | null>(null)

  const validateCode = async () => {
    if (!code.trim()) {
      setValidationResult({
        valid: false,
        message: 'Please enter an invitation code'
      })
      return
    }

    setValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch('/api/beta/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      })

      const data = await response.json()

      setValidationResult({
        valid: data.valid,
        message: data.message || (data.valid ? 'Code is valid!' : 'Invalid code')
      })
    } catch (error) {
      setValidationResult({
        valid: false,
        message: 'Failed to validate code. Please try again.'
      })
    } finally {
      setValidating(false)
    }
  }

  const claimInvite = async () => {
    setClaiming(true)

    try {
      const response = await fetch('/api/beta/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.trim(),
          referralCode: referralCode 
        })
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to welcome page
        router.push('/dashboard/beta-welcome')
      } else {
        setValidationResult({
          valid: false,
          message: data.error || 'Failed to claim invitation'
        })
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        message: 'Failed to claim invitation. Please try again.'
      })
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="max-w-md w-full bg-card p-8 rounded-lg border shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Join InstaSkul Beta</h2>
        <p className="text-muted-foreground">
          Enter your invitation code to get started
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="code">Invitation Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="XXXX-XXXX-XXXX"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setValidationResult(null)
            }}
            disabled={validating || claiming}
          />
        </div>

        {validationResult && (
          <Alert variant={validationResult.valid ? 'default' : 'destructive'}>
            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{validationResult.message}</AlertDescription>
            </div>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={validateCode}
            disabled={!code.trim() || validating || claiming}
            variant="outline"
            className="flex-1"
          >
            {validating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate Code'
            )}
          </Button>

          <Button
            onClick={claimInvite}
            disabled={!validationResult?.valid || claiming}
            className="flex-1"
          >
            {claiming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              'Claim Invite'
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Don't have a code?{' '}
          <a href="/beta-signup" className="text-primary hover:underline">
            Request access
          </a>
        </div>
      </div>

      {referralCode && (
        <div className="mt-4 p-3 bg-primary/10 rounded text-sm">
          🎁 You were referred by a friend! You'll both get rewards when you join.
        </div>
      )}
    </div>
  )
}