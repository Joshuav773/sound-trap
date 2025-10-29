'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  User, Music, TrendingUp, DollarSign, ShoppingCart, 
  Upload, Shield, Download, LogOut, Settings, 
  BarChart3, Users, Award, Calendar, Radio, FileText, CheckCircle, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/Header"
import PROVerificationRequest from "@/components/PROVerificationRequest"
import AccountDeletion from "@/components/AccountDeletion"

export default function Account() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [leasingTerms, setLeasingTerms] = useState("")
  const [publishingTerms, setPublishingTerms] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Load existing terms if they exist
      setLeasingTerms(parsedUser.leasingTerms || "")
      setPublishingTerms(parsedUser.publishingTerms || "")
    } else {
      router.push('/auth')
    }
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    })
  }

  const handleSaveTerms = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      // Update user with new terms
      const updatedUser = {
        ...user,
        leasingTerms: leasingTerms,
        publishingTerms: publishingTerms
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      toast({
        title: "Terms saved",
        description: "Your leasing and publishing terms have been updated."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save terms",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const roleConfig: Record<string, any> = {
    admin: {
      icon: Shield,
      label: 'Administrator',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      tabs: [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'beats', label: 'Manage Beats', icon: Music },
        { id: 'pro-verification', label: 'PRO Verification', icon: CheckCircle },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    },
    artist: {
      icon: Music,
      label: 'Producer',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      tabs: [
        { id: 'overview', label: 'Dashboard', icon: BarChart3 },
        { id: 'beats', label: 'My Beats', icon: Music },
        { id: 'earnings', label: 'Earnings', icon: DollarSign },
        { id: 'pro-verification', label: 'PRO Verification', icon: CheckCircle },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    },
    client: {
      icon: User,
      label: 'Buyer',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      tabs: [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
        { id: 'downloads', label: 'Downloads', icon: Download },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  }

  const config = roleConfig[user.role] || roleConfig.client
  const Icon = config.icon

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-10 h-10 ${config.color}`} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bgColor} ${config.color} border border-current/20`}>
                        {config.label}
                      </span>
                      <span className="text-muted-foreground text-sm">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 flex-wrap gap-2">
                  {user.role === 'admin' && (
                    <Button variant="outline" onClick={() => router.push('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Button>
                  )}
                  {(user.role === 'admin' || user.role === 'artist') && (
                    <>
                      <Button variant="outline" onClick={() => router.push('/upload')}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Beat
                      </Button>
                      <Button 
                        variant="default" 
                        onClick={() => {
                          // Automatically start the virtual room
                          const roomKey = `listening-room-${user.name.toLowerCase()}`
                          const roomData = {
                            isOpen: true,
                            startedAt: new Date().toISOString(),
                            artist: user.name
                          }
                          localStorage.setItem(roomKey, JSON.stringify(roomData))
                          
                          // Navigate to the room page
                          window.location.href = `/${encodeURIComponent(user.name)}/listening-room`
                        }}
                      >
                        <Radio className="mr-2 h-4 w-4" />
                        Start Virtual Room
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${config.tabs.length}, 1fr)` }}>
            {config.tabs.map((tab: any) => {
              const TabIcon = tab.icon
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                  <TabIcon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {user.role === 'admin' && (
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" />
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">50+</div>
                    <p className="text-sm text-muted-foreground">Active accounts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Music className="mr-2 h-5 w-5 text-secondary" />
                      Total Beats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">5,000+</div>
                    <p className="text-sm text-muted-foreground">In catalog</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-accent" />
                      Platform Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">$50K+</div>
                    <p className="text-sm text-muted-foreground">Total sales</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {user.role === 'artist' && (
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Music className="mr-2 h-5 w-5 text-primary" />
                      My Beats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">12</div>
                    <p className="text-sm text-muted-foreground">Uploaded beats</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-secondary" />
                      Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">47</div>
                    <p className="text-sm text-muted-foreground">Total sales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-accent" />
                      Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">$2,850</div>
                    <p className="text-sm text-muted-foreground">Total earned</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {user.role === 'client' && (
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
                      Purchases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">23</div>
                    <p className="text-sm text-muted-foreground">Beats bought</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Download className="mr-2 h-5 w-5 text-secondary" />
                      Downloads
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">67</div>
                    <p className="text-sm text-muted-foreground">Total downloads</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5 text-accent" />
                      Favorite Genre
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">Trap</div>
                    <p className="text-sm text-muted-foreground">Most purchased</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Other Tabs based on role */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Display Name</label>
                    <input 
                      type="text" 
                      value={user.name}
                      className="w-full mt-2 px-4 py-2 bg-card border border-border rounded-lg"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input 
                      type="email" 
                      value={user.email}
                      className="w-full mt-2 px-4 py-2 bg-card border border-border rounded-lg"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <input 
                      type="text" 
                      value={config.label}
                      className="w-full mt-2 px-4 py-2 bg-card border border-border rounded-lg"
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Licensing Terms - Only for Artists and Admins */}
            {(user.role === 'artist' || user.role === 'admin') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Licensing & Publishing Terms
                  </CardTitle>
                  <CardDescription>
                    Set your terms for leasing and publishing rights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="leasing-terms">Leasing Terms</Label>
                    <Textarea
                      id="leasing-terms"
                      placeholder="Enter your leasing terms, copyright information, usage rights, and any restrictions..."
                      value={leasingTerms}
                      onChange={(e) => setLeasingTerms(e.target.value)}
                      className="min-h-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      These terms will be shown to buyers purchasing lease rights
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publishing-terms">Publishing Terms</Label>
                    <Textarea
                      id="publishing-terms"
                      placeholder="Enter your publishing terms, royalties, splits, and exclusive rights information..."
                      value={publishingTerms}
                      onChange={(e) => setPublishingTerms(e.target.value)}
                      className="min-h-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      These terms will be shown to buyers purchasing exclusive rights
                    </p>
                  </div>

                  <Button 
                    onClick={handleSaveTerms}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? 'Saving...' : 'Save Terms'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Account Deletion - Dangerous Zone */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccountDeletion userId={user.id} userRole={user.role} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder for other tabs */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/admin/users')} className="w-full">
                  Go to User Management
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Beats</CardTitle>
                <CardDescription>Upload and manage your beats</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/upload')} className="w-full">
                  Upload New Beat
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>View your past purchases and licenses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No purchases yet. Start exploring!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pro-verification" className="space-y-6">
            <PROVerificationRequest userId={user.id} userRole={user.role} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
