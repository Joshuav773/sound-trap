'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Music, CloudUpload, Lock, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export default function AdminUpload() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    producer: '',
    bpm: '',
    key: '',
    tags: '',
    leasePrice: '',
    exclusivePrice: '',
    isFeatured: false,
  })

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      // For now, we'll simulate checking admin status
      // In production, this would check the JWT or session
      const adminKey = localStorage.getItem('adminKey')
      if (adminKey === 'prodbypending-admin-2024') {
        setIsAdmin(true)
      } else {
        // Redirect to home if not admin
        router.push('/')
      }
      setIsLoading(false)
    }
    checkAdmin()
  }, [router])

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const keys = ["C Major", "G Major", "D Minor", "A Minor", "F# Minor", "E Major", "B Minor", "Ab Major"]

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/admin/beats', {
        method: 'POST',
        body: data,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Upload failed')
      }

      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Beat Uploaded Successfully!",
        description: "Your beat is now live in SoundTrap.",
      })
      
      // Reset form
      setFile(null)
      setFormData({
        title: '',
        producer: '',
        bpm: '',
        key: '',
        tags: '',
        leasePrice: '',
        exclusivePrice: '',
        isFeatured: false,
      })
      
      // Invalidate queries to refresh the beat lists
      queryClient.invalidateQueries({ queryKey: ['/api/beats'] })
      queryClient.invalidateQueries({ queryKey: ['/api/beats/featured'] })
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile)
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        })
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select an audio file to upload.",
        variant: "destructive",
      })
      return
    }

    if (!formData.title || !formData.producer || !formData.bpm || !formData.key || !formData.leasePrice || !formData.exclusivePrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const data = new FormData()
    data.append('beatFile', file)
    data.append('title', formData.title)
    data.append('producer', formData.producer)
    data.append('bpm', formData.bpm)
    data.append('key', formData.key)
    data.append('tags', formData.tags)
    data.append('leasePrice', formData.leasePrice)
    data.append('exclusivePrice', formData.exclusivePrice)
    data.append('isFeatured', formData.isFeatured.toString())
    data.append('duration', '150') // Default duration

    uploadMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('adminKey')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold flex items-center">
                <Music className="mr-3 text-primary" />
                SoundTrap
              </h1>
              <div className="flex items-center space-x-2 text-primary">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Admin Panel</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Upload New Beat</CardTitle>
              <p className="text-muted-foreground">Add fresh beats by prodbypending...</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                  <Label>Beat File*</Label>
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer mt-2"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <CloudUpload className="mx-auto text-muted-foreground mb-2 h-8 w-8" />
                    <p className="text-muted-foreground text-sm">
                      {file ? file.name : "Drop your beat file here or click to browse"}
                    </p>
                    <input
                      id="file-input"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {/* Beat Title and Producer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Beat Title*</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-2"
                      placeholder="Enter beat title"
                      required
                      data-testid="input-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="producer">Producer*</Label>
                    <Input
                      id="producer"
                      value={formData.producer}
                      onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                      className="mt-2"
                      placeholder="prodbypending..."
                      required
                      data-testid="input-producer"
                    />
                  </div>
                </div>
                
                {/* BPM and Key */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bpm">BPM*</Label>
                    <Input
                      id="bpm"
                      type="number"
                      value={formData.bpm}
                      onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                      className="mt-2"
                      placeholder="120"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="key">Key*</Label>
                    <Select
                      value={formData.key}
                      onValueChange={(value) => setFormData({ ...formData, key: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select Key" />
                      </SelectTrigger>
                      <SelectContent>
                        {keys.map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="mt-2"
                    placeholder="Hip Hop, Trap, Dark"
                  />
                </div>
                
                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leasePrice">Lease Price ($)*</Label>
                    <Input
                      id="leasePrice"
                      type="number"
                      step="0.01"
                      value={formData.leasePrice}
                      onChange={(e) => setFormData({ ...formData, leasePrice: e.target.value })}
                      className="mt-2"
                      placeholder="29.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="exclusivePrice">Exclusive Price ($)*</Label>
                    <Input
                      id="exclusivePrice"
                      type="number"
                      step="0.01"
                      value={formData.exclusivePrice}
                      onChange={(e) => setFormData({ ...formData, exclusivePrice: e.target.value })}
                      className="mt-2"
                      placeholder="199.00"
                      required
                    />
                  </div>
                </div>
                
                {/* Featured Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                  <Label htmlFor="featured">Feature this beat</Label>
                </div>
                
                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3"
                  disabled={uploadMutation.isPending}
                  size="lg"
                >
                  {uploadMutation.isPending ? 'Uploading beat...' : 'Upload Beat'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

