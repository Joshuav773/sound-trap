'use client'

import { useState, useEffect } from "react"
import { ShoppingCart, Trash2, CreditCard, Plus, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/utils"
import type { Beat } from "@shared/schema"
import Header from "@/components/Header"

interface CartItem {
  beatId: number
  type: 'lease' | 'exclusive'
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const getCartBeats = () => {
    const beats = cartItems.map(item => {
      // In production, fetch from API
      return item.beatId
    })
    return beats
  }

  const fetchBeat = async (beatId: number) => {
    const response = await fetch(`/api/beats/${beatId}`)
    return response.json()
  }

  const { data: beats, isLoading } = useQuery<Beat[]>({
    queryKey: ['/api/beats'],
    queryFn: async () => {
      if (cartItems.length === 0) return []
      const beatPromises = cartItems.map(item => fetchBeat(item.beatId))
      return Promise.all(beatPromises)
    }
  })

  const removeFromCart = (beatId: number, type: string) => {
    setCartItems(prev => prev.filter(item => !(item.beatId === beatId && item.type === type)))
    toast({
      title: "Removed from cart",
      description: "Item removed successfully"
    })
  }

  const updateQuantity = (beatId: number, type: string, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.beatId === beatId && item.type === type
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ))
  }

  const getCartTotal = () => {
    if (!beats) return 0
    return cartItems.reduce((total, item) => {
      const beat = beats.find(b => b.id === item.beatId)
      if (!beat) return total
      const price = item.type === 'lease' ? parseFloat(beat.leasePrice) : parseFloat(beat.exclusivePrice)
      return total + (price * item.quantity)
    }, 0)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart first.",
        variant: "destructive"
      })
      return
    }

    if (!customerData.name || !customerData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and email.",
        variant: "destructive"
      })
      return
    }

    // Process all purchases
    const purchases = cartItems.map(item => {
      const beat = beats?.find(b => b.id === item.beatId)
      if (!beat) return null
      return {
        beatId: item.beatId,
        type: item.type,
        amount: item.type === 'lease' ? beat.leasePrice : beat.exclusivePrice,
        customerName: customerData.name,
        customerEmail: customerData.email,
      }
    }).filter(Boolean)

    try {
      // Process purchases
      for (const purchase of purchases) {
        await apiRequest('POST', '/api/purchases', purchase)
      }

      toast({
        title: "Purchase Successful!",
        description: "Check your email for download instructions.",
      })

      // Clear cart
      localStorage.removeItem('cart')
      setCartItems([])
      setCustomerData({ name: '', email: '' })
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getCartSummary = () => {
    if (!beats) return []
    
    return cartItems.map(item => {
      const beat = beats.find(b => b.id === item.beatId)
      if (!beat) return null
      const price = item.type === 'lease' ? parseFloat(beat.leasePrice) : parseFloat(beat.exclusivePrice)
      return {
        beat,
        type: item.type,
        quantity: item.quantity,
        price,
        total: price * item.quantity
      }
    }).filter(Boolean)
  }

  const summary = getCartSummary()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <ShoppingCart className="mr-3" />
          Your Cart
        </h1>
        <p className="text-muted-foreground mb-8">Review your selected beats</p>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">Add some beats to get started!</p>
              <Button onClick={() => window.location.href = '/'}>
                Browse Beats
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {summary.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{item?.beat?.title || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground mb-2">by {item?.beat?.producer || 'Unknown'}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant={item?.type === 'lease' ? 'secondary' : 'default'}>
                            {item?.type === 'lease' ? 'Lease License' : 'Exclusive Rights'}
                          </Badge>
                          <span className="text-muted-foreground">
                            {item?.beat?.bpm || 'N/A'} BPM | {item?.beat?.key || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => item?.beat?.id && item?.type && updateQuantity(item.beat.id, item.type, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item?.quantity || 0}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => item?.beat?.id && item?.type && updateQuantity(item.beat.id, item.type, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xl font-bold text-primary">${item?.total?.toFixed(2) || '0.00'}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-destructive hover:text-destructive"
                          onClick={() => item?.beat?.id && item?.type && removeFromCart(item.beat.id, item.type)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Checkout Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {summary.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item?.beat?.title || 'Unknown'} x{item?.quantity || 0}
                        </span>
                        <span>${item?.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="cart-name">Full Name</Label>
                      <Input
                        id="cart-name"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cart-email">Email</Label>
                      <Input
                        id="cart-email"
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handleCheckout}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Complete Purchase
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

