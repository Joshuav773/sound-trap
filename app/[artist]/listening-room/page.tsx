'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Users, PowerOff, Radio, Music, User, Heart, MessageCircle, Volume2, VolumeX, Play, Pause, SkipForward, Share2, Copy } from "lucide-react"
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
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState("Untitled Beat")
  const [chatMessages, setChatMessages] = useState<Array<{id: number, user: string, message: string, timestamp: Date}>>([])
  const [newMessage, setNewMessage] = useState('')
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
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

  // Interactive functions for listeners
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value))
  }

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1)
      setHasLiked(true)
    }
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const displayName = isAuthenticated ? userName : guestName
      const message = {
        id: Date.now(),
        user: displayName,
        message: newMessage.trim(),
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href)
    // In production, show a toast notification
    alert('Room link copied to clipboard!')
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
      
      // Simulate chat messages
      if (Math.random() > 0.95 && chatMessages.length < 10) {
        const demoMessages = [
          "This beat is fire! 🔥",
          "Love the vibe",
          "Can't stop listening to this",
          "Amazing work!",
          "This goes hard",
          "Where can I buy this?",
          "Incredible production",
          "The mix is perfect",
          "This is going viral",
          "Pure talent!"
        ]
        const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)]
        const demoUser = `Listener${Math.floor(Math.random() * 10) + 1}`
        
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          user: demoUser,
          message: randomMessage,
          timestamp: new Date()
        }])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [chatMessages.length])

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

        {/* Room Display with Enhanced Listener Experience */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Room Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Now Playing Card */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Music className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{currentTrack}</h3>
                    <p className="text-muted-foreground">by {decodedArtist}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={hasLiked ? "text-red-500" : ""}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${hasLiked ? "fill-current" : ""}`} />
                        {likes}
                      </Button>
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        {roomUsers.length} listening
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Controls Card */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Playback Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="ghost" size="lg">
                      <SkipForward className="w-5 h-5 rotate-180" />
                    </Button>
                    <Button 
                      variant="default" 
                      size="lg" 
                      onClick={togglePlayPause}
                      className="w-16 h-16 rounded-full"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    <Button variant="ghost" size="lg">
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Volume Controls */}
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {isMuted ? 0 : volume}%
                    </span>
                  </div>

                  {/* Room Status */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      {isOwner ? 'You are hosting this room' : 'You are listening to this room'}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={copyRoomLink}
                      className="mr-2"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Room
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={copyRoomLink}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Chat Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-48 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/20">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="text-sm">
                        <span className="font-medium text-primary">{msg.user}:</span>
                        <span className="ml-2">{msg.message}</span>
                        <div className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    {chatMessages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      Send
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
