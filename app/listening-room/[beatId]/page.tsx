'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Users, Volume2, Pause, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"

export default function ListeningRoom() {
  const params = useParams()
  const beatId = params.beatId as string
  const [isPlaying, setIsPlaying] = useState(false)
  const [roomUsers, setRoomUsers] = useState([
    { name: 'Pending', status: 'listening' },
    { name: 'Artist123', status: 'listening' }
  ])

  const { data: beat } = useQuery({
    queryKey: [`/api/beats/${beatId}`],
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would use WebSockets or similar
      if (Math.random() > 0.7) {
        setRoomUsers(prev => [...prev, { name: `User${prev.length + 1}`, status: 'listening' }])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  if (!beat) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Listening Room</h1>
          <Badge className="bg-primary text-primary-foreground">
            <Users className="mr-2 h-4 w-4" />
            {roomUsers.length} listening
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-2">{beat.title}</h2>
                  <p className="text-muted-foreground">by {beat.producer}</p>
                </div>

                <div className="bg-muted rounded-lg p-4 mb-4">
                  {/* Waveform placeholder */}
                  <div className="flex items-end h-24 gap-1">
                    {[...Array(32)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary rounded-t"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full mb-4"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Play Beat
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">BPM:</span>
                    <span className="ml-2 font-semibold">{beat.bpm}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Key:</span>
                    <span className="ml-2 font-semibold">{beat.key}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2 font-semibold">{Math.floor(beat.duration / 60)}:{String(beat.duration % 60).padStart(2, '0')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <span className="ml-2 font-semibold">${beat.leasePrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Sidebar */}
          <div>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Volume2 className="mr-2 h-4 w-4" />
                  Live Listeners
                </h3>
                <div className="space-y-2">
                  {roomUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">{user.status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Share This Room</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Invite others to listen together
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Room link copied!')
                  }}
                >
                  Copy Room Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

