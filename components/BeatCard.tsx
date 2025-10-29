'use client'

import { useState, useEffect } from "react";
import { Heart, FileText, Users, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/utils";
import AudioPlayer from "./AudioPlayer";
import Waveform from "./Waveform";
import VerificationBadge from "./VerificationBadge";
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
  const [isRoomOpen, setIsRoomOpen] = useState(false);

  const { toast } = useToast();
  
  // Check if the producer's room is open
  useEffect(() => {
    const roomStorageKey = `listening-room-${beat.producer.toLowerCase()}`;
    const checkRoomStatus = () => {
      const roomData = localStorage.getItem(roomStorageKey);
      if (roomData) {
        const room = JSON.parse(roomData);
        setIsRoomOpen(room.isOpen === true);
      } else {
        setIsRoomOpen(false);
      }
    };
    
    checkRoomStatus();
    
    // Check periodically for room status changes
    const interval = setInterval(checkRoomStatus, 2000);
    
    return () => clearInterval(interval);
  }, [beat.producer]);
  
  const handleAddToCart = (type: 'lease' | 'exclusive') => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.findIndex((item: any) => 
      item.beatId === beat.id && item.type === type
    )
    
    if (existingItem !== -1) {
      cart[existingItem].quantity += 1
    } else {
      cart.push({ beatId: beat.id, type, quantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    toast({
      title: "Added to cart!",
      description: `${beat.title} added to your cart`,
    })
  };

  const handleTryBeforeYouBuy = async () => {
    try {
      // Track the download
      await apiRequest('POST', '/api/trial-downloads', {
        beatId: beat.id,
        customerEmail: customerData.email,
        customerName: customerData.name,
      });

      // In production, this would download a tagged MP3 file
      // For now, we'll just show a success message
      toast({
        title: "Free Demo Downloaded!",
        description: "A tagged demo of this beat has been added to your downloads",
      });
    } catch (error) {
      toast({
        title: "Demo Download Failed",
        description: "Failed to download demo. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  return (
    <>
      <Card className={`bg-card border-border card-hover ${featured ? 'min-h-[350px]' : 'h-auto'} transition-all duration-300`}>
        <CardContent className={featured ? 'p-6' : 'p-4'}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1 flex-wrap">
              {beat.tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className={`text-xs ${
                    tag.toLowerCase().includes('trap') ? 'bg-primary/20 text-primary border-primary/30' :
                    tag.toLowerCase().includes('hip hop') ? 'bg-secondary/20 text-secondary border-secondary/30' :
                    'bg-accent/20 text-accent border-accent/30'
                  }`}
                >
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
                className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'}`} 
              />
            </Button>
          </div>
          
          <div className="bg-muted rounded-lg p-3 mb-3">
            <Waveform 
              size={featured ? 'lg' : 'sm'} 
              color={beat.tags.some(t => t.toLowerCase().includes('trap')) ? 'primary' : 
                    beat.tags.some(t => t.toLowerCase().includes('hip hop')) ? 'secondary' : 'accent'} 
            />
            <AudioPlayer beatTitle={beat.title} duration={beat.duration} />
          </div>
          
          <h3 className={`font-bold mb-1 ${featured ? 'text-xl' : 'text-lg'} text-foreground`}>
            {beat.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-muted-foreground text-xs" data-testid={`text-producer-${beat.id}`}>
              by <a href={`/${encodeURIComponent(beat.producer)}`} className="hover:text-primary transition-colors font-medium">{beat.producer}</a>
            </p>
            {/* TODO: Add verification status when we have producer data */}
            {/* <VerificationBadge badge="verified" size="sm" /> */}
          </div>
          <div className={`text-foreground/80 mb-3 ${featured ? 'text-sm' : 'text-xs'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">{beat.bpm} BPM</span>
              <span className="text-muted-foreground">|</span>
              <span className="font-medium">{beat.key}</span>
              {featured && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(beat.duration)}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              size={featured ? 'default' : 'sm'}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10 font-medium"
              onClick={handleTryBeforeYouBuy}
            >
              <Download className="mr-2 h-4 w-4" />
                     Free Demo
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size={featured ? 'default' : 'sm'}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold"
                onClick={() => handleAddToCart('lease')}
              >
                Add ${beat.leasePrice}
              </Button>
              <Button
                size={featured ? 'default' : 'sm'}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                onClick={() => handleAddToCart('exclusive')}
              >
                Add ${beat.exclusivePrice}
              </Button>
            </div>
            <a 
              href="/api/usage-rules.pdf" 
              target="_blank"
              className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
            >
              <FileText className="inline mr-1 h-3 w-3" />
              License Terms & Splits
            </a>
            {isRoomOpen && (
              <a 
                href={`/${encodeURIComponent(beat.producer)}/listening-room`}
                className="block text-center text-xs text-primary hover:underline transition-colors"
              >
                <Users className="inline mr-1 h-3 w-3" />
                Join {beat.producer}'s Room
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {purchaseType === 'lease' ? 'Lease License' : 'Exclusive Rights'} - "{beat.title}"
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg border border-border">
              <h4 className="font-semibold mb-2 text-foreground">Order Summary</h4>
              <div className="flex justify-between items-center">
                <span className="text-foreground">{purchaseType === 'lease' ? 'Lease License' : 'Exclusive Rights'}</span>
                <span className="text-lg font-bold text-primary">
                  ${purchaseType === 'lease' ? beat.leasePrice : beat.exclusivePrice}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="bg-background border-border"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  className="bg-background border-border"
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
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
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