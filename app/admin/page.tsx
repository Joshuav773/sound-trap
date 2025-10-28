'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Trash2, Shield, User as UserIcon, LogOut, Search, Radio, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import Header from "@/components/Header"

export default function AdminPanel() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const checkAccess = async () => {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        if (user.role === 'admin') {
          setIsAdmin(true)
        } else {
          router.push('/')
        }
      } else {
        router.push('/')
      }
      setIsLoading(false)
    }
    checkAccess()
  }, [router])

  const { data: users, refetch } = useQuery({
    queryKey: ['/api/users'],
  }) as { data: any[], refetch: () => void }

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "User deleted",
          description: `${userName} has been removed`
        })
        refetch()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const roleBadges: Record<string, { label: string; className: string }> = {
    admin: { label: 'Admin', className: 'bg-red-500/20 text-red-500 border-red-500/30' },
    artist: { label: 'Artist', className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
    client: { label: 'Client', className: 'bg-green-500/20 text-green-500 border-green-500/30' }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Active Rooms Widget */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Radio className="mr-2 h-5 w-5 text-primary" />
              Active Listening Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveRoomsWidget />
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                All Users ({users?.length || 0})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(users || []).filter((user: any) => {
                if (!searchQuery) return true
                const query = searchQuery.toLowerCase()
                return user.name?.toLowerCase().includes(query) || 
                       user.email?.toLowerCase().includes(query)
              }).length > 0 ? (
                (users || []).filter((user: any) => {
                  if (!searchQuery) return true
                  const query = searchQuery.toLowerCase()
                  return user.name?.toLowerCase().includes(query) || 
                         user.email?.toLowerCase().includes(query)
                }).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${roleBadges[user.role]?.className}`}>
                        {roleBadges[user.role]?.label || user.role}
                      </span>
                    </div>
                    {user.role !== 'admin' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No Users Found' : 'No Users Yet'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? 'No users match your search criteria.' 
                      : 'No users have registered yet.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Active Rooms Widget Component
function ActiveRoomsWidget() {
  const [activeRooms, setActiveRooms] = useState<Array<{ artist: string; key: string }>>([])
  const { toast } = useToast()

  useEffect(() => {
    const checkActiveRooms = () => {
      const rooms: Array<{ artist: string; key: string }> = []
      
      // Check localStorage for listening room keys
      if (typeof window !== 'undefined' && localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('listening-room-')) {
            const roomData = localStorage.getItem(key)
            if (roomData) {
              try {
                const room = JSON.parse(roomData)
                if (room.isOpen === true) {
                  const artist = key.replace('listening-room-', '')
                  rooms.push({ artist, key })
                }
              } catch (e) {
                // Ignore invalid JSON
              }
            }
          }
        }
      }
      
      setActiveRooms(rooms)
    }

    checkActiveRooms()
    const interval = setInterval(checkActiveRooms, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const endRoom = (artist: string, key: string) => {
    if (confirm(`End the listening room for ${artist}?`)) {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.removeItem(key)
      }
      toast({
        title: "Room ended",
        description: `${artist}'s listening room has been closed.`
      })
      setActiveRooms(prev => prev.filter(r => r.key !== key))
    }
  }

  if (activeRooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Radio className="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p>No active listening rooms</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeRooms.map((room) => (
        <div key={room.key} className="p-4 border border-border rounded-lg bg-card/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="font-semibold capitalize">{room.artist}</p>
              <p className="text-sm text-muted-foreground">Active room</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(`/${encodeURIComponent(room.artist)}/listening-room`, '_blank')}
            >
              View
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => endRoom(room.artist, room.key)}
            >
              <PowerOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}