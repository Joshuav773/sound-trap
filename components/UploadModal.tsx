'use client'

import { useState } from "react";
import { X, Upload, CloudUpload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
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
      const response = await fetch('/api/beats', {
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
        description: "Your beat is now available in the marketplace.",
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
      
      onClose();
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
    
    // Estimate duration - in real app you'd extract this from the audio file
    data.append('duration', '150'); // Default 2.5 minutes

    uploadMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Upload New Beat
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Beat File</Label>
            <div 
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <CloudUpload className="mx-auto text-3xl text-gray-400 mb-2 h-8 w-8" />
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
          
          <div>
            <Label htmlFor="title">Beat Title*</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-gray-700 border-gray-600"
              placeholder="Enter beat title"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bpm">BPM*</Label>
              <Input
                id="bpm"
                type="number"
                value={formData.bpm}
                onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                className="bg-gray-700 border-gray-600"
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
                <SelectTrigger className="bg-gray-700 border-gray-600">
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
          
          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="bg-gray-700 border-gray-600"
              placeholder="hip hop, trap, dark"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leasePrice">Lease Price ($)*</Label>
              <Input
                id="leasePrice"
                type="number"
                step="0.01"
                value={formData.leasePrice}
                onChange={(e) => setFormData({ ...formData, leasePrice: e.target.value })}
                className="bg-gray-700 border-gray-600"
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
                className="bg-gray-700 border-gray-600"
                placeholder="199.00"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Beat'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
