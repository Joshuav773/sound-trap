'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-destructive/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
          
          <p className="text-muted-foreground mb-6">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          
          <div className="space-y-3">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
