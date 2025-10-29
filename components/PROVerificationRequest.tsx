'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PROVerificationRequestProps {
  userId: number
  userRole: string
}

export default function PROVerificationRequest({ userId, userRole }: PROVerificationRequestProps) {
  const [proType, setProType] = useState('')
  const [memberNumber, setMemberNumber] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState('')
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleFileUpload = async () => {
    if (!file || !documentType) {
      toast({
        title: "Error",
        description: "Please select a file and document type",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const response = await fetch('/api/upload-pro-document', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadedFileUrl(result.fileUrl)
        toast({
          title: "File Uploaded",
          description: "Document uploaded successfully"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!proType || !memberNumber || !uploadedFileUrl || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload a document",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/pro-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          proType,
          memberNumber,
          documentUrl: uploadedFileUrl,
          documentType
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Request Submitted",
          description: "Your PRO verification request has been submitted for review"
        })
        // Reset form
        setProType('')
        setMemberNumber('')
        setDocumentType('')
        setFile(null)
        setUploadedFileUrl('')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (userRole !== 'artist' && userRole !== 'admin') {
    return null
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PRO Verification Request
        </CardTitle>
        <CardDescription>
          Submit your PRO membership documents for verification. This helps build trust and credibility on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="proType">PRO Organization *</Label>
            <Select value={proType} onValueChange={setProType}>
              <SelectTrigger>
                <SelectValue placeholder="Select PRO organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ascap">ASCAP</SelectItem>
                <SelectItem value="bmi">BMI</SelectItem>
                <SelectItem value="sesac">SESAC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memberNumber">Member Number *</Label>
            <Input
              id="memberNumber"
              value={memberNumber}
              onChange={(e) => setMemberNumber(e.target.value)}
              placeholder="Enter your PRO member number"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type *</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="certificate">Membership Certificate</SelectItem>
              <SelectItem value="screenshot">Dashboard Screenshot</SelectItem>
              <SelectItem value="email_confirmation">Email Confirmation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document">Upload Document *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="document"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button 
                onClick={handleFileUpload} 
                disabled={!file || !documentType || isUploading}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Accepted formats: JPEG, PNG, PDF (max 5MB)
            </p>
          </div>

          {uploadedFileUrl && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Document uploaded successfully
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional information about your PRO membership..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!proType || !memberNumber || !uploadedFileUrl || !documentType || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Verification Request'}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">What happens next?</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Your request will be reviewed by our admin team</li>
            <li>You'll receive a notification once the review is complete</li>
            <li>If approved, your PRO verification will be added to your profile</li>
            <li>This helps increase your trust score and credibility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
