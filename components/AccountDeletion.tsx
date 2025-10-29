'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  Trash2, 
  Shield, 
  Lock, 
  XCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Music,
  ShoppingCart,
  Award
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface AccountDeletionProps {
  userId: number
  userRole: string
}

interface DeletionRequirements {
  canDelete: boolean
  blockingReasons: string[]
  dataSummary: {
    beats: number
    storeProducts: number
    purchases: number
    pendingVerifications: number
  }
  warnings: string[]
}

export default function AccountDeletion({ userId, userRole }: AccountDeletionProps) {
  const [step, setStep] = useState(1)
  const [requirements, setRequirements] = useState<DeletionRequirements | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  
  // Step 1: Requirements check
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState(false)
  
  // Step 2: Confirmation details
  const [confirmationText, setConfirmationText] = useState('')
  const [password, setPassword] = useState('')
  const [reason, setReason] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Step 3: Final confirmation
  const [finalConfirmation, setFinalConfirmation] = useState(false)
  
  const { toast } = useToast()
  const router = useRouter()

  const requiredConfirmationText = "DELETE MY ACCOUNT PERMANENTLY"

  useEffect(() => {
    fetchRequirements()
  }, [])

  const fetchRequirements = async () => {
    try {
      const response = await fetch(`/api/account-deletion?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setRequirements(data)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load deletion requirements",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load deletion requirements",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = () => {
    if (step === 1 && !acknowledgedWarnings) {
      toast({
        title: "Required",
        description: "You must acknowledge all warnings before proceeding",
        variant: "destructive"
      })
      return
    }
    
    if (step === 2) {
      if (confirmationText !== requiredConfirmationText) {
        toast({
          title: "Invalid Confirmation",
          description: `Please type exactly: ${requiredConfirmationText}`,
          variant: "destructive"
        })
        return
      }
      
      if (password.length < 3) {
        toast({
          title: "Invalid Password",
          description: "Please enter your current password",
          variant: "destructive"
        })
        return
      }
      
      if (reason.length < 10) {
        toast({
          title: "Insufficient Reason",
          description: "Please provide a detailed reason (at least 10 characters)",
          variant: "destructive"
        })
        return
      }
    }
    
    setStep(step + 1)
  }

  const handleDeleteAccount = async () => {
    if (!finalConfirmation) {
      toast({
        title: "Final Confirmation Required",
        description: "You must check the final confirmation box",
        variant: "destructive"
      })
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/account-deletion', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          confirmationText,
          password,
          reason
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted",
          duration: 5000
        })
        
        // Clear local storage and redirect
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Deletion</CardTitle>
          <CardDescription>Loading deletion requirements...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!requirements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Deletion</CardTitle>
          <CardDescription>Unable to load deletion requirements</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!requirements.canDelete) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            Account Deletion Blocked
          </CardTitle>
          <CardDescription>
            Your account cannot be deleted at this time due to the following reasons:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {requirements.blockingReasons.map((reason, index) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{reason}</AlertDescription>
              </Alert>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Please resolve these issues before attempting to delete your account:</p>
            <ul className="space-y-1 list-disc list-inside">
              {requirements.blockingReasons.includes('Active purchases exist') && (
                <li>Complete or cancel any pending purchases</li>
              )}
              {requirements.blockingReasons.includes('Pending PRO verification requests') && (
                <li>Wait for PRO verification to complete or cancel the request</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= stepNumber 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`w-12 h-1 mx-2 ${
                step > stepNumber ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Requirements and Warnings */}
      {step === 1 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Account Deletion Requirements
            </CardTitle>
            <CardDescription>
              Review the following information before proceeding with account deletion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Summary */}
            <div>
              <h3 className="font-semibold mb-3">Your Account Data Summary:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Beats: {requirements.dataSummary.beats}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Store Products: {requirements.dataSummary.storeProducts}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Purchases: {requirements.dataSummary.purchases}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Verifications: {requirements.dataSummary.pendingVerifications}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Warnings */}
            <div>
              <h3 className="font-semibold mb-3 text-red-600 dark:text-red-400">⚠️ Important Warnings:</h3>
              <div className="space-y-2">
                {requirements.warnings.map((warning, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>

            <Separator />

            {/* Acknowledgment */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acknowledge"
                checked={acknowledgedWarnings}
                onCheckedChange={(checked) => setAcknowledgedWarnings(checked as boolean)}
              />
              <Label htmlFor="acknowledge" className="text-sm leading-relaxed">
                I understand that this action is <strong>PERMANENT</strong> and cannot be undone. 
                I acknowledge that all my data will be deleted and I will lose access to my account forever.
              </Label>
            </div>

            <Button 
              onClick={handleNextStep}
              disabled={!acknowledgedWarnings}
              variant="destructive"
              className="w-full"
            >
              I Understand - Continue to Next Step
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Confirmation Details */}
      {step === 2 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Shield className="h-5 w-5" />
              Confirm Account Deletion
            </CardTitle>
            <CardDescription>
              Provide the required information to confirm your identity and intent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="confirmation-text">
                Type the following text exactly: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">{requiredConfirmationText}</code>
              </Label>
              <Input
                id="confirmation-text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={requiredConfirmationText}
                className={confirmationText === requiredConfirmationText ? 'border-green-500' : 'border-red-500'}
              />
              {confirmationText === requiredConfirmationText && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Confirmation text matches
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Current Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Deletion (Minimum 10 characters)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you want to delete your account..."
                rows={4}
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground">
                Characters: {reason.length}/10 minimum
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleNextStep}
                variant="destructive"
                className="flex-1"
                disabled={
                  confirmationText !== requiredConfirmationText ||
                  password.length < 3 ||
                  reason.length < 10
                }
              >
                Continue to Final Step
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Final Confirmation */}
      {step === 3 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Lock className="h-5 w-5" />
              Final Confirmation
            </CardTitle>
            <CardDescription>
              This is your last chance to cancel. Once confirmed, your account will be permanently deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>FINAL WARNING:</strong> This action cannot be undone. Your account and all associated data will be permanently deleted.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold">Summary of what will be deleted:</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-blue-500" />
                  <span>{requirements.dataSummary.beats} beats</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span>{requirements.dataSummary.storeProducts} store products</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-purple-500" />
                  <span>{requirements.dataSummary.purchases} purchase records</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span>Verification status and trust score</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="final-confirmation"
                checked={finalConfirmation}
                onCheckedChange={(checked) => setFinalConfirmation(checked as boolean)}
              />
              <Label htmlFor="final-confirmation" className="text-sm leading-relaxed">
                I confirm that I want to <strong>PERMANENTLY DELETE</strong> my account and all associated data. 
                I understand this action cannot be undone.
              </Label>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleDeleteAccount}
                variant="destructive"
                className="flex-1"
                disabled={!finalConfirmation || deleting}
              >
                {deleting ? (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting Account...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    DELETE ACCOUNT PERMANENTLY
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
