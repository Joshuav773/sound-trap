'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/utils'
import { Upload, Search, Music, Clock, Key } from 'lucide-react'
import type { Beat } from '@shared/schema'

interface SearchBySoundProps {
  onResults?: (results: Beat[]) => void
}

export default function SearchBySound({ onResults }: SearchBySoundProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('audio', file)
      
      return apiRequest('PUT', '/api/search-by-sound', formData)
    },
    onSuccess: (data) => {
      setAnalysisResults(data)
      setIsAnalyzing(false)
      toast({
        title: "Audio Analysis Complete",
        description: "Your audio has been analyzed. Click 'Find Similar Beats' to search.",
      })
    },
    onError: (error: any) => {
      setIsAnalyzing(false)
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze audio file.",
        variant: "destructive",
      })
    },
  })

  const searchMutation = useMutation({
    mutationFn: async (audioData: any) => {
      return apiRequest('POST', '/api/search-by-sound', audioData)
    },
    onSuccess: (data) => {
      onResults?.(data.results)
      toast({
        title: "Search Complete",
        description: `Found ${data.totalMatches} similar beats`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search for similar beats.",
        variant: "destructive",
      })
    },
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }

      setAudioFile(file)
    }
  }

  const handleAnalyze = () => {
    if (!audioFile) return
    
    setIsAnalyzing(true)
    analyzeMutation.mutate(audioFile)
  }

  const handleSearch = () => {
    if (!analysisResults) return
    
    searchMutation.mutate({
      audioFile: audioFile?.name,
      searchType: 'similarity'
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Search by Sound
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload an audio file to find similar beats using AI-powered matching
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="audio-upload">Upload Audio File</Label>
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              id="audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button
              onClick={handleAnalyze}
              disabled={!audioFile || isAnalyzing}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
          {audioFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Analysis Results */}
        {analysisResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="font-medium">Analysis Results</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Tempo: {analysisResults.features?.tempo || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Key: {analysisResults.features?.key || 'Unknown'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">Genre: {analysisResults.features?.genre || 'Detecting...'}</Badge>
              <Badge variant="outline">Mood: {analysisResults.features?.mood || 'Detecting...'}</Badge>
            </div>

            <Button
              onClick={handleSearch}
              disabled={searchMutation.isPending}
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              {searchMutation.isPending ? 'Searching...' : 'Find Similar Beats'}
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>How it works:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Upload an audio file (MP3, WAV, etc.)</li>
            <li>Our AI analyzes tempo, key, genre, and mood</li>
            <li>Find beats with similar characteristics</li>
            <li>Discover new producers and styles</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
