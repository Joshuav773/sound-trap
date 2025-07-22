import { useState } from "react";
import { Music, CloudUpload, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    bpm: '',
    key: '',
    tags: '',
    leasePrice: '',
    exclusivePrice: '',
    isFeatured: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const keys = ["C Major", "G Major", "D Minor", "A Minor", "F# Minor", "E Major", "B Minor", "Ab Major"];

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/admin/beats', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Beat Uploaded Successfully!",
        description: "Your beat is now live in SoundTrap.",
      });
      
      // Reset form
      setFile(null);
      setFormData({
        title: '',
        bpm: '',
        key: '',
        tags: '',
        leasePrice: '',
        exclusivePrice: '',
        isFeatured: false,
      });
      
      // Invalidate queries to refresh the beat lists
      queryClient.invalidateQueries({ queryKey: ['/api/beats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/beats/featured'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select an audio file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.bpm || !formData.key || !formData.leasePrice || !formData.exclusivePrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append('beatFile', file);
    data.append('title', formData.title);
    data.append('bpm', formData.bpm);
    data.append('key', formData.key);
    data.append('tags', formData.tags);
    data.append('leasePrice', formData.leasePrice);
    data.append('exclusivePrice', formData.exclusivePrice);
    data.append('isFeatured', formData.isFeatured.toString());
    data.append('duration', '150'); // Default duration

    uploadMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold gradient-text flex items-center">
              <Music className="mr-3 text-accent" />
              SoundTrap
            </h1>
            <div className="flex items-center space-x-2 text-primary">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Admin Panel</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">Upload New Beat</CardTitle>
              <p className="text-gray-400">Add fresh beats to the SoundTrap collection</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                  <Label className="text-white">Beat File*</Label>
                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer mt-2"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <CloudUpload className="mx-auto text-gray-400 mb-2 h-8 w-8" />
                    <p className="text-gray-400 text-sm">
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
                
                {/* Beat Title */}
                <div>
                  <Label htmlFor="title" className="text-white">Beat Title*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    placeholder="Enter beat title"
                    required
                  />
                </div>
                
                {/* BPM and Key */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bpm" className="text-white">BPM*</Label>
                    <Input
                      id="bpm"
                      type="number"
                      value={formData.bpm}
                      onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white mt-2"
                      placeholder="120"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="key" className="text-white">Key*</Label>
                    <Select
                      value={formData.key}
                      onValueChange={(value) => setFormData({ ...formData, key: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-2">
                        <SelectValue placeholder="Select Key" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {keys.map((key) => (
                          <SelectItem key={key} value={key} className="text-white hover:bg-gray-700">
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <Label htmlFor="tags" className="text-white">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    placeholder="Hip Hop, Trap, Dark"
                  />
                </div>
                
                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leasePrice" className="text-white">Lease Price ($)*</Label>
                    <Input
                      id="leasePrice"
                      type="number"
                      step="0.01"
                      value={formData.leasePrice}
                      onChange={(e) => setFormData({ ...formData, leasePrice: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white mt-2"
                      placeholder="29.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="exclusivePrice" className="text-white">Exclusive Price ($)*</Label>
                    <Input
                      id="exclusivePrice"
                      type="number"
                      step="0.01"
                      value={formData.exclusivePrice}
                      onChange={(e) => setFormData({ ...formData, exclusivePrice: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white mt-2"
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
                  <Label htmlFor="featured" className="text-white">Feature this beat</Label>
                </div>
                
                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3"
                  disabled={uploadMutation.isPending}
                  size="lg"
                >
                  {uploadMutation.isPending ? 'Uploading to the trap...' : 'Upload Beat'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}