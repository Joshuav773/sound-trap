'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Music, Radio, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [isListeningRoom, setIsListeningRoom] = useState(false)
  const [artistName, setArtistName] = useState('')

  useEffect(() => {
    // Check if this is a listening room URL
    const path = window.location.pathname
    if (path.includes('/listening-room')) {
      setIsListeningRoom(true)
      // Extract artist name from URL
      const pathParts = path.split('/')
      if (pathParts.length >= 2) {
        setArtistName(decodeURIComponent(pathParts[1]))
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-destructive/20 rounded-full flex items-center justify-center">
              {isListeningRoom ? (
                <Radio className="w-12 h-12 text-destructive" />
              ) : (
                <Music className="w-12 h-12 text-destructive" />
              )}
            </div>
            
            <CardTitle className="text-4xl font-bold text-destructive mb-2">404</CardTitle>
            <h2 className="text-xl font-semibold mb-4">
              {isListeningRoom ? 'Listening Room Not Available' : 'Page Not Found'}
            </h2>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {isListeningRoom ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Room Status</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {artistName ? `${artistName}'s listening room` : 'This listening room'} is currently not active.
                  </p>
                </div>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>The room may have ended or hasn't been started yet.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    <span>Only the artist can start their listening room.</span>
                  </div>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  💡 Tip: Check back later or ask the artist to go live
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            )}
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Browse Beats
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/pending-store">
                  <Music className="mr-2 h-4 w-4" />
                  Visit Pending Store
                </Link>
              </Button>
              
              <Button variant="ghost" onClick={() => window.history.back()} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {isListeningRoom 
                  ? "Looking for live music? Browse our catalog of beats and sound kits."
                  : "Need help? Try browsing our beats or check out the pending store."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
