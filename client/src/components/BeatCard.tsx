import { useState } from "react";
import { Heart, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AudioPlayer from "./AudioPlayer";
import Waveform from "./Waveform";
import type { Beat } from "@shared/schema";

interface BeatCardProps {
  beat: Beat;
  featured?: boolean;
}

export default function BeatCard({ beat, featured = false }: BeatCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'lease' | 'exclusive'>('lease');
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const purchaseMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/purchases', data);
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: "Check your email for download instructions.",
      });
      setIsPurchaseModalOpen(false);
      setCustomerData({ name: '', email: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = async (type: 'lease' | 'exclusive') => {
    if (!customerData.name || !customerData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = type === 'lease' ? beat.leasePrice : beat.exclusivePrice;
    
    purchaseMutation.mutate({
      beatId: beat.id,
      type,
      amount,
      customerName: customerData.name,
      customerEmail: customerData.email,
    });
  };

  const cardSize = featured ? 'lg' : 'sm';

  return (
    <>
      <Card className={`bg-gray-800 border-gray-700 card-hover ${featured ? 'p-6' : 'p-4'}`}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1 flex-wrap">
              {beat.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorited(!isFavorited)}
              className="h-8 w-8"
            >
              <Heart 
                className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
              />
            </Button>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3 mb-3">
            <Waveform size={cardSize} color={beat.tags.includes('Hip Hop') ? 'primary' : beat.tags.includes('R&B') ? 'secondary' : 'accent'} />
            <AudioPlayer beatTitle={beat.title} duration={beat.duration} />
          </div>
          
          <h3 className={`font-semibold mb-2 ${featured ? 'text-xl' : 'text-sm'}`}>
            {beat.title}
          </h3>
          <div className={`text-gray-300 mb-3 ${featured ? 'text-sm' : 'text-xs'}`}>
            <div className="space-y-1">
              <div>
                BPM: <span>{beat.bpm}</span> | Key: <span>{beat.key}</span>
              </div>
              {featured && (
                <div className="text-xs text-gray-400">
                  Duration: {formatDuration(beat.duration)}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className={`flex gap-2 ${featured ? '' : 'flex-col sm:flex-row'}`}>
              <Button
                size={featured ? 'default' : 'sm'}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-xs"
                onClick={() => {
                  setPurchaseType('lease');
                  setIsPurchaseModalOpen(true);
                }}
              >
                Lease ${beat.leasePrice}
              </Button>
              <Button
                size={featured ? 'default' : 'sm'}
                className="flex-1 bg-accent hover:bg-accent/90 text-xs"
                onClick={() => {
                  setPurchaseType('exclusive');
                  setIsPurchaseModalOpen(true);
                }}
              >
                Buy ${beat.exclusivePrice}
              </Button>
            </div>
            <a 
              href="/api/usage-rules.pdf" 
              target="_blank"
              className="block text-center text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              <FileText className="inline mr-1 h-3 w-3" />
              Rules & Splits
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle>
              {purchaseType === 'lease' ? 'Lease' : 'Buy'} "{beat.title}"
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <div className="flex justify-between">
                <span>{purchaseType === 'lease' ? 'Lease License' : 'Exclusive Rights'}</span>
                <span>${purchaseType === 'lease' ? beat.leasePrice : beat.exclusivePrice}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsPurchaseModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => handlePurchase(purchaseType)}
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending ? 'Processing...' : 'Complete Purchase'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
