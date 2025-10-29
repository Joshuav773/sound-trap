'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PRORequest {
  id: number
  userId: number
  proType: string
  memberNumber: string
  documentUrl: string
  documentType: string
  status: string
  adminNotes: string | null
  reviewedBy: number | null
  reviewedAt: string | null
  createdAt: string
  userName: string
  userEmail: string
}

export default function PROVerificationReviewPanel() {
  const [requests, setRequests] = useState<PRORequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PRORequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/api/pro-verification' 
        : `/api/pro-verification?status=${statusFilter}`
      
      const response = await fetch(url)
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch verification requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (requestId: number, status: 'approved' | 'rejected') => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/pro-verification', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId,
          status,
          adminNotes: adminNotes || null,
          reviewedBy: 1 // TODO: Get actual admin user ID
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: status === 'approved' ? "Request Approved" : "Request Rejected",
          description: `PRO verification request has been ${status}`
        })
        setSelectedRequest(null)
        setAdminNotes('')
        fetchRequests()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process request",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PRO Verification Requests</CardTitle>
          <CardDescription>Loading verification requests...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PRO Verification Review Panel
          </CardTitle>
          <CardDescription>
            Review and approve PRO membership verification requests from artists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Label htmlFor="statusFilter">Filter by Status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No verification requests found
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{request.userName}</h3>
                          <span className="text-muted-foreground">({request.userEmail})</span>
                          {getStatusIcon(request.status)}
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">PRO Organization:</span> {request.proType.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium">Member Number:</span> {request.memberNumber}
                          </div>
                          <div>
                            <span className="font-medium">Document Type:</span> {request.documentType.replace('_', ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span> {formatDate(request.createdAt)}
                          </div>
                        </div>
                        {request.adminNotes && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">Admin Notes:</span>
                            <p className="text-sm text-muted-foreground">{request.adminNotes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(request.documentUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                        {request.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Review PRO Verification Request</CardTitle>
            <CardDescription>
              Review the document and decide whether to approve or reject this PRO verification request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Artist:</span> {selectedRequest.userName}
              </div>
              <div>
                <span className="font-medium">PRO Organization:</span> {selectedRequest.proType.toUpperCase()}
              </div>
              <div>
                <span className="font-medium">Member Number:</span> {selectedRequest.memberNumber}
              </div>
              <div>
                <span className="font-medium">Document Type:</span> {selectedRequest.documentType.replace('_', ' ')}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about your decision (optional)"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => window.open(selectedRequest.documentUrl, '_blank')}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                View Document
              </Button>
              <Button
                onClick={() => handleReview(selectedRequest.id, 'approved')}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleReview(selectedRequest.id, 'rejected')}
                disabled={isProcessing}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => {
                  setSelectedRequest(null)
                  setAdminNotes('')
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
