'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Shield } from 'lucide-react'
import type { User } from '@shared/schema'

interface PROVerificationSectionProps {
  selectedUser: User | null
  onSuccess: () => void
}

export default function PROVerificationSection({ selectedUser, onSuccess }: PROVerificationSectionProps) {
  const [proType, setProType] = useState<string>('')
  const [memberNumber, setMemberNumber] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState(false)
  const { toast } = useToast()

  const handleVerifyPRO = async () => {
    if (!selectedUser || !proType || !memberNumber.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a PRO type and enter a member number',
        variant: 'destructive'
      })
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch('/api/verification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          proType,
          memberNumber: memberNumber.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to verify PRO membership')
      }

      toast({
        title: 'PRO Membership Verified!',
        description: `User has been verified with ${proType} membership`
      })

      // Reset form
      setProType('')
      setMemberNumber('')
      onSuccess()
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Failed to verify PRO membership. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const getPROColor = (pro: string) => {
    switch (pro.toLowerCase()) {
      case 'ascap': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'bmi': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'sesac': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">PRO Organization</Label>
          <Select value={proType} onValueChange={setProType}>
            <SelectTrigger>
              <SelectValue placeholder="Select PRO..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ascap">ASCAP</SelectItem>
              <SelectItem value="bmi">BMI</SelectItem>
              <SelectItem value="sesac">SESAC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Member Number</Label>
          <Input
            type="text"
            placeholder="Enter member number..."
            value={memberNumber}
            onChange={(e) => setMemberNumber(e.target.value)}
          />
        </div>
      </div>

      {proType && (
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={getPROColor(proType)}>
              {proType.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">Membership Verification</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Verifying {proType.toUpperCase()} membership will:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Set verification status to &quot;Verified&quot;</li>
            <li>Assign a trust score of 50 points</li>
            <li>Store the member number for future reference</li>
            <li>Display a verified badge on the user's profile</li>
          </ul>
        </div>
      )}

      <Button 
        onClick={handleVerifyPRO}
        disabled={isVerifying || !proType || !memberNumber.trim()}
        className="w-full"
      >
        <Shield className="w-4 h-4 mr-2" />
        {isVerifying ? 'Verifying...' : 'Verify PRO Membership'}
      </Button>
    </div>
  )
}
