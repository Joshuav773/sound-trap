'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Users, PowerOff, Radio, Music, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Header from "@/components/Header"

export default function ArtistListeningRoom() {
  const params = useParams()
  const router = useRouter()
  const artist = params.artist as string
  const [roomUsers, setRoomUsers] = useState<Array<{ name: string; status: string; isOwner?: boolean }>>([])
  const [isRoomOpen, setIsRoomOpen] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState('')
  const [guestName, setGuestName] = useState('')
  const [showGuestNamePrompt, setShowGuestNamePrompt] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const roomStorageKey = `listening-room-${decodeURIComponent(artist).toLowerCase()}`

  // Get current user info
  useEffect(() => {
    const checkRoom = () => {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setUserName(user.name)
        setIsAuthenticated(true)
        // Decode artist name for comparison
        const decodedArtist = decodeURIComponent(artist)
        // Check if current user is the artist/owner (compare with decoded artist)
        const isArtistOwner = user.name?.toLowerCase() === decodedArtist.toLowerCase() || user.email?.includes(decodedArtist.toLowerCase())
        const adminCheck = user.role === 'admin'
        setIsAdmin(adminCheck)
        setIsOwner(isArtistOwner || adminCheck) // Artist can start their own room, admin can start any room
        
        // Check if room exists in storage
        const roomData = localStorage.getItem(roomStorageKey)
        if (roomData) {
          const room = JSON.parse(roomData)
          setIsRoomOpen(room.isOpen === true)
        } else {
          setIsRoomOpen(false)
        }
      } else {
        setIsAuthenticated(false)
        // For guests, check if room exists
        const roomData = localStorage.getItem(roomStorageKey)
        if (roomData) {
          const room = JSON.parse(roomData)
          setIsRoomOpen(room.isOpen === true)
          if (room.isOpen === true) {
            setShowGuestNamePrompt(true)
          }
        } else {
          setIsRoomOpen(false)
        }
      }
      setIsLoading(false) // Mark loading as complete
    }

    // Check immediately
    checkRoom()
    
    // Also check after a short delay to handle timing issues
    const timeout = setTimeout(checkRoom, 100)
    
    return () => clearTimeout(timeout)
  }, [artist, roomStorageKey])

  // Check room status periodically (in production, use WebSockets)
  useEffect(() => {
    if (!isOwner) {
      const interval = setInterval(() => {
        const roomData = localStorage.getItem(roomStorageKey)
        if (roomData) {
          const room = JSON.parse(roomData)
          if (room.isOpen !== true && isRoomOpen) {
            setIsRoomOpen(false)
            alert('The artist has ended the listening room. You will be redirected.')
            router.push('/')
          } else {
            setIsRoomOpen(room.isOpen === true)
          }
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isOwner, isRoomOpen, roomStorageKey, router])


  const endRoom = () => {
    if (confirm('Are you sure you want to end the listening room? All participants will be disconnected.')) {
      localStorage.removeItem(roomStorageKey)
      setIsRoomOpen(false)
      router.push('/')
    }
  }

  const addUser = () => {
    const displayName = isAuthenticated ? userName : guestName
    if (!displayName) return
    
    setRoomUsers(prev => {
      const exists = prev.find(u => u.name === displayName)
      if (!exists) {
        return [...prev, { name: displayName, status: 'listening', isOwner: isOwner }]
      }
      return prev
    })
  }

  const handleGuestNameSubmit = () => {
    if (guestName.trim()) {
      setShowGuestNamePrompt(false)
      addUser()
    }
  }

  useEffect(() => {
    if (isRoomOpen) {
      addUser()
    }
  }, [isRoomOpen])

  // Decode the artist name from URL
  const decodedArtist = decodeURIComponent(artist)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would use WebSockets
      if (Math.random() > 0.9) {
        setRoomUsers(prev => [...prev, { name: `User${prev.length}`, status: 'listening' }])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Redirect to 404 if room is not open (only after loading is complete)
  useEffect(() => {
    if (!isLoading && !isRoomOpen) {
      router.push('/not-found')
    }
  }, [isRoomOpen, isLoading, router])

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Guest name prompt modal
  if (showGuestNamePrompt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Join {decodedArtist}'s Room</h2>
            <p className="text-muted-foreground mb-6">
              Enter your name to join the listening session
            </p>
            <div className="space-y-4">
              <Input
                placeholder="Your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuestNameSubmit()}
                className="text-center"
              />
              <Button 
                onClick={handleGuestNameSubmit} 
                className="w-full"
                disabled={!guestName.trim()}
              >
                Join Room
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{decodedArtist}'s Room</h1>
            <p className="text-xl text-muted-foreground">Live listening session</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
              <Users className="mr-2 h-5 w-5" />
              {roomUsers.length} listening
            </Badge>
            {(isOwner || isAdmin) && (
              <Button variant="destructive" onClick={endRoom} size="lg">
                <PowerOff className="mr-2 h-5 w-5" />
                {isAdmin ? 'End Room (Moderation)' : 'End Room'}
              </Button>
            )}
          </div>
        </div>

        {/* Room Display with Connected Users */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Room Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <Radio className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{decodedArtist}'s Room</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Live listening session in progress
                  </p>
                </div>

                <div className="space-y-4">
                  <Badge className="bg-primary text-primary-foreground text-lg px-6 py-3">
                    <Users className="mr-2 h-5 w-5" />
                    {roomUsers.length} listening
                  </Badge>
                  
                  <div className="text-sm text-muted-foreground">
                    {isOwner ? 'You are hosting this room' : 'You are listening to this room'}
                  </div>

                  <div className="flex justify-center mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        alert('Room link copied to clipboard!')
                      }}
                    >
                      Share Room
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connected Users Widget */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Connected Users ({roomUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {roomUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{user.name}</span>
                          {user.isOwner && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Host
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground capitalize">{user.status}</span>
                      </div>
                    </div>
                  ))}
                  {roomUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No users connected yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
