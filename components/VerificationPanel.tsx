'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import VerificationBadge, { TrustScore } from '@/components/VerificationBadge'
import PROVerificationSection from '@/components/PROVerificationSection'
import { Shield, UserCheck, AlertTriangle, CheckCircle, Music } from 'lucide-react'
import type { User } from '@shared/schema'

interface VerificationStatus {
  isVerified: boolean
  verificationMethod: string | null
  verificationDate: string | null
  trustScore: number
  verificationBadge: string
  ascapMemberNumber?: string | null
  bmiMemberNumber?: string | null
  sesacMemberNumber?: string | null
}

export default function VerificationPanel() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [verificationData, setVerificationData] = useState<VerificationStatus>({
    isVerified: false,
    verificationMethod: null,
    verificationDate: null,
    trustScore: 0,
    verificationBadge: 'unverified'
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch all users
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  })

  // Fetch verification status for selected user
  const { data: verificationStatus } = useQuery<VerificationStatus>({
    queryKey: ['/api/verification', selectedUser?.id],
    enabled: !!selectedUser,
  })

  // Update verification status mutation
  const updateVerificationMutation = useMutation({
    mutationFn: async (data: Partial<VerificationStatus>) => {
      const response = await fetch('/api/verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser?.id, ...data })
      })
      if (!response.ok) throw new Error('Failed to update verification')
      return response.json()
    },
    onSuccess: () => {
      toast({ title: 'Verification updated successfully!' })
      queryClient.invalidateQueries({ queryKey: ['/api/verification'] })
    },
    onError: () => {
      toast({ title: 'Failed to update verification', variant: 'destructive' })
    }
  })

  // Calculate trust score mutation
  const calculateTrustScoreMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser?.id })
      })
      if (!response.ok) throw new Error('Failed to calculate trust score')
      return response.json()
    },
    onSuccess: (data) => {
      setVerificationData(data)
      toast({ title: 'Trust score calculated successfully!' })
      queryClient.invalidateQueries({ queryKey: ['/api/verification'] })
    },
    onError: () => {
      toast({ title: 'Failed to calculate trust score', variant: 'destructive' })
    }
  })

  useEffect(() => {
    if (verificationStatus) {
      setVerificationData(verificationStatus)
    }
  }, [verificationStatus])

  const handleVerificationUpdate = () => {
    updateVerificationMutation.mutate(verificationData)
  }

  const handleCalculateTrustScore = () => {
    calculateTrustScoreMutation.mutate()
  }

  const getVerificationMethodColor = (method: string | null) => {
    switch (method) {
      case 'identity': return 'bg-green-100 text-green-800'
      case 'portfolio': return 'bg-blue-100 text-blue-800'
      case 'references': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Producer Verification Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="verification">Verification Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <div className="space-y-2">
                <Label>Select User to Verify</Label>
                <Select onValueChange={(userId) => {
                  const user = users?.find(u => u.id.toString() === userId)
                  setSelectedUser(user || null)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="text-muted-foreground">({user.email})</span>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <p className="text-sm font-medium">{selectedUser.name}</p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="text-sm font-medium">{selectedUser.email}</p>
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Badge variant="outline">{selectedUser.role}</Badge>
                      </div>
                      <div>
                        <Label>Member Since</Label>
                        <p className="text-sm font-medium">
                          {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              {selectedUser ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5" />
                        Current Verification Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Verification Status</Label>
                          <VerificationBadge 
                            badge={verificationData.verificationBadge as any} 
                            size="md" 
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Trust Score</Label>
                          <TrustScore score={verificationData.trustScore} />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Verification Method</Label>
                          {verificationData.verificationMethod ? (
                            <Badge className={getVerificationMethodColor(verificationData.verificationMethod)}>
                              {verificationData.verificationMethod}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not verified</span>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Verified Date</Label>
                          <p className="text-sm font-medium">
                            {verificationData.verificationDate 
                              ? new Date(verificationData.verificationDate).toLocaleDateString()
                              : 'Not verified'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Update Verification Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Verification Method</Label>
                          <Select 
                            value={verificationData.verificationMethod || ''} 
                            onValueChange={(value) => setVerificationData({
                              ...verificationData,
                              verificationMethod: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select method..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="identity">Identity Verification</SelectItem>
                              <SelectItem value="portfolio">Portfolio Review</SelectItem>
                              <SelectItem value="references">Reference Check</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Verification Badge</Label>
                          <Select 
                            value={verificationData.verificationBadge} 
                            onValueChange={(value) => setVerificationData({
                              ...verificationData,
                              verificationBadge: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unverified">Unverified</SelectItem>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="elite">Elite</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Manual Trust Score Override</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={verificationData.trustScore}
                          onChange={(e) => setVerificationData({
                            ...verificationData,
                            trustScore: parseInt(e.target.value) || 0
                          })}
                          placeholder="0-100"
                        />
                      </div>

                      {/* PRO Membership Verification Section */}
                      <div className="border-t pt-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <Music className="w-5 h-5 text-primary" />
                          <Label className="text-lg font-semibold">PRO (Performing Rights Organization) Verification</Label>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Verify ASCAP, BMI, or SESAC membership to quickly establish trust and credibility.
                        </p>
                        <PROVerificationSection 
                          selectedUser={selectedUser}
                          onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/verification'] })
                            toast({ title: 'PRO membership verified successfully!' })
                          }}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleVerificationUpdate}
                          disabled={updateVerificationMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Update Verification
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleCalculateTrustScore}
                          disabled={calculateTrustScoreMutation.isPending}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Calculate Trust Score
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No User Selected</h3>
                    <p className="text-muted-foreground">
                      Please select a user from the User Management tab to view and update their verification status.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
