'use client'

import { useState } from "react"
import { LogIn, UserPlus, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/Header"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { toast } = useToast()

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Please enter email and password",
        variant: "destructive"
      })
      return
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        
        // Show success toast
        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.user.name}`,
        })

        // Redirect based on user role
        setTimeout(() => {
          switch (data.user.role) {
            case 'admin':
              window.location.href = '/admin'
              break
            case 'artist':
              window.location.href = '/account'
              break
            case 'client':
            default:
              window.location.href = '/'
              break
          }
        }, 1000)
      } else {
        // Show error toast
        toast({
          title: "Login Failed",
          description: data.message || "Invalid email or password",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signupData.name || !signupData.email || !signupData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      })
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive"
      })
      return
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Account Created Successfully!",
          description: "Welcome to SoundTrap! You can now login.",
        })
        
        // Clear form and switch to login
        setSignupData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        setIsLogin(true)
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Unable to create account. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">SoundTrap</CardTitle>
          <CardDescription>Login or create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "signup"} onValueChange={(val) => setIsLogin(val === "login")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                >
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

